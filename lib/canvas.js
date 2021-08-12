import {
  createContext,
  useCallback,
  useState,
  useEffect,
  useContext,
  useRef,
  Component,
} from 'react'
import { Box } from 'theme-ui'
import _regl from 'regl'
import mapboxgl from 'mapbox-gl'

export const ReglContext = createContext(null)

export const MapboxContext = createContext(null)

export const useCanvas = () => {
  const { regl } = useContext(ReglContext)
  const { map } = useContext(MapboxContext)
  return {
    map: map,
    regl: regl
  }
}

const Canvas = ({ children, style, center, zoom }) => {
  const regl = useRef()
  const [mapboxReady, setMapboxReady] = useState(false)
  const [reglReady, setReglReady] = useState(false)

  const reglRef = useCallback((node) => {
    if (node !== null) {
      reglRef.current = _regl({
        container: node,
        extensions: ['OES_texture_float', 'OES_element_index_uint'],
      })
      setReglReady(true)
    }
  }, [])

  const mapboxRef = useCallback((node) => {
    if (node !== null) {
      mapboxRef.current = new mapboxgl.Map({
        container: node,
        style: style,
        center: center,
        zoom: zoom,
      })
      mapboxRef.current.showTileBoundaries = true
      setMapboxReady(true)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (reglRef.current) reglRef.current.destroy
      if (mapboxRef.current) mapboxRef.current.remove()
    }
  }, [])

  return (
    <MapboxContext.Provider
      value={{
        map: mapboxRef.current,
      }}
    >
      <ReglContext.Provider
        value={{
          regl: reglRef.current,
        }}
      >
        <Box sx={{width: '100%', height: '100%', position: 'relative'}}>
          <Box sx={{ width: '100%', height: '100%', position: 'absolute' }} ref={mapboxRef} />
          <Box sx={{ width: '100%', height: '100%', position: 'absolute', pointerEvents: 'none' }} ref={reglRef} />
        </Box>
        {(reglReady && mapboxReady) && children}
      </ReglContext.Provider>
    </MapboxContext.Provider>
  )
}

export default Canvas
