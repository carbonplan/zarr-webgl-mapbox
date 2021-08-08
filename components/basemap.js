import { useEffect } from 'react'
import { useMapbox } from './mapbox'
import { useThemeUI } from 'theme-ui'

const Basemap = () => {
  const { map } = useMapbox()
  const {
    theme: { rawColors: colors },
  } = useThemeUI()
  const { primary, background } = colors

  useEffect(() => {
    map.on('styledata', () => {
      if (!map.getLayer('land')) {
        map.addLayer({
          id: 'land',
          type: 'line',
          source: 'basemap',
          'source-layer': 'ne_10m_land',
          layout: { visibility: 'visible' },
          paint: {
           'line-blur': 0.4,
            'line-color': primary,
            'line-opacity': 1,
            'line-width': 0.8,
          },
        })
      }
    })
  }, [])

  useEffect(() => {
    if (map.getLayer('land')) {
      map.setPaintProperty('land', 'line-color', primary) 
    }
  }, [colors])

  return null
}

export default Basemap