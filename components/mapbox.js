import { Box } from 'theme-ui'
import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
} from 'react'
import mapboxgl from 'mapbox-gl'

export const MapboxContext = createContext(null)

export const useMapbox = () => {
  return useContext(MapboxContext)
}

const Mapbox = ({ style, center, zoom, sx, children }) => {
  const [map, setMap] = useState()

  const ref = useCallback((node) => {
    if (node !== null) {
      const map = new mapboxgl.Map({
        container: node,
        style: style,
        center: center,
        zoom: zoom,
      })
      setMap(map)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (map) map.remove()
    }
  }, [])

  return (
    <MapboxContext.Provider
      value={{
        map: map,
      }}
    >
      <Box as='div' sx={{ width: '100%', height: '100%', ...sx }} ref={ref}>
        {map && children}
      </Box>
    </MapboxContext.Provider>
  )
}

export default Mapbox
