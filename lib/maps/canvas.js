import { Box } from 'theme-ui'
import Mapbox from './mapbox'
import Regl from './regl'

const Canvas = ({
  id,
  tabIndex,
  className,
  style,
  zoom,
  minZoom,
  maxZoom,
  center,
  debug,
  extensions,
  children,
  containerStyle,
}) => {
  return (
    <div
      id={id}
      tabIndex={tabIndex}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...containerStyle,
      }}
    >
      <Mapbox
        style={style}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        center={center}
        debug={debug}
        containerStyle={{ position: 'absolute' }}
      >
        <Regl
          extensions={extensions}
          containerStyle={{
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          {children}
        </Regl>
      </Mapbox>
    </div>
  )
}

export default Canvas
