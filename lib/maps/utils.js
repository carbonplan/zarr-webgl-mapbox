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

  return offsets.reduce((accum, offset) => {
    const [x, y, z] = offset
    const tile = [clip(x, max), clip(y, max), z]
    const key = tileToKey(tile)

    if (!accum[key]) {
      accum[key] = []
    }

    accum[key].push(offset)

    return accum
  }, {})
}

export const getKeysToRender = (targetKey, tiles, maxZoom) => {
  const ancestor = getAncestorToRender(targetKey, tiles)

  if (ancestor) {
    console.log('rendering ancestor', { ancestor })
    return [ancestor]
  }

  const descendants = getDescendantsToRender(targetKey, tiles, maxZoom)
  if (descendants.length) {
    console.log('rendering descendants', { targetKey, descendants })
    return descendants
  }

  console.log('fallback', { targetKey })
  return [targetKey]
}

export const getAncestorToRender = (targetKey, tiles) => {
  let [x, y, z] = keyToTile(targetKey)
  while (z >= 0) {
    const key = tileToKey([x, y, z])
    if (tiles[key].cached) {
      return key
    }
    z--
    x = Math.floor(x / 2)
    y = Math.floor(y / 2)
  }
}

export const getDescendantsToRender = (targetKey, tiles, maxZoom) => {
  let [initialX, initialY, initialZ] = keyToTile(targetKey)
  let [x, y, z] = [initialX, initialY, initialZ]
  let coverage = 0
  let descendants = []
  while (z <= maxZoom) {
    const delta = z - initialZ
    const keys = []
    for (let deltaX = 0; deltaX <= delta; deltaX++) {
      for (let deltaY = 0; deltaY <= delta; deltaY++) {
        keys.push(tileToKey([x + deltaX, y + deltaY, z]))
      }
    }

    const coveringKeys = keys.filter((key) => tiles[key].cached)
    const currentCoverage = coveringKeys.length / keys.length

    if (coverage === 1) {
      return keys
    } else if (currentCoverage > coverage) {
      descendants = keys
    }

    z++
    x = x * 2
    y = y * 2
  }

  return descendants
}

export const getOverlappingAncestor = (key, renderedKeys) => {
  const [aX, aY, aZ] = keyToTile(key)
  const child = { x: aX, y: aY, z: aZ }

  return renderedKeys.find((parentKey) => {
    const [bX, bY, bZ] = keyToTile(parentKey)
    const parent = { x: bX, y: bY, z: bZ }

    if (child.z <= parent.z) {
      return false
    } else {
      const factor = Math.pow(2, child.z - parent.z)

      return (
        Math.floor(child.x / factor) === parent.x &&
        Math.floor(child.y / factor) === parent.y
      )
    }
  })
}

export const getAdjustedOffset = (offset, renderedLevel) => {
  const [offsetX, offsetY, level] = offset
  const factor = Math.pow(2, level - renderedLevel)
  return [Math.floor(offsetX / factor), Math.floor(offsetY / factor)]
}
