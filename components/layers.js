import { useRef, useEffect, useState } from 'react'
import { useFrame } from './regl'
import { useMapbox } from './mapbox'
import style from './style'
import Bunny from '../components/bunny'

const Layers = ({display}) => {
	const ref = useRef()
	const { map } = useMapbox()

	useEffect(() => {
		map.on('zoom', () => {
			ref.current.brightness = map.getZoom() / 5
		})

		map.on('movestart', () => {
			ref.current.rendering = true
		})

		map.on('moveend', () => {
			ref.current.rendering = false
		})
	}, [])

	useEffect(() => {
		if (display) {
			ref.current.brightness = 0.5
		} else {
			ref.current.brightness = 0
		}
		ref.current.draw()
	}, [display])

	return (
		<Bunny ref={ref}/>
	)
}

export default Layers