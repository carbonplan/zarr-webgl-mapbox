import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { useFrame } from './regl'
import { useMapbox } from './mapbox'
import style from './style'
import Raster from '../components/raster'

const Layers = ({ display, brightness, setBrightness }) => {
  const [zoom, setZoom] = useState(0)
  const [center, setCenter] = useState()
  const ref = useRef()
  const { map } = useMapbox()

  useEffect(() => {
    setZoom(map.getZoom())
    setCenter(map.getCenter())
    map.on('load', () => {
      setZoom(map.getZoom())
      setCenter(map.getCenter())
    })
    map.on('move', () => {
      setCenter(map.getCenter())
      setZoom(map.getZoom())
    })
    map.on('render', () => {
      ref.current.draw()
    })
  }, [map])

  return (
    <>
      <Raster
        ref={(el) => (ref.current = el)}
        brightness={brightness}
        center={center}
        zoom={zoom}
        maxZoom={5}
        size={128}
        type={'squares'}
      />
    </>
  )
}

export default Layers
