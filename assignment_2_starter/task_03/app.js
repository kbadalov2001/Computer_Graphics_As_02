let gl, program;
let vertexCount = 36;
let modelViewMatrix, projectionMatrix;

let eye = [0, 0, 0.1];
let at = [0, 0, 0];
let up = [0, 1, 0];

let left = -2.0;
let right = 2.0;
let bottom = -2.0;
let ytop = 2.0;
let near = -10.0;
let far = 10.0;


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
    },
    'I': {
      eye: [1, 1, 1],
      at: [0, 0, 0],
      up: [0, 1, 0]
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
  projectionMatrix = gl.getUniformLocation(program, 'projectionMatrix');

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
      rotateCamera(0.1); // Rotate the camera clockwise by 0.1 radians
    } else if (key === 'A') {
      rotateCamera(-0.1); // Rotate the camera counter-clockwise by 0.1 radians
    } else if (key === 'W') {
      zoomIn(); // Zoom in
    } else if (key === 'S') {
      zoomOut(); // Zoom out
    }
  
    render();
  }

function rotateCamera(theta) {
  const cos_t = Math.cos(theta);
  const sin_t = Math.sin(theta);

  let new_up;
  if (eye[0] === 0 && eye[1] === 1 && eye[2] === 0) {
    new_up = [sin_t * up[2] + cos_t * up[0], up[1], cos_t * up[2] - sin_t * up[0]];
  } else if (eye[0] === -1 && eye[1] === 0 && eye[2] === 0) {
    new_up = [up[0], sin_t * up[2] + cos_t * up[1], cos_t * up[2] - sin_t * up[1]];
  } else {
    new_up = [cos_t * up[0] - sin_t * up[1], sin_t * up[0] + cos_t * up[1], up[2]];
  }

  up = new_up;
  const mvm = lookAt(eye, at, up);
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvm));

  render();
}

function zoomIn() {
  left += 0.1;
  right -= 0.1;
  bottom += 0.1;
  ytop -= 0.1;
  updateProjectionMatrix();
}

function zoomOut() {
  left -= 0.1;
  right += 0.1;
  bottom -= 0.1;
  ytop += 0.1;
  updateProjectionMatrix();
}

function updateProjectionMatrix() {
  const projMatrix = ortho(left, right, bottom, top, near, far);
  gl.uniformMatrix4fv(projectionMatrix, false, flatten(projMatrix));
}



function render() {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let mvm = lookAt(eye, at, up);

  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvm));

  const projMatrix = ortho(left, right, bottom, ytop, near, far);
  gl.uniformMatrix4fv(projectionMatrix, false, flatten(projMatrix));

  gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0);

  requestAnimationFrame(render);
}