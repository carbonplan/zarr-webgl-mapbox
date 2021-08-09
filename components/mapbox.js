import { Box } from 'theme-ui'
import { createContext, useContext, Component } from 'react'
import mapboxgl from 'mapbox-gl'

export const MapboxContext = createContext(null)

export const useMapbox = () => {
  return useContext(MapboxContext)
}

class Regl extends Component {
  constructor(props) {
    super(props)
    this.state = {
      map: null,
    }
  }

  componentDidMount() {
    let container = this.container
    const map = new mapboxgl.Map({
      container: container,
      style: this.props.style,
      center: this.props.center,
      zoom: this.props.zoom,
    })
    this.setState({ map: map })
  }

  componentWillUnmount() {
    if (this.state.map) this.state.map.remove()
  }

  render() {
    const { map } = this.state
    const { children } = this.props

    return (
      <MapboxContext.Provider
        value={{
          map: map,
        }}
      >
        <Box
          as='div'
          sx={{ width: '100%', height: '100%', ...this.props.sx }}
          ref={(el) => (this.container = el)}
        >
          {map && children}
        </Box>
      </MapboxContext.Provider>
    )
  }
}

export default Regl
