import { useState } from 'react'
import { Box } from 'theme-ui'
import { Slider, Dimmer, Toggle, Meta } from '@carbonplan/components'
import { Canvas } from '../lib'
import Layers from '../components/layers'
import style from '../components/style'

const Index = () => {
  const [display, setDisplay] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const [clim, setClim] = useState([-20, 30])

  return (
    <>
      <Meta />
      <Box sx={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }}>
        <Canvas style={style} zoom={2} center={[0, 0]} debug={false}>
          <Layers display={display} opacity={opacity} clim={clim} />
        </Canvas>
        <Toggle
          sx={{ position: 'absolute', top: 20, right: 20 }}
          value={display}
          onClick={() => setDisplay((prev) => !prev)}
        />
        <Slider
          min={0}
          max={1}
          step={0.01}
          sx={{ width: '200px', position: 'absolute', top: 20, left: 20 }}
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
        />
        <Slider
          min={-20}
          max={30}
          step={0.1}
          sx={{ width: '200px', position: 'absolute', top: 40, left: 20 }}
          value={clim[0]}
          onChange={(e) =>
            setClim((prev) => [parseFloat(e.target.value), prev[1]])
          }
        />
        <Slider
          min={-20}
          max={30}
          step={0.1}
          sx={{ width: '200px', position: 'absolute', top: 60, left: 20 }}
          value={clim[1]}
          onChange={(e) =>
            setClim((prev) => [prev[0], parseFloat(e.target.value)])
          }
        />
        <Dimmer
          sx={{ position: 'absolute', right: [13], bottom: [17, 17, 15, 15] }}
        />
      </Box>
    </>
  )
}

export default Index
