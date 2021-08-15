import { useMemo } from 'react'
import chroma from 'chroma-js'
import { useThemeUI, useColorMode } from 'theme-ui'

export const useColormap = (name) => {
  const {
    theme: { rawColors: colors },
  } = useThemeUI()
  const [mode] = useColorMode()

  const {
    primary,
    background,
    red,
    orange,
    yellow,
    green,
    teal,
    blue,
    purple,
    pink,
  } = colors

  const colormap = useMemo(() => {
    let ramp

    switch (name) {
      case 'reds':
        ramp = [background, red]
        break
      case 'greens':
        ramp = [background, green]
        break
      case 'teals':
        ramp = [background, teal]
        break
      case 'grays':
        ramp = [background, primary]
        break
      case 'warm':
        if (mode === 'dark') {
          ramp = [
            chroma(yellow),
            chroma(orange),
            red,
            chroma(pink).darken(1),
            chroma(purple).darken(2),
          ]
        }
        if (mode === 'light') {
          ramp = [
            chroma(yellow).brighten(2),
            chroma(orange).brighten(1),
            red,
            chroma(pink),
            chroma(purple),
          ]
        }
        break
      case 'cool':
        if (mode === 'dark') {
          ramp = [
            chroma(yellow),
            chroma(green),
            teal,
            chroma(blue).darken(1),
            chroma(purple).darken(2),
          ]
        }
        if (mode === 'light') {
          ramp = [
            chroma(yellow).brighten(2),
            chroma(green).brighten(1),
            teal,
            chroma(blue),
            chroma(purple),
          ]
        }
        break
    }

    return chroma.scale(ramp).mode('lab').colors(255, 'rgb')
  }, [name, colors, mode])

  return colormap
}
