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

export const getSiblings = (tile, { viewport, zoom, size, camera }) => {
  const [tileX, tileY, tileZ] = tile
  const { viewportHeight, viewportWidth } = viewport

  const magnification = Math.pow(2, zoom - tileZ)
  const scale = (window.devicePixelRatio * 512) / size
  const tileSize = size * scale * magnification

  const tileCountX = viewportWidth / tileSize
  const tileCountY = viewportHeight / tileSize

  const deltaX = Math.ceil(tileCountX / 2)
  const deltaY = Math.ceil(tileCountY / 2)

  console.log({ tileSize, viewportWidth, tileCountX })
  // console.log({ tileCountX, tileCountY })
  // console.log({ deltaX, deltaY })
  let offsets = []
  for (let x = deltaX * -1; x <= deltaX; x++) {
    for (let y = deltaY * -1; y <= deltaY; y++) {
      offsets.push([tileX + x, tileY + y, tileZ])
    }
  }
  // console.log(offsets)

  const max = Math.pow(2, tileZ) - 1
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

// todo: handle rendering tiles at _higher_ zooms when cached
export const getKeyToRender = (targetKey, tiles) => {
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

  // fallback to original key if none are cached
  return targetKey
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
