import { useState } from 'react'
import { Box } from 'theme-ui'
import { Slider, Dimmer, Toggle, Select, Meta } from '@carbonplan/components'
import { Canvas, Raster } from '../lib/maps'
import { useColormap } from '../lib/colormaps'
import Basemap from '../components/basemap'
import style from '../components/style'

const Index = () => {
  const [display, setDisplay] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const [clim, setClim] = useState([0, 1000])
  const [colormapName, setColormapName] = useState('cool')
  const colormap = useColormap(colormapName)

  return (
    <>
      <Meta />
      <Box sx={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }}>
        <Canvas
          style={style}
          zoom={2}
          center={[0, 0]}
          debug={false}
          extensions={['OES_texture_float', 'OES_element_index_uint']}
        >
          <Basemap />
          <Raster
            maxZoom={5}
            size={128}
            colormap={colormap}
            clim={clim}
            display={display}
            opacity={opacity}
            variables={['Growth2']}
            source={
              'https://storage.googleapis.com/carbonplan-research/macroalgae/data/processed/zarr-pyramid/{z}/all_variables'
            }
          />
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
          min={0}
          max={1000}
          step={0.1}
          sx={{ width: '200px', position: 'absolute', top: 40, left: 20 }}
          value={clim[0]}
          onChange={(e) =>
            setClim((prev) => [parseFloat(e.target.value), prev[1]])
          }
        />
        <Slider
          min={0}
          max={1000}
          step={0.1}
          sx={{ width: '200px', position: 'absolute', top: 60, left: 20 }}
          value={clim[1]}
          onChange={(e) =>
            setClim((prev) => [prev[0], parseFloat(e.target.value)])
          }
        />
        <Select
          onChange={(e) => setColormapName(e.target.value)}
          defaultValue={'cool'}
          sx={{ width: '200px', position: 'absolute', top: 80, left: 20 }}
        >
          <option>grays</option>
          <option>reds</option>
          <option>greens</option>
          <option>teals</option>
          <option>warm</option>
          <option>cool</option>
        </Select>
        <Dimmer
          sx={{ position: 'absolute', right: [13], bottom: [17, 17, 15, 15] }}
        />
      </Box>
    </>
  )
}

export default Index
