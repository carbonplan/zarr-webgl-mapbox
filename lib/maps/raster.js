import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useRegl } from './regl'
import { useMapbox } from './mapbox'
import { useControls } from './use-controls'
import { createTiles } from './tiles'

const Raster = (props, ref) => {
  const { display, opacity, clim, colormap } = props
  const { center, zoom } = useControls()
  const { regl } = useRegl()
  const { map } = useMapbox()
  const tiles = useRef()
  const camera = useRef()

  camera.current = { center: center, zoom: zoom }

  useEffect(() => {
    tiles.current = createTiles(regl, props)
  }, [])

  useEffect(() => {
    map.on('render', () => {
      tiles.current.updateCamera(camera.current)
      tiles.current.draw()
    })
  }, [])

  useEffect(() => {
    tiles.current.updateStyle({ display, opacity, clim })
    tiles.current.redraw()
  }, [display, opacity, clim])

  useEffect(() => {
    tiles.current.updateColormap({ colormap })
    tiles.current.redraw()
  }, [colormap])

  return null
}

export default forwardRef(Raster)
