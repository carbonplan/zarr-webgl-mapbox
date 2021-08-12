import { useRef, useEffect } from 'react'
import { useMapbox, useControls, Raster } from '../lib'

const Layers = ({ display, brightness }) => {
  const ref = useRef()
  const { map } = useMapbox()
  const { center, zoom } = useControls()

  useEffect(() => {
    map.on('render', () => {
      ref.current.draw()
    })
  }, [])

  return (
    <>
      <Raster
        ref={ref}
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
