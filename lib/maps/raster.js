import { useRef, useEffect, useState } from 'react'
import { useRegl } from './regl'
import { useMapbox } from './mapbox'
import { useControls } from './use-controls'
import { createTiles } from './tiles'

const Raster = (props) => {
  const { display, opacity, clim, colormap, uniforms = {} } = props
  const { center, zoom } = useControls()
  const { regl } = useRegl()
  const { map } = useMapbox()
  const tiles = useRef()
  const camera = useRef()
  const [dimensions, setDimensions] = useState({
    viewportHeight: 0,
    viewportWidth: 0,
  })

  camera.current = { center: center, zoom: zoom, viewport: dimensions }

  useEffect(() => {
    tiles.current = createTiles(regl, props)
  }, [])

  useEffect(() => {
    map.on('render', () => {
      tiles.current.updateCamera(camera.current)
      tiles.current.draw()
    })
  }, [])

  // Listen for changes to the viewport dimensions in regl context
  useEffect(() => {
    regl.frame(({ viewportHeight, viewportWidth }) => {
      setDimensions((previousDimensions) => {
        if (
          previousDimensions.viewportHeight !== viewportHeight ||
          previousDimensions.viewportWidth !== viewportWidth
        ) {
          return { viewportHeight, viewportWidth }
        } else {
          return previousDimensions
        }
      })
    })
  }, [])

  // Ensure that tiles are redrawn when viewport dimensions have changed.
  // Because the regl dimensions are updated via polling, tiles drawn on
  // map `render` will use stale dimensions under some race conditions.
  useEffect(() => {
    tiles.current.redraw()
  }, [dimensions])

  useEffect(() => {
    tiles.current.updateStyle({ display, opacity, clim })
    tiles.current.redraw()
  }, [display, opacity, clim])

  useEffect(() => {
    tiles.current.updateColormap({ colormap })
    tiles.current.redraw()
  }, [colormap])

  useEffect(() => {
    tiles.current.updateUniforms(uniforms)
    tiles.current.redraw()
  }, Object.values(uniforms))

  return null
}

export default Raster
