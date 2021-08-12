import { useState } from 'react'
import { Box } from 'theme-ui'
import { Slider, Dimmer, Toggle } from '@carbonplan/components'
import { Canvas } from '../lib'
import Layers from '../components/layers'
import style from '../components/style'

const Index = () => {
  const [display, setDisplay] = useState(true)
  const [brightness, setBrightness] = useState(1)

  return (
    <Box sx={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }}>
      <Canvas style={style} zoom={0} center={[0, 0]} debug={true}>
        <Layers display={display} brightness={brightness} />
      </Canvas>
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
