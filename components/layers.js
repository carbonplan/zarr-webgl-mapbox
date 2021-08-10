import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { useFrame } from './regl'
import { useMapbox } from './mapbox'
import style from './style'
import Bunny from '../components/bunny'

const Layers = ({ display, brightness, setBrightness }) => {
  const { map } = useMapbox()

  useEffect(() => {
    map.on('zoom', () => {
      setBrightness(map.getZoom() / 2)
    })
  }, [map])

  return (
    <>
      <Bunny brightness={brightness} offset={1} />
      <Bunny brightness={0.5} offset={0.1} />
    </>
  )
}

export default Layers
