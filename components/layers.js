import { useRef, useEffect } from 'react'
import { useMapbox, useControls, Raster } from '../lib'
import Basemap from './basemap'

const Layers = ({ display, brightness }) => {
  const ref = useRef()
  const { map } = useMapbox()
  const { center, zoom } = useControls()

  useEffect(() => {
    map.on('render', () => {
      ref.current.draw()
    })
  }, [map])

  return (
    <>
      <Basemap />
      <Raster
        ref={ref}
        brightness={brightness}
        display={display}
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
