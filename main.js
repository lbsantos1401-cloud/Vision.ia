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

const geometry =
new THREE.BoxGeometry(
2,
2,
2
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

reticle.position.set(
0,
-1,
-3
);

scene.add(reticle);
console.log("Cubo criado");
console.log(reticle.position);
}

function onSelect(){

if(!reticle.visible) return;

if(placedCube) return;

const geometry =
new THREE.BoxGeometry(
0.2,
0.1,
0.3
);

const material =
new THREE.MeshStandardMaterial({
color:0xff0000
});

placedCube =
new THREE.Mesh(
geometry,
material
);

placedCube.position.setFromMatrixPosition(
reticle.matrix
);

scene.add(placedCube);

console.log(
'Cubo criado'
);

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
