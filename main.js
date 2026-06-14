import * as THREE from
'https://unpkg.com/three@0.166.1/build/three.module.js';

import { ARButton } from
'https://unpkg.com/three@0.166.1/examples/jsm/webxr/ARButton.js';

let scene;
let camera;
let renderer;

let controller;

let reticle;
let hitTestSource = null;
let hitTestSourceRequested = false;

let placedCube = null;

init();

function init(){

scene = new THREE.Scene();

camera =
new THREE.PerspectiveCamera(
70,
window.innerWidth /
window.innerHeight,
0.01,
20
);

renderer =
new THREE.WebGLRenderer({
antialias:true,
alpha:true
});

renderer.setSize(
window.innerWidth,
window.innerHeight
);

renderer.xr.enabled = true;

document.body.appendChild(
renderer.domElement
);

const light =
new THREE.HemisphereLight(
0xffffff,
0xbbbbff,
1
);

scene.add(light);

createReticle();

controller =
renderer.xr.getController(0);

controller.addEventListener(
'select',
onSelect
);

scene.add(controller);

const button =
ARButton.createButton(
renderer,
{
requiredFeatures:[
'hit-test'
]
}
);

button.style.display='none';

document.body.appendChild(button);

document
.getElementById('enterAR')
.addEventListener(
'click',
()=>{
button.click();
}
);

renderer.setAnimationLoop(render);

}

function createReticle(){

new THREE.RingGeometry(
0.03,
0.04,
32
);

geometry.rotateX(
-Math.PI / 2
);

const material =
new THREE.MeshBasicMaterial({
color:0x00ff00
});

reticle =
new THREE.Mesh(
geometry,
material
);

reticle.matrixAutoUpdate =
false;

reticle.visible =
false;

scene.add(reticle);

}
function createCar(){

const car =
new THREE.Group();

const body =
new THREE.Mesh(

new THREE.BoxGeometry(
0.25,
0.08,
0.4
),

new THREE.MeshStandardMaterial({
color:0xff3333
})

);

body.position.y =
0.05;

car.add(body);

return car;

}

function onSelect(){

alert("TOQUE FUNCIONOU");

}

function render(
timestamp,
frame
){

if(frame){

const referenceSpace =
renderer.xr
.getReferenceSpace();

const session =
renderer.xr
.getSession();

if(
!hitTestSourceRequested
){

session
.requestReferenceSpace(
'viewer'
)
.then(
(space)=>{

session
.requestHitTestSource(
{
space
}
)
.then(
(source)=>{
hitTestSource =
source;
}
);

}
);

session.addEventListener(
'end',
()=>{
hitTestSourceRequested =
false;
hitTestSource = null;
}
);

hitTestSourceRequested =
true;

}

if(hitTestSource){

const hitTestResults =
frame.getHitTestResults(
hitTestSource
);

if(
hitTestResults.length
){

const hit =
hitTestResults[0];

const pose =
hit.getPose(
referenceSpace
);

reticle.visible =
true;

reticle.matrix.fromArray(
pose.transform.matrix
);

}else{


}

}

}

renderer.render(
scene,
camera
);

}
