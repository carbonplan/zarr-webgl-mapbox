import { Box } from 'theme-ui'
import Regl, { useRegl } from './regl'
import Mapbox, { useMapbox } from './mapbox'

export const useCanvas = () => {
  const { regl } = useRegl()
  const { map } = useMapbox()
  return { regl: regl, map: map }
}

const Canvas = ({style, children, zoom, center, debug}) => {
  return (
    <Mapbox
      sx={{ position: 'absolute' }}
      style={style}
      zoom={zoom}
      center={center}
      debug={debug}
    >
      <Regl sx={{ position: 'absolute', pointerEvents: 'none' }}>
        {children}
      </Regl>
    </Mapbox>
  )
}

export default Canvas