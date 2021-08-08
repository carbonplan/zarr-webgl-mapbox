import { createContext, useContext, Component } from 'react'
import mapboxgl from 'mapbox-gl'
import style from './style'

export const MapboxContext = createContext(null)

export const useMapbox = () => {
  return useContext(MapboxContext)
}

class Regl extends Component {
	constructor(props) {
		super(props)
		this.state = {
			map: null
		}
	}

	componentDidMount() {
		let container = this.container
		const map = new mapboxgl.Map({
      container: container,
      style: style(),
      center: [-122.99922013524304, 40.02328448336925],
      zoom: 6.79,
    })
		this.setState({map: map})
	}

	componentWillUnmount() {
		this.map.remove()
	}

	render () {
		const { map } = this.state
		const { children } = this.props

    return (
    	<MapboxContext.Provider
	      value={{
	      	map: map
	      }}
	    >
	      <div style={{ width: '100%', height: '100%', position: 'absolute' }} ref={el => this.container = el}>
	        {map && children}
	      </div>
	    </MapboxContext.Provider>
    )
   }
}

export default Regl