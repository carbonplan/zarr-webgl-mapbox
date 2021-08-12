import { useRef, useEffect } from 'react'
import { useCanvas, useControls, Raster } from '../lib'

const Layers = ({ display, brightness }) => {
  const ref = useRef()
  const { map } = useCanvas()
  const { center, zoom } = useControls()

  useEffect(() => {
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
