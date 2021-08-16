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
            chroma(purple).darken(2),
            chroma(pink).darken(1),
            red,
            chroma(orange),
            chroma(yellow),
          ]
        }
        if (mode === 'light') {
          ramp = [
            chroma(purple),
            chroma(pink),
            red,
            chroma(orange).brighten(1),
            chroma(yellow).brighten(2),
          ]
        }
        break
      case 'cool':
        if (mode === 'dark') {
          ramp = [
            chroma(purple).darken(2),
            chroma(blue).darken(1),
            teal,
            chroma(green),
            chroma(yellow),
          ]
        }
        if (mode === 'light') {
          ramp = [
            chroma(purple),
            chroma(blue),
            teal,
            chroma(green).brighten(1),
            chroma(yellow).brighten(2),
          ]
        }
        break
    }

    return chroma.scale(ramp).mode('lab').colors(255, 'rgb')
  }, [name, colors, mode])

  return colormap
}
