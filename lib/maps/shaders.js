const _sh = (mode) => {
  return (value, which) => {
    if (which.includes(mode)) return value
    return ''
  }
}

export const vert = (mode) => {
  const sh = _sh(mode)

  return `
  precision mediump float;
  attribute vec2 position;
  ${sh(`varying vec2 uv;`, ['texture'])}
  ${sh(`attribute float value;`, ['grid', 'dotgrid'])}
  ${sh(`varying float valuev;`, ['grid', 'dotgrid'])}
  uniform vec2 camera;
  uniform float viewportWidth;
  uniform float viewportHeight;
  uniform float pixelRatio;
  uniform float zoom;
  uniform float size;
  uniform float globalLevel;
  uniform float level;
  uniform vec2 offset;
  void main() {
    float scale = pixelRatio * 512.0 / size;
    float globalMagnification = pow(2.0, zoom - globalLevel);
    float magnification = pow(2.0, zoom - level);
    float x = magnification * (position.x + offset.x * size) - globalMagnification * camera.x * size ;
    float y = magnification * (position.y + offset.y * size) - globalMagnification * camera.y * size ;
    x = (scale * x);
    y = (scale * y);
    x = (2.0 * x / viewportWidth);
    y = -(2.0 * y / viewportHeight);
    ${sh(`uv = vec2(position.y, position.x) / size;`, ['texture'])}
    ${sh(`valuev = value;`, ['grid','dotgrid'])}
    ${sh(`gl_PointSize = 0.9 * scale * magnification;`, ['grid','dotgrid'])}
    gl_Position = vec4(x, y, 0.0, 1.0);
  }`
}

export const frag = (mode) => {
  const sh = _sh(mode)

  return `
  precision mediump float;
  uniform float opacity;
  uniform sampler2D colormap;
  uniform vec2 clim;
  ${sh(`varying vec2 uv;`, ['texture'])}
  ${sh(`uniform sampler2D value;`, ['texture'])}
  ${sh(`varying float valuev;`, ['grid','dotgrid'])}
  void main() {
    ${sh(`
    vec4 i = texture2D(value, uv);
    if (i.x == -999.0) {
      discard;
    }
    float raw = i.x;
    `, ['texture'])}
    ${sh(`float raw = valuev;`, ['grid','dotgrid'])}
    ${sh(`
    if (length(gl_PointCoord.xy - 0.5) > 0.5) {
      discard;
    }
    `, ['dotgrid'])}
    float rescaled = (raw - clim.x)/(clim.y - clim.x);
    vec4 c = texture2D(colormap, vec2(rescaled, 1.0));  
    gl_FragColor = vec4(c.x, c.y, c.z, opacity);
    gl_FragColor.rgb *= gl_FragColor.a;
  }`
}