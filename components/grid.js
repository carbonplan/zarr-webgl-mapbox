import { Component } from 'react'
import { ReglContext } from './regl'
import zarr from 'zarr-js'
import xhr from 'xhr-request'
import { pointToTileFraction, pointToTile } from '@mapbox/tilebelt'

const remote = 'https://carbonplan.blob.core.windows.net/'
const bucket = 'carbonplan-scratch/'
const prefix = 'zarr-mapbox-webgl/'

class Grid extends Component {
  static contextType = ReglContext

  constructor(props) {
    super(props)
    this.brightness = this.props.brightness
    this.zoom = this.props.zoom
    this.center = this.props.center
    this.level = Math.max(0, Math.floor(this.zoom))
  }

  componentDidMount() {
    const { regl } = this.context
    const { size } = this.props

    this.value = regl.buffer()
    this.regl = regl
    this.data = {}

    const uris = [0, 1, 2, 3, 4, 5].map(d => remote + bucket + prefix + '128/' + d)

    zarr(xhr).openList(uris, (err, loaders) => {
      loaders.map((d, i) => this.data[i] = d)
    })

    let position = []
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        position.push([j + 0.5 - size/2, i + 0.5 - size/2])
      } 
    }

    this.position = regl.buffer(position)
    this.count = position.length

    const drawGrid = regl({
      vert: `
      precision mediump float;
      attribute vec2 position;
      attribute float value;
      varying float fragValue;
      uniform vec3 camera;
      uniform vec2 offset;
      uniform float width;
      uniform float height;
      uniform float zoom;
      uniform float size;
      uniform float level;
      uniform vec2 tile;
      void main() {
        float x = position.x - offset.y * size + size / 2.0 + tile.y * size;
        float y = position.y - offset.x * size + size / 2.0 + tile.x * size;
        float scale = 2.0 * 512.0 / size;
        float magnification = pow(2.0, zoom - level);
        x = (scale * x * magnification);
        y = (scale * y * magnification);
        x = (2.0 * x / width);
        y = -(2.0 * y / height);
        fragValue = value;
        gl_PointSize = 0.8 * scale * magnification;
        gl_Position = vec4(x, y, 0.0, 1.0);
      }`,

      frag: `
      precision mediump float;
      uniform float brightness;
      varying float fragValue;
      void main() {
        gl_FragColor = vec4(brightness * fragValue / 20.0, 0.0, 0.0, 0.5);
        gl_FragColor.rgb *= gl_FragColor.a;
      }`,

      attributes: {
        position: regl.prop('position'),
        value: regl.prop('value')
      },

      uniforms: {
        camera: regl.prop('camera'),
        width: regl.context('viewportWidth'),
        height: regl.context('viewportHeight'),
        offset: regl.prop('offset'),
        size: regl.prop('size'),
        brightness: regl.prop('brightness'),
        zoom: regl.prop('zoom'),
        level: regl.prop('level'),
        tile: regl.prop('tile')
      },

      blend: {
        enable: true,
        func: {
          src: 'one',
          srcAlpha: 'one',
          dstRGB: 'one minus src alpha',
          dstAlpha: 'one minus src alpha',
        }
      },

      depth: { enable: false },

      count: regl.prop('count'),

      primitive: 'points'
    })

    this.draw = () => drawGrid({ 
      brightness: this.brightness,
      value: this.value,
      position: this.position,
      offset: [0, 0],
      size: this.props.size,
      count: this.count,
      brightness: this.brightness,
      zoom: this.zoom,
      level: this.level,
      offset: this.offset,
      tile: this.tile
    })

    // this.renderedTick = 0
    // regl.frame(({ tick }) => {
    //   this.tick = tick
    // })
  }

  componentDidUpdate(prev) {
    // if (this.tick !== this.renderedTick) {
      this.brightness = this.props.brightness
      this.zoom = this.props.zoom
      this.center = this.props.center
      this.level = Math.min(Math.max(0, Math.floor(this.zoom)), 5)
      const tile = pointToTile(this.center.lng, this.center.lat, this.level)
      const tileFraction = pointToTileFraction(this.center.lng, this.center.lat, this.level)
      this.offset = [tileFraction[1], tileFraction[0]]
      this.tile = [tile[1], tile[0]]
      if (this.data[this.level]) {
        this.data[this.level]([tile[1], tile[0]], (err, chunk) => {
          this.value(chunk)
        })
      }
      //this.draw()
      // this.renderedTick = this.tick
      // console.log(this.center)
      // console.log('we drew')
  }

  componentWillUnmount() {
    this.draw = () => {}
  }

  render() {
    return null
  }
}

export default Grid
