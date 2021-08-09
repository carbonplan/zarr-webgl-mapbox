import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { useFrame } from './regl'
import { useMapbox } from './mapbox'
import style from './style'
import Bunny from '../components/bunny'

const Layers = ({ display, brightness }) => {
  const ref = useRef()
  const { map } = useMapbox()

  useEffect(() => {
    map.on('zoom', () => {
      ref.current.brightness = map.getZoom() / 2
    })

    map.on('movestart', () => {
      ref.current.rendering = true
    })

    map.on('moveend', () => {
      ref.current.rendering = false
    })
  }, [map])

  useEffect(() => {
    if (display) {
      ref.current.brightness = 0.5
    } else {
      ref.current.brightness = 0
    }
    ref.current.draw()
  }, [display])

  useEffect(() => {
    ref.current.brightness = brightness
    ref.current.draw()
  }, [brightness])

  return <Bunny ref={(el) => (ref.current = el)} />
}

export default Layers
