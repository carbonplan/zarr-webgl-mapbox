import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useRegl } from './regl'
import { createTiles } from './tiles'

const Raster = (props, ref) => {
  const { center, zoom, display, opacity } = props
  const { regl } = useRegl()
  const tiles = useRef()

  useEffect(() => {
    tiles.current = createTiles(regl, props)
  }, [])

  useImperativeHandle(ref, () => ({
    draw: () => {
      tiles.current.updateCamera({center: center, zoom: zoom})
      tiles.current.draw()
    }
  }), [center, zoom])

  useEffect(() => {
    tiles.current.updateStyle({display: display, opacity: opacity})
    tiles.current.redraw()
  }, [display, opacity])

  return null
}

export default forwardRef(Raster)
