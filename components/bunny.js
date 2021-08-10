import { Component } from 'react'
import mat4 from 'gl-mat4'
import bunny from 'bunny'
import normals from 'angle-normals'
import { ReglContext } from './regl'

class Bunny extends Component {
  static contextType = ReglContext

  constructor(props) {
    super(props)
    this.brightness = this.props.brightness
    this.rendering = false
  }

  componentDidMount() {
    const { regl } = this.context

    const drawBunny = regl({
      vert: `
	    precision mediump float;
	    attribute vec3 position, normal;
	    uniform mat4 model, view, projection;
	    varying vec3 vnormal;
	    void main() {
	      vnormal = normal;
	      gl_Position = projection * view * model * vec4(position, 1);
	    }`,

      frag: `
	    precision mediump float;
	    varying vec3 vnormal;
	    uniform float brightness;
	    void main() {
	      gl_FragColor = vec4(abs(vnormal) * brightness, 1.0);
	    }`,

      // this converts the vertices of the mesh into the position attribute
      attributes: {
        position: bunny.positions,
        normal: normals(bunny.cells, bunny.positions),
      },

      // and this converts the faces of the mesh into elements
      elements: bunny.cells,

      uniforms: {
        brightness: regl.prop('brightness'),
        model: mat4.identity([]),
        view: ({ tick }) => {
          const t = this.props.offset
          return mat4.lookAt(
            [],
            [30 * Math.cos(t), 2.5, 30 * Math.sin(t)],
            [0, 2.5, 0],
            [0, 1, 0]
          )
        },
        projection: ({ viewportWidth, viewportHeight }) =>
          mat4.perspective(
            [],
            Math.PI / 4,
            viewportWidth / viewportHeight,
            0.01,
            1000
          ),
      },
    })

    this.draw = () => drawBunny({ brightness: this.brightness })
    this.draw()

    this.renderedTick = 0
    regl.frame(({ tick }) => {
      this.tick = tick
    })
  }

  componentDidUpdate(prev) {
    if (this.tick !== this.renderedTick) {
      this.brightness = this.props.brightness
      this.draw()
      this.renderedTick = this.tick
    }
  }

  componentWillUnmount() {
    this.draw = () => {}
  }

  render() {
    return null
  }
}

export default Bunny
