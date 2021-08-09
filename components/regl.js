import { createContext, useContext, Component } from 'react'
import { Box } from 'theme-ui'
import _regl from 'regl'

export const ReglContext = createContext(null)

export const useRegl = () => {
  return useContext(ReglContext)
}

export const useFrame = (cb, state = true) => {
  const { regl } = useContext(ReglContext)
  regl.frame(cb)
}

class Regl extends Component {
  constructor(props) {
    super(props)
    this.state = {
      regl: null,
    }
  }

  componentDidMount() {
    let container = this.container
    const regl = _regl({ container: container })
    this.setState({ regl: regl })
  }

  componentWillUnmount() {
    if (this.state.regl) this.state.regl.destroy()
  }

  render() {
    const { regl } = this.state
    const { children } = this.props

    return (
      <ReglContext.Provider
        value={{
          regl: regl,
        }}
      >
        <Box
          sx={{ width: '100%', height: '100%', ...this.props.sx }}
          ref={(el) => (this.container = el)}
        >
          {regl && children}
        </Box>
      </ReglContext.Provider>
    )
  }
}

export default Regl
