import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { useFrame } from './regl'
import { useMapbox } from './mapbox'
import style from './style'
import Grid from '../components/grid'

const Layers = ({ display, brightness, setBrightness }) => {
  const [zoom, setZoom] = useState(0)
  const [center, setCenter] = useState()
  const ref = useRef()
  const { map } = useMapbox()

  useEffect(() => {
    setZoom(map.getZoom())
    setCenter(map.getCenter())
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
      <Grid
        ref={(el) => (ref.current = el)}
        brightness={brightness}
        center={center}
        zoom={zoom}
        size={128}
      />
    </>
  )
}

export default Layers
