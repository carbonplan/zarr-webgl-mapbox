import { useState, useRef } from 'react'
import { Box } from 'theme-ui'
import { Slider, Dimmer, Toggle } from '@carbonplan/components'
import Mapbox from '../components/mapbox'
import Regl, { useRegl } from '../components/regl'
import Layers from '../components/layers'
import Basemap from '../components/basemap'
import style from '../components/style'

const Index = () => {
  const [display, setDisplay] = useState(false)

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}
    >
      <Mapbox
        sx={{ position: 'absolute' }}
        style={style}
        zoom={3}
        center={[-122.99, 40.02]}
      >
        <Basemap />
        <Regl sx={{ position: 'absolute', pointerEvents: 'none' }}>
          <Layers display={display} />
        </Regl>
      </Mapbox>
      <Toggle
        sx={{ position: 'absolute', top: 20, right: 20 }}
        value={display}
        onClick={() => setDisplay((prev) => !prev)}
      />
      <Dimmer sx={{ position: 'absolute', bottom: 20, right: 20 }} />
    </Box>
  )
}

export default Index
