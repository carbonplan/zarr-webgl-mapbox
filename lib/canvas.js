import { Box } from 'theme-ui'
import Regl, { useRegl } from './regl'
import Mapbox, { useMapbox } from './mapbox'

export const useCanvas = () => {
  const { regl } = useRegl()
  const { map } = useMapbox()
  return { regl: regl, map: map }
}

const Canvas = ({style, children, zoom, center}) => {
  return (
    <Mapbox
      sx={{ position: 'absolute' }}
      style={style}
      zoom={zoom}
      center={center}
    >
      <Regl sx={{ position: 'absolute', pointerEvents: 'none' }}>
        {children}
      </Regl>
    </Mapbox>
  )
}

export default Canvas