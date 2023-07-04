let gl, program;
let vertexCount = 36;
let modelViewMatrix;

let eye = [0, 0, 0.1];
let at = [0, 0, 0];
let up = [0, 1, 0];

// Define camera views
const views = {
  'T': {
    eye: [0, 1, 0],
    at: [0, 0, 0],
    up: [0, 0, -1]
  },
  'L': {
    eye: [-1, 0, 0],
    at: [0, 0, 0],
    up: [0, 1, 0]
  },
  'F': {
    eye: [0, 0, 1],
    at: [0, 0, 0],
    up: [1, 0, 0]
  }
};

onload = () => {
  let canvas = document.getElementById("webgl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert('No webgl for you');
    return;
  }

  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0, 0, 0, 0.5);

  let vertices = [
    -1, -1, 1,
    -1, 1, 1,
    1, 1, 1,
    1, -1, 1,
    -1, -1, -1,
    -1, 1, -1,
    1, 1, -1,
    1, -1, -1,
  ];

  let indices = [
    0, 3, 1,
    1, 3, 2,
    4, 7, 5,
    5, 7, 6,
    3, 7, 2,
    2, 7, 6,
    4, 0, 5,
    5, 0, 1,
    1, 2, 5,
    5, 2, 6,
    0, 3, 4,
    4, 3, 7,
  ];

  let colors = [
    0, 0, 0,
    0, 0, 1,
    0, 1, 0,
    0, 1, 1,
    1, 0, 0,
    1, 0, 1,
    1, 1, 0,
    1, 1, 1,
  ];

  // You should get rid of the line below eventually
  vertices = scale(0.5, vertices);

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  let iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

  let cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  let vColor = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  modelViewMatrix = gl.getUniformLocation(program, 'modelViewMatrix');

  document.addEventListener('keydown', handleKeyDown);

  render();
};

function handleKeyDown(event) {
    let key = event.key.toUpperCase();
  
    if (views.hasOwnProperty(key)) {
      const view = views[key];
      eye = view.eye;
      at = view.at;
      up = view.up;
    } else if (key === 'D') {
      rotateCameraClockwise(5); // Rotate the camera clockwise by 5 degrees
    } else if (key === 'A') {
      rotateCameraCounterClockwise(-5); // Rotate the camera counter-clockwise by 5 degrees
    }
  
    render();
  }
  
  function rotateCamera(theta) {
    const rotationMatrix = mat4();
    mat4.rotateY(rotationMatrix, rotationMatrix, theta);
  
    const eyeVector = vec4(eye[0], eye[1], eye[2], 1.0);
    const transformedEye = vec4();
    vec4.transformMat4(transformedEye, eyeVector, rotationMatrix);
  
    eye[0] = transformedEye[0];
    eye[1] = transformedEye[1];
    eye[2] = transformedEye[2];
  
    const upVector = vec4(up[0], up[1], up[2], 0.0);
    const transformedUp = vec4();
    vec4.transformMat4(transformedUp, upVector, rotationMatrix);
  
    up[0] = transformedUp[0];
    up[1] = transformedUp[1];
    up[2] = transformedUp[2];
  
    let mvm = lookAt(eye, at, up);
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvm));
  
    render();
  }
  
  
  
  

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let mvm = lookAt(eye, at, up);

  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvm));

  gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0);

  requestAnimationFrame(render);
}