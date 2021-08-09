import { useRef, useEffect } from 'react'
import { useThemeUI, Box } from 'theme-ui'
import mapboxgl from 'mapbox-gl'
import mat4 from 'gl-mat4'
import bunny from 'bunny'
import _regl from 'regl'
import normals from 'angle-normals'
import style from '../components/style'
import zarr from 'zarr-js'
import xhr from 'xhr-request'

// carbonplan-scratch/zarr-mapbox-webgl/0/

const remote = 'https://carbonplan.blob.core.windows.net/'
const bucket = 'carbonplan-scratch/'
const prefix = 'zarr-mapbox-webgl/'

mapboxgl.accessToken = ''

const Index = () => {
  const mapContainer = useRef(null)
  const reglContainer = useRef(null)

  const {
    theme: { rawColors: colors },
  } = useThemeUI()

  useEffect(() => {
    zarr(xhr).open(remote + bucket + prefix + '0', (err, get) => {
      get([0, 0], (err, array) => {
        console.log(array)
      })
    })

    const regl = _regl({ container: reglContainer.current })

    const drawBunny = regl({
      vert: `
      precision mediump float;
      attribute vec3 position, normal;
      uniform mat4 model, view, projection;
      varying vec3 vnormal;
      void main() {
        vnormal = normal;
        gl_Position = projection * view * model * vec4(position, 1);
      }`,

      frag: `
      precision mediump float;
      varying vec3 vnormal;
      void main() {
        gl_FragColor = vec4(abs(vnormal), 1.0);
      }`,

      // this converts the vertices of the mesh into the position attribute
      attributes: {
        position: bunny.positions,
        normal: normals(bunny.cells, bunny.positions),
      },

      // and this converts the faces of the mesh into elements
      elements: bunny.cells,

      uniforms: {
        model: mat4.identity([]),
        view: ({ tick }) => {
          const t = 0.01 * tick
          return mat4.lookAt(
            [],
            [30 * Math.cos(t), 2.5, 30 * Math.sin(t)],
            [0, 2.5, 0],
            [0, 1, 0]
          )
        },
        projection: ({ viewportWidth, viewportHeight }) =>
          mat4.perspective(
            [],
            Math.PI / 4,
            viewportWidth / viewportHeight,
            0.01,
            1000
          ),
      },
    })

    regl.frame(({ time }) => {
      console.log('1')
      console.log(time)
      drawBunny()
    })

    regl.frame(({ time }) => {
      console.log('2')
      console.log(time)
      //drawBunny()
    })

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: style(colors),
      center: [-122.99922013524304, 40.02328448336925],
      zoom: 6.79,
    })

    return function cleanup() {
      map.remove()
      regl.destroy()
    }
  }, [])

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Box
        ref={reglContainer}
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
      <Box
        ref={mapContainer}
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          'canvas.mapboxgl-canvas:focus': {
            outline: 'none',
          },
        }}
      />
    </Box>
  )
}

export default Index
