import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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

const orthoCamera = new THREE.OrthographicCamera(
    window.innerWidth / - 2,
    window.innerWidth / 2, 
    window.innerHeight / 2, 
    window.innerHeight / - 2, 
    1, 
    1000
);

// scene.add( orthoCamera );
orthoCamera.position.set(75,20,75);
orthoCamera.zoom = 10;
orthoCamera.updateProjectionMatrix();

const controls = new OrbitControls( perspCamera, renderer.domElement );
controls.enablePan = true;
controls.minDistance=0.1;
controls.maxDistance=150;
controls.minPolarAngle=0;
controls.maxPolarAngle=3;
controls.autoRotate=false;
controls.target = new THREE.Vector3( 0, 0, 0 );
controls.rotateSpeed = 0.15;
controls.zoomSpeed = 0.50;
controls.panSpeed = 0.50;
controls.update();

const timer = new THREE.Timer();
timer.connect( document );

const ambientLight = new THREE.AmbientLight( 0xffffff, 1.5 ); // Color, Intensity
scene.add( ambientLight );

const gridHelper = new THREE.GridHelper( 100, 50, 0x444444, 0x444444 ); // ( size, divisions )
gridHelper.position.set( 0, 0, 0 );
scene.add( gridHelper );

const perfMonitor = new PerformanceMonitor();



// // Vertex and Fragment Shaders

const vertexShader = `
    attribute vec3 a_InstanceColor;

    uniform float u_Time;

    varying vec2 v_Uv;
    varying vec3 v_InstanceColor;
    varying vec3 v_Position;
    varying vec3 v_Normal;

    void main() {
        v_Uv = uv;
        v_InstanceColor = a_InstanceColor;
        v_Position = position;
        v_Normal = normal;

        vec4 instancedPos = instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * instancedPos;
    }
`

const fragmentShader = `
    uniform float u_Time;
    uniform vec2 u_Resolution;

    varying vec2 v_Uv;
    varying vec3 v_InstanceColor;
    varying vec3 v_Position;
    varying vec3 v_Normal;

    void main() {
        vec2 st = gl_FragCoord.xy / u_Resolution;
        vec3 viewDirection = normalize(cameraPosition - v_Position);
        float fresnel = dot(viewDirection, v_Normal);
        gl_FragColor = vec4((v_InstanceColor * fresnel ), 1.0);
    }
`





// // Raw Geometry Declaration

const geometry = new THREE.IcosahedronGeometry( 5, 1 );

// const material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });

const material = new THREE.ShaderMaterial({
    uniforms: {
        u_Resolution: {
            value: [ window.innerWidth, window.innerHeight ]
        },
        u_Time : {
            value: 0.0
        }
    },
    vertexShader,
    fragmentShader,
    wireframe: true
});





// // InstancedMesh Declaration

const instancedColors = [
    new THREE.Color(0xff0000), // Red
    new THREE.Color(0x00ff00), // Green
    new THREE.Color(0x0000ff), // Blue
    new THREE.Color(0xffff00), // Yellow
    new THREE.Color(0xff00ff)  // Magenta
];

const nInstances = 1000;
let instColor;

const instancedColorsArray = new Float32Array(nInstances * 3);

for (let i = 0; i < nInstances; i++) {
    instColor = instancedColors[ Math.floor(Math.random() * 10 / 2) ];

    instancedColorsArray[i * 3 + 0] = instColor.r
    instancedColorsArray[i * 3 + 1] = instColor.g
    instancedColorsArray[i * 3 + 2] = instColor.b
};

geometry.setAttribute('a_InstanceColor', new THREE.InstancedBufferAttribute(instancedColorsArray, 3)); // The 3 is the stride size

let dummy = new THREE.Object3D();
const instancedMesh = new THREE.InstancedMesh( geometry, material, nInstances );

scene.add( instancedMesh );

for (let i = 0; i<nInstances; i++){
    dummy.position.set(
        Math.round((Math.random() - 0.5) * 1000 + 50 ),
        Math.round((Math.random() - 0.5) * 1000 + 50 ),
        Math.round((Math.random() - 0.5) * 1000 + 50 )
    );
    
    dummy.updateMatrixWorld();
    
    instancedMesh.setMatrixAt( i, dummy.matrix);
};

console.log(instancedMesh);

// const mesh = new THREE.Mesh( geometry, material );
// scene.add( mesh );


window.addEventListener()


// // Animate function

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    
    renderer.render( scene, perspCamera );

    timer.update();
    material.uniforms.u_Time.value = timer.getElapsed();

    perfMonitor.update(renderer, scene);
};

animate();