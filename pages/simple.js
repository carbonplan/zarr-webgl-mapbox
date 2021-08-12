import { useState } from 'react'
import { Box } from 'theme-ui'
import { Slider, Dimmer, Toggle } from '@carbonplan/components'
import Mapbox from '../components/mapbox'
import Regl, { useRegl } from '../components/regl'
import Layers from '../components/layers'
import Basemap from '../components/basemap'
import style from '../components/style'

const Index = () => {
  const [display, setDisplay] = useState(false)
  const [brightness, setBrightness] = useState(1)

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
        zoom={0}
        center={[-122.99, 39.02]}
      >
        <Basemap />
        <Regl sx={{ position: 'absolute', pointerEvents: 'none' }}>
          <Layers
            display={display}
            brightness={brightness}
            setBrightness={setBrightness}
          />
        </Regl>
      </Mapbox>
      <Toggle
        sx={{ position: 'absolute', top: 20, right: 20 }}
        value={display}
        onClick={() => setDisplay((prev) => !prev)}
      />
      <Dimmer sx={{ position: 'absolute', bottom: 20, right: 20 }} />
      <Slider
        min={0}
        max={1}
        step={0.01}
        sx={{ width: '200px', position: 'absolute', top: 20, left: 20 }}
        value={brightness}
        onChange={(e) => setBrightness(parseFloat(e.target.value))}
      />
    </Box>
  )
}

export default Index
