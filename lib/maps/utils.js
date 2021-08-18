const d2r = Math.PI / 180

const clip = (v, max) => {
  let result
  if (v < 0) {
    result = v + max + 1
  } else if (v > max) {
    result = v - max - 1
  } else {
    result = v
  }

  return Math.min(Math.max(result, 0), max)
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
  let offsets = []
  const deltax = [-2, -1, 0, 1, 2]
  const deltay = [-1, 0, 1]
  const max = Math.pow(2, tile[2]) - 1
  deltax.map((x) => {
    deltay.map((y) => {
      offsets.push([tile[0] + x, tile[1] + y, tile[2]])
    })
  })

  const result = offsets.reduce((accum, offset) => {
    const [x, y, z] = offset
    const tile = [clip(x, max), clip(y, max), z]
    const key = tileToKey(tile)

    if (!accum[key]) {
      accum[key] = []
    }

    accum[key].push(offset)

    return accum
  }, {})

  return result
}
