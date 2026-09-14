import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { PerformanceMonitor } from './utils/performanceMonitor.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( "#272727" );
renderer.setPixelRatio( window.devicePixelRatio );

document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const perspCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
perspCamera.position.set(75,20,75);

const controls = new OrbitControls( perspCamera, renderer.domElement );
controls.enagleDamping = true;
controls.enablePan = false;
controls.minDistance=0.1;
controls.maxDistance=150;
controls.minPolarAngle=0;
controls.maxPolarAngle=3;
controls.autoRotate=false;
controls.target = new THREE.Vector3( 0, 0, 0 );
controls.rotateSpeed = 0.15;
controls.zoomSpeed = 0.50;
controls.update();

const timer = new THREE.Timer();
timer.connect( document );

const perfMonitor = new PerformanceMonitor();

const guiControls = {
    wireframe: true,
    darkMode: true,
    oscillateColors: true
}



// // Vertex and Fragment Shaders

const vertexShader = `
    attribute vec3 a_InstanceColor;

    uniform float u_Time;

    varying vec3 v_InstanceColor;
    varying vec3 v_Position;
    varying vec3 v_Normal;

    void main() {
        v_Position = position;
        v_Normal = normal;
        v_InstanceColor = a_InstanceColor;

        vec4 instancedPos = instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * instancedPos;
    }
`

const fragmentShader = `
    uniform float u_Time;

    varying vec2 v_Uv;
    varying vec3 v_InstanceColor;
    varying vec3 v_Position;
    varying vec3 v_Normal;

    void main() {
        
        vec3 viewDirection = normalize(cameraPosition - v_Position);
        float fresnel = dot(viewDirection, v_Normal);
        
        gl_FragColor = vec4(vec3( fresnel * abs(cos( v_InstanceColor + u_Time )) ), 1.0);
    }
`


// // Raw Geometry Declaration

const geometry = new THREE.IcosahedronGeometry( 5, 1 );

const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    wireframe: true
});

material.uniforms.u_Time = {value: 0.0};



// // InstancedMesh Declaration

const instancedColors = [
    new THREE.Color(0xff0000), // Red
    new THREE.Color(0x00ff00), // Green
    new THREE.Color(0x0000ff), // Blue
    new THREE.Color(0xffff00), // Yellow
    new THREE.Color(0xff00ff)  // Magenta
];

const nInstances = 100;
let instColor;

const colorsArray = new Float32Array( nInstances * 3 );

for (let i = 0; i < nInstances; i++) {
    instColor = instancedColors[ Math.floor(Math.random() * 10 / 2) ];

    colorsArray[i * 3 + 0] = instColor.r
    colorsArray[i * 3 + 1] = instColor.g
    colorsArray[i * 3 + 2] = instColor.b
};

geometry.setAttribute('a_InstanceColor', new THREE.InstancedBufferAttribute( colorsArray, 3 )); // The 3 is the stride size

let dummy = new THREE.Object3D();
const instancedMesh = new THREE.InstancedMesh( geometry, material, nInstances );

scene.add( instancedMesh );

for (let i = 0; i<nInstances; i++){
    dummy.position.set(
        Math.round(( Math.random() - 0.5) * 200 + 10 ),
        Math.round(( Math.random() - 0.5) * 200 + 10 ),
        Math.round(( Math.random() - 0.5) * 200 + 10 )
    );
    
    dummy.updateMatrixWorld();
    
    instancedMesh.setMatrixAt( i, dummy.matrix );
};



function configGUI() {

    const gui = new GUI();
    
    gui.add(guiControls, "wireframe").name("wireframe").onChange( v => {
        material.wireframe = v;
    });
    
    gui.add(guiControls, "darkMode").name("darkMode").onChange( v => {
        const renderBackgroundColor = v ? "#272727" : "#8f8f8f";
        renderer.setClearColor(renderBackgroundColor)
    });

    gui.add(guiControls, "oscillateColors").name("changeColors").onChange( v => {
        guiControls.oscillateColors = v;
    });

}


window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


// // Animate function

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    
    renderer.render( scene, perspCamera );

    timer.update();
    
    if (guiControls.oscillateColors) {
        material.uniforms.u_Time.value = timer.getElapsed();
    }

    perfMonitor.update(renderer, scene);
};

configGUI();
animate();