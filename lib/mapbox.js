import { Box } from 'theme-ui'
import {
  createContext,
  useState,
  useRef,
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
  const map = useRef()
  const [ready, setReady] = useState()

  const ref = useCallback((node) => {
    if (node !== null) {
      map.current = new mapboxgl.Map({
        container: node,
        style: style,
        center: center,
        zoom: zoom,
      })
      map.current.showTileBoundaries = false
      map.current.on('styledata', () => {
        setReady(true)
      })
    }
  }, [])

  useEffect(() => {
    return () => {
      if (map.current) map.current.remove()
    }
  }, [])

  return (
    <MapboxContext.Provider
      value={{
        map: map.current,
      }}
    >
      <Box as='div' sx={{ width: '100%', height: '100%', ...sx }} ref={ref} />
      {ready && children}
    </MapboxContext.Provider>
  )
}

export default Mapbox