const drawGrid = (regl) => regl({
  frag: `
  precision mediump float;
  varying float fragValue;
  uniform sampler2D lut;
  uniform float scale;
  uniform float threshold;
  void main() {
    vec4 c = texture2D(lut, vec2(fragValue * scale, 1.0));
    if (fragValue < threshold) {
      discard; 
    }
    gl_FragColor = vec4(c.x, c.y, c.z, 0.9);
    gl_FragColor.rgb *= gl_FragColor.a;
  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  attribute float value;
  varying float fragValue;
  uniform vec3 camera;
  uniform vec2 offset;
  uniform float width;
  uniform float height;
  uniform float mag;
  void main() {
    float x = position.x;
    float y = position.y;
    x = (x * mag * pow(2.0, camera.z) + offset.x * mag * pow(2.0, camera.z) - camera.x) / pow(2.0, camera.z);
    x = (2.0 * x / width);
    y = (y * mag * pow(2.0, camera.z) + offset.y * mag * pow(2.0, camera.z) - camera.y) / pow(2.0, camera.z);
    y = -(2.0 * y / height);
    fragValue = value;
    gl_PointSize = max(1.0, mag * pow(2.0, camera.z) * (250.0/4000.0) * 0.94 * (1.0 * pow(2.0, (4.0 - camera.z))));
    gl_Position = vec4(x, y, 0.0, 1.0);
  }`,

  attributes: {
    position: regl.prop('position'),
    value: regl.prop('value')
  },

  uniforms: {
    camera: regl.prop('camera'),
    scale: regl.prop('scale'),
    lut: regl.prop('lut'),
    width: regl.prop('width'),
    height: regl.prop('height'),
    threshold: regl.prop('threshold'),
    offset: regl.prop('offset'),
    mag: regl.prop('mag')
  },

  blend: {
    enable: true,
    func: {
      src: 'one',
      srcAlpha: 'one',
      dstRGB: 'one minus src alpha',
      dstAlpha: 'one minus src alpha',
    }
  },

  depth: { enable: false },

  count: regl.prop('count'),

  primitive: 'points'
})

export default drawGrid