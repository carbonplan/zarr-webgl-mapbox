const d2r = Math.PI / 180

const clip = (v, min, max) => {
  return Math.min(Math.max(v, min), max)
}

export const keyToTile = (key) => {
  return key.split(',').map((d) => parseInt(d))
}

export const tileToKey = (tile) => {
  return tile.join(',')
}

export const pointToTile = (lon, lat, z) => {
  let tile = pointToCamera(lon, lat, z)
  tile[0] = Math.floor(tile[0])
  tile[1] = Math.floor(tile[1])
  return tile
}

export const pointToCamera = (lon, lat, z) => {
  let sin = Math.sin(lat * d2r),
    z2 = Math.pow(2, z),
    x = z2 * (lon / 360 + 0.5),
    y = z2 * (0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI)

  x = x % z2
  if (x < 0) x = x + z2
  return [x, y, z]
}

export const zoomToLevel = (zoom, maxZoom) => {
  if (maxZoom) return Math.min(Math.max(0, Math.floor(zoom)), maxZoom)
  return Math.max(0, Math.floor(zoom))
}

export const getSiblings = (tile) => {
  let siblings = []
  const deltax = [-2, -1, 0, 1, 2]
  const deltay = [-1, 0, 1]
  const max = Math.pow(2, tile[2]) - 1
  deltax.map((x) => {
    deltay.map((y) => {
      if (!(deltax === 0 && deltay === 0)) {
        siblings.push(
          tileToKey([
            clip(tile[0] + x, 0, max),
            clip(tile[1] + y, 0, max),
            tile[2],
          ])
        )
      }
    })
  })
  const unique = [...new Set(siblings)]
  unique.unshift(tileToKey([0, 0, tile[2]]))
  return unique
}
