import zarr from 'zarr-js'
import pupa from 'pupa'
import xhr from 'xhr-request'
import {
  zoomToLevel,
  keyToTile,
  tileToKey,
  pointToCamera,
  pointToTile,
  getSiblings,
} from './utils'

export const createTiles = (regl, opts) => {
  return new Tiles(opts)

  function Tiles({
    size,
    source,
    maxZoom,
    display,
    colormap,
    clim,
    opacity,
    uniforms = {},
    frag,
    ndim = 2,
    variables = ['value'],
  }) {
    this.tiles = {}
    this.loaders = {}
    this.active = []
    this.size = size
    this.display = display
    this.maxZoom = maxZoom
    this.clim = clim
    this.opacity = opacity
    this.variables = variables
    this.ndim = ndim
    this.uniforms = Object.keys(uniforms)
    this.colormap = regl.texture({
      data: colormap,
      format: 'rgb',
      shape: [255, 1],
    })

    let position = []
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        position.push([j + 0.5, i + 0.5])
      }
    }

    const count = position.length
    this.position = regl.buffer(position)
    this.count = count

    const extraAttributes = {}
    this.variables.forEach(
      (k) => (extraAttributes[k + 'Attribute'] = regl.prop(k + 'Attribute'))
    )

    const extraUniforms = {}
    this.uniforms.forEach((k) => (extraUniforms[k] = regl.this(k)))

    const vertDeclaration = this.variables
      .map(
        (k) => `
    	attribute float ${k}Attribute;
    	varying float ${k};
    `
      )
      .reduce((a, b) => a + b, ``)

    const vertAssignment = this.variables
      .map(
        (k) => `
    	${k} = ${k}Attribute;
    `
      )
      .reduce((a, b) => a + b, ``)

    const fragDeclaration =
      this.variables
        .map(
          (k) => `
    	varying float ${k};
    `
        )
        .reduce((a, b) => a + b, ``) +
      this.uniforms
        .map(
          (k) => `
    	uniform float ${k};
    `
        )
        .reduce((a, b) => a + b, ``)

    const defaultFrag = `
      float rescaled = (${this.variables[0]} - clim.x)/(clim.y - clim.x);
      vec4 c = texture2D(colormap, vec2(rescaled, 1.0));	
      gl_FragColor = vec4(c.x, c.y, c.z, opacity);
      gl_FragColor.rgb *= gl_FragColor.a;
    `

    const levels = Array(maxZoom + 1)
      .fill()
      .map((_, i) => i)

    const uris = levels.map((d) => pupa(source, { z: d }))

    zarr(xhr).openList(uris, (err, loaders) => {
      levels.map((z) => {
        Array(Math.pow(2, z))
          .fill(0)
          .map((_, x) => {
            Array(Math.pow(2, z))
              .fill(0)
              .map((_, y) => {
                const key = [x, y, z].join(',')
                const buffers = {}
                this.variables.forEach(
                  (k) => (buffers[k + 'Attribute'] = regl.buffer())
                )
                this.tiles[key] = {
                  cached: false,
                  loading: false,
                  ready: false,
                  ...buffers,
                }
              })
          })
      })
      loaders.map((d, i) => (this.loaders[i] = d))
    })

    this.drawTiles = regl({
      vert: `
	      precision mediump float;
	      attribute vec2 position;
	      ${vertDeclaration}
	      uniform vec2 camera;
	      uniform float viewportWidth;
	      uniform float viewportHeight;
	      uniform float pixelRatio;
	      uniform float zoom;
	      uniform float size;
	      uniform float level;
	      uniform vec2 offset;
	      void main() {
	        float x = position.x - camera.x * size + offset.x * size;
	        float y = position.y - camera.y * size + offset.y * size;
	        float scale = pixelRatio * 512.0 / size;
	        float magnification = pow(2.0, zoom - level);
	        x = (scale * x * magnification);
	        y = (scale * y * magnification);
	        x = (2.0 * x / viewportWidth);
	        y = -(2.0 * y / viewportHeight);
	        ${vertAssignment}
	        gl_PointSize = 1.0 * scale * magnification;
	        gl_Position = vec4(x, y, 0.0, 1.0);
	      }`,

      frag: `
	      precision mediump float;
	      uniform float opacity;
	      uniform sampler2D colormap;
	      uniform vec2 clim;
	      ${fragDeclaration}
	      void main() {
	      ${frag || defaultFrag}
	     	}`,

      attributes: {
        position: regl.this('position'),
        ...extraAttributes,
      },

      uniforms: {
        viewportWidth: regl.context('viewportWidth'),
        viewportHeight: regl.context('viewportHeight'),
        pixelRatio: regl.context('pixelRatio'),
        colormap: regl.this('colormap'),
        camera: regl.this('camera'),
        size: regl.this('size'),
        zoom: regl.this('zoom'),
        level: regl.this('level'),
        offset: regl.prop('offset'),
        clim: regl.this('clim'),
        opacity: regl.this('opacity'),
        ...extraUniforms,
      },

      blend: {
        enable: true,
        func: {
          src: 'one',
          srcAlpha: 'one',
          dstRGB: 'one minus src alpha',
          dstAlpha: 'one minus src alpha',
        },
      },

      depth: { enable: false },

      count: regl.this('count'),

      primitive: 'points',
    })

    this.draw = () => {
      if (this.display) {
        this.drawTiles(
          Object.keys(this.tiles)
            .filter((key) => this.active.includes(key) && this.tiles[key].ready)
            .map((key) => this.tiles[key])
        )
      } else {
        regl.clear({
          color: [0, 0, 0, 0],
          depth: 1,
        })
      }
    }

    this.updateCamera = ({ center, zoom }) => {
      const level = zoomToLevel(zoom, this.maxZoom)
      const tile = pointToTile(center.lng, center.lat, level)
      const camera = pointToCamera(center.lng, center.lat, level)

      this.level = level
      this.zoom = zoom
      this.camera = [camera[0], camera[1]]

      if (level === 0) {
        this.active = [tileToKey(tile)]
      } else {
        this.active = getSiblings(tile)
      }
      this.active.map((key) => {
        if (this.loaders[level]) {
          const tileIndex = keyToTile(key)
          const tile = this.tiles[key]
          const accessor =
            this.ndim > 2 ? (d, i) => d.pick(i, null, null) : (d) => d
          const chunk =
            this.ndim > 2
              ? [0, tileIndex[1], tileIndex[0]]
              : [tileIndex[1], tileIndex[0]]
          tile.offset = [tileIndex[0], tileIndex[1]]
          tile.ready = true
          if (!tile.cached) {
            if (!tile.loading) {
              tile.loading = true
              this.loaders[level](chunk, (err, data) => {
                this.variables.forEach((k, i) => {
                  tile[k + 'Attribute'](accessor(data, i))
                })
                tile.cached = true
                tile.loading = false
                this.redraw()
              })
            }
          }
        }
      })
    }

    this.updateStyle = (props) => {
      Object.keys(props).forEach((k) => {
        this[k] = props[k]
      })
    }

    this.updateUniforms = (props) => {
      Object.keys(props).forEach((k) => {
        this[k] = props[k]
      })
    }

    this.updateColormap = ({ colormap }) => {
      this.colormap = regl.texture({
        data: colormap,
        format: 'rgb',
        shape: [255, 1],
      })
    }

    this.redraw = () => {
      if (this.renderedTick !== this.tick) {
        this.draw()
        this.renderedTick = this.tick
      }
    }

    this.renderedTick = 0
    regl.frame(({ tick }) => {
      this.tick = tick
    })
  }
}
