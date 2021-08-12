import Regl from './regl'
import Mapbox from './mapbox'

const Canvas = ({style, children}) => {
  return (
    <Mapbox
      sx={{ position: 'absolute' }}
      style={style}
      zoom={0}
      center={[-122.99, 39.02]}
    >
      <Regl sx={{ position: 'absolute', pointerEvents: 'none' }}>
        {children}
      </Regl>
    </Mapbox>
  )
}

export default Canvas