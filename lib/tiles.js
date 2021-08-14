import zarr from 'zarr-js'
import xhr from 'xhr-request'
import {
  zoomToLevel,
  keyToTile,
  tileToKey,
  pointToCamera,
  pointToTile,
  getSiblings,
} from './utils'

const remote = 'https://carbonplan.blob.core.windows.net/'
const bucket = 'carbonplan-scratch/'
const prefix = 'zarr-mapbox-webgl/'

export const createTiles = (regl, opts) => {
	return new Tiles(opts)

	function Tiles({ size, maxZoom, display, colormap, clim, opacity }) {
		this.tiles = {}
		this.loaders = {}
		this.active = []
		this.size = size
		this.display = display
		this.maxZoom = maxZoom
		this.clim = clim
		this.opacity = opacity
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

    const levels = Array(maxZoom + 1).fill().map((_,i) => i)

    const uris = levels.map((d) => remote + bucket + prefix + '128/' + d)

    zarr(xhr).openList(uris, (err, loaders) => {
      loaders.map((d, i) => (this.loaders[i] = d))
    })

    levels.map((z) => {
      Array(Math.pow(2, z))
        .fill(0)
        .map((_, x) => {
          Array(Math.pow(2, z))
            .fill(0)
            .map((_, y) => {
              const key = [x, y, z].join(',')
              this.tiles[key] = {
                value: regl.buffer(),
                cached: false,
                loading: false,
                ready: false,
              }
            })
        })
    })

    this.drawTiles = regl({
			vert: `
	      precision mediump float;
	      attribute vec2 position;
	      attribute float value;
	      varying float fragValue;
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
	        fragValue = value;
	        gl_PointSize = 1.0 * scale * magnification;
	        gl_Position = vec4(x, y, 0.0, 1.0);
	      }`,

	     frag: `
	      precision mediump float;
	      uniform float opacity;
	      uniform sampler2D colormap;
	      uniform vec2 clim;
	      varying float fragValue;
	      void main() {
	        float rescaled = (fragValue - clim.x)/(clim.y - clim.x);
	        if (rescaled < 0.0) {
	          discard; 
	        }
	        vec4 c = texture2D(colormap, vec2(rescaled, 1.0));
	        gl_FragColor = vec4(c.x, c.y, c.z, opacity);
	        gl_FragColor.rgb *= gl_FragColor.a;
	      }`,

	     	attributes: {
	        position: regl.this('position'),
	        value: regl.prop('value'),
	      },

	      uniforms: {
	        viewportWidth: regl.context('viewportWidth'),
	        viewportHeight: regl.context('viewportHeight'),
	        pixelRatio: regl.context('pixelRatio'),
	        colormap: regl.this('colormap'),
	        clim: regl.this('clim'),
	        camera: regl.this('camera'),
	        size: regl.this('size'),
	        opacity: regl.this('opacity'),
	        zoom: regl.this('zoom'),
	        level: regl.this('level'),
	        offset: regl.prop('offset'),
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

	  this.update = ({center, zoom}) => {
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
	      const tileIndex = keyToTile(key)
	      const tile = this.tiles[key]
	      tile.offset = [tileIndex[0], tileIndex[1]]
	      tile.ready = true
	      if (this.loaders[level]) {
	        if (!tile.cached) {
	          if (!tile.loading) {
	            tile.loading = true
	            this.loaders[level]([tileIndex[1], tileIndex[0]], (err, chunk) => {
	              tile.value(chunk)
	              tile.cached = true
	              tile.loading = false
	            })
	          }
	        }
	      }
	    })
	  }

		this.renderedTick = 0
		regl.frame(({ tick }) => {
   		this.tick = tick
  	})
	}
}
