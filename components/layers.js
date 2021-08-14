import { useRef, useEffect } from 'react'
import { useThemeUI } from 'theme-ui'
import chroma from 'chroma-js'
import { useMapbox, useControls, Raster } from '../lib'
import Basemap from './basemap'

//const colormap = chroma.scale(['#1b1e23','#f07071']).mode('lab').colors(255, 'rgb')
//const colormap = chroma.scale(['#d4c05e', '#7eb36a', '#64b9c4', '#85a2f7', '#bc85d9']).mode('lab').colors(255, 'rgb')
//const colormap = chroma.scale([chroma('#d4c05e').brighten(2), chroma('#7eb36a').brighten(1), '#64b9c4', chroma('#85a2f7').darken(0), chroma('#bc85d9').darken(0)]).mode('lab').colors(255, 'rgb')
//const colormap = chroma.scale([chroma('#d4c05e').darken(0), chroma('#7eb36a').darken(0), '#64b9c4', chroma('#85a2f7').darken(1), chroma('#bc85d9').darken(2)]).mode('lab').colors(255, 'rgb')
//const colormap = chroma.scale(['#8B9FD1', '#1B1E23', '#F16F71']).mode('lab').colors(255, 'rgb')
const colormap = chroma
  .scale([
    chroma('#d4c05e').brighten(0),
    chroma('#EB9755').brighten(0),
    '#F16F71',
    chroma('#E487B5').darken(1),
    chroma('#B386BC').darken(2),
  ])
  .mode('lab')
  .colors(255, 'rgb')

const Layers = ({ display, opacity, clim }) => {
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
      <Basemap />
      <Raster
        ref={ref}
        display={display}
        center={center}
        zoom={zoom}
        maxZoom={5}
        size={128}
        opacity={opacity}
        colormap={colormap}
        clim={clim}
        type={'squares'}
      />
    </>
  )
}

export default Layers
