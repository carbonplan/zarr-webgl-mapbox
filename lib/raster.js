import { PureComponent } from 'react'
import { ReglContext } from './regl'
import { createTiles } from './tiles'

class Raster extends PureComponent {
  static contextType = ReglContext

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { regl } = this.context
    this.tiles = createTiles(regl, this.props)
    this.draw = this.tiles.draw
  }

  componentDidUpdate(prev) {
    this.tiles.update(this.props)
  }

  componentWillUnmount() {
    this.draw = () => {}
  }

  render() {
    return null
  }
}

export default Raster
