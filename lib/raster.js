import { PureComponent } from 'react'
import { ReglContext } from './regl'
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

class Raster extends PureComponent {
  static contextType = ReglContext

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { regl } = this.context
    const { size, zoom, maxZoom, brightness, type, center, display = true } = this.props

    this.regl = regl
    this.tiles = {}
    this.loaders = {}
    this.active = []
    this.display = display
    this.maxZoom = maxZoom

    const levels = [0, 1, 2, 3, 4, 5]
    const uris = levels.map((d) => remote + bucket + prefix + '128/' + d)

    zarr(xhr).openList(uris, (err, loaders) => {
      loaders.map((d, i) => (this.loaders[i] = d))
    })

    let position = []
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        position.push([j + 0.5, i + 0.5])
      }
    }

    const count = position.length
    position = regl.buffer(position)

    levels.map((z) => {
      Array(Math.pow(2, z))
        .fill(0)
        .map((_, x) => {
          Array(Math.pow(2, z))
            .fill(0)
            .map((_, y) => {
              const key = [x, y, z].join(',')
              this.tiles[key] = {
                position: position,
                count: count,
                size: size,
                zoom: zoom,
                brightness: brightness,
                camera: pointToCamera(center),
                level: zoomToLevel(zoom, maxZoom),
                value: regl.buffer(),
                cached: false,
                loading: false,
              }
            })
        })
    })

    let circlify = ''
    if (type === 'circles') {
      circlify = `
      if (length(gl_PointCoord.xy - 0.5) > 0.5) {
        discard;
      }`
    }

    const drawGrid = regl({
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
        gl_PointSize = 0.8 * scale * magnification;
        gl_Position = vec4(x, y, 0.0, 1.0);
      }`,

      frag: `
      precision mediump float;
      uniform float brightness;
      varying float fragValue;
      void main() {
        ${circlify}
        if (fragValue < 0.0) {
          discard; 
        }
        gl_FragColor = vec4(brightness * fragValue / 20.0, 0.0, 0.0, 0.5);
        gl_FragColor.rgb *= gl_FragColor.a;
      }`,

      attributes: {
        position: regl.prop('position'),
        value: regl.prop('value'),
      },

      uniforms: {
        viewportWidth: regl.context('viewportWidth'),
        viewportHeight: regl.context('viewportHeight'),
        pixelRatio: regl.context('pixelRatio'),
        camera: regl.prop('camera'),
        size: regl.prop('size'),
        brightness: regl.prop('brightness'),
        zoom: regl.prop('zoom'),
        level: regl.prop('level'),
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

      count: regl.prop('count'),

      primitive: 'points',
    })

    this.draw = () => {
      if (this.display) {
        drawGrid(
          Object.keys(this.tiles)
            .filter((key) => this.active.includes(key))
            .map((key) => this.tiles[key])
          ) 
        } else {
        regl.clear({
          color: [0, 0, 0, 0],
          depth: 1
        })
      }
    }

    this.renderedTick = 0
    regl.frame(({tick}) => {
      this.tick = tick
    })
  }

  componentDidUpdate(prev) {
    this.display = this.props.display

    // identify which tiles to show
    const center = this.props.center
    const level = zoomToLevel(this.props.zoom, this.maxZoom)
    const tile = pointToTile(center.lng, center.lat, level)
    const tileFraction = pointToCamera(center.lng, center.lat, level)
    if (level === 0) {
      this.active = [tileToKey(tile)]
    } else {
      this.active = getSiblings(tile)
    }

    // update data for those tiles
    this.active.map((key) => {
      const tile = keyToTile(key)
      this.tiles[key].offset = [tile[0], tile[1]]
      this.tiles[key].brightness = this.props.brightness
      this.tiles[key].zoom = this.props.zoom
      this.tiles[key].level = level
      this.tiles[key].camera = [tileFraction[0], tileFraction[1]]
      if (this.loaders[level]) {
        if (!this.tiles[key].cached) {
          if (!this.tiles[key].loading) {
            this.tiles[key].loading = true
            this.loaders[level]([tile[1], tile[0]], (err, chunk) => {
              this.tiles[key].value(chunk)
              this.tiles[key].cached = true
              this.tiles[key].loading = false
            })
          }
        }
      }
    })

    if ((this.props.brightness !== prev.brightness) ||
      (this.props.display !== prev.display)
      ) {
      if (this.renderedTick !== this.tick) {
        this.draw()
        this.renderedTick = this.tick
      }
    }
  }

  componentWillUnmount() {
    this.draw = () => {}
  }

  render() {
    return null
  }
}

export default Raster
