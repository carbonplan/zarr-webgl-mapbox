import { createContext, useContext, useState, useEffect, useLayoutEffect, useRef, Component } from 'react'
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
			regl: null
		}
	}

	componentDidMount() {
		let container = this.container
		const regl = _regl({container: container})
		this.setState({regl: regl})
	}

	componentWillUnmount() {
		this.state.regl.destroy()
	}

	render () {
		const { regl } = this.state
		const { children } = this.props

    return (
    	<ReglContext.Provider
	      value={{
	      	regl: regl
	      }}
	    >
	      <div style={{ width: '100%', height: '100%' }} ref={el => this.container = el}>
	        {regl && children}
	      </div>
	    </ReglContext.Provider>
    )
   }
}

export default Regl