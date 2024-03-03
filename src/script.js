/////////////////////////////////////////////////////////////////////////
///// IMPORT
import './main.css'
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER
const dracoLoader = new DRACOLoader()
const loader = new GLTFLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
dracoLoader.setDecoderConfig({ type: 'js' })
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement('div')
document.body.appendChild(container)

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene()
scene.background = new THREE.Color('#c8f0f9')

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: true}) // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding // set color encoding
container.appendChild(renderer.domElement) // add the renderer to html div

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100)
camera.position.set(34,16,-20)
scene.add(camera)

/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
    const width = window.innerWidth
    const height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(2)
})

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)

/////////////////////////////////////////////////////////////////////////
///// SCENE LIGHTS
const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82)
scene.add(ambient)

const sunLight = new THREE.DirectionalLight(0xe8c37b, 1.96)
sunLight.position.set(-69,44,14)
scene.add(sunLight)

/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
loader.load('models/gltf/city.glb', function (gltf) {

    scene.add(gltf.scene)
    loadMercedesBenzModel();
    loadDog();
})

let mercedesBenzModel; // 用于在渲染循环外部引用模型

function loadMercedesBenzModel() {
    loader.load('models/gltf/mersedes-benz_sl63_amg_free.glb', function (gltf) {
        gltf.scene.position.set(10, 0, 3); // 初始化位置
        gltf.scene.scale.set(3, 3, 3); // 初始化缩放
        scene.add(gltf.scene);
        mercedesBenzModel = gltf.scene; // 保存对模型的引用
    });
}

function loadDog() {
    loader.load('models/gltf/animated_dog_shiba_inu.glb', function (gltf) {
        gltf.scene.position.set(3, 0, 3); // 初始化位置
        gltf.scene.scale.set(0.1, 0.1, 0.1); // 初始化缩放
        scene.add(gltf.scene);
        dog = gltf.scene; // 保存对模型的引用
    });
}
/////////////////////////////////////////////////////////////////////////
//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
    controls.enabled = false //disable orbit controls to animate the camera
    
    new TWEEN.Tween(camera.position.set(26,4,-35 )).to({ // from camera position
        x: 16, //desired x position to go
        y: 50, //desired y position to go
        z: -0.1 //desired z position to go
    }, 6500) // time take to animate
    .delay(1000).easing(TWEEN.Easing.Quartic.InOut).start() // define delay, easing
    .onComplete(function () { //on finish animation
        controls.enabled = true //enable orbit controls
        setOrbitControlsLimits() //enable controls limits
        TWEEN.remove(this) // remove the animation from memory
    })
}

introAnimation() // call intro animation on start

/////////////////////////////////////////////////////////////////////////
//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits(){
    controls.enableDamping = true
    controls.dampingFactor = 0.04
    controls.minDistance = 35
    controls.maxDistance = 60
    controls.enableRotate = true
    controls.enableZoom = true
    controls.maxPolarAngle = Math.PI /2.5
}

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION
let currentEdge = 0; // 当前正在行驶的边的索引（0-3）
const squareSize = 0.1; // 正方形边长
const squareVertices = [ // 正方形的四个顶点
    { x: -squareSize / 2, z: -squareSize / 2 }, // 左下
    { x: squareSize / 2, z: -squareSize / 2 }, // 右下
    { x: squareSize / 2, z: squareSize / 2 }, // 右上
    { x: -squareSize / 2, z: squareSize / 2 } // 左上
];
const driveSpeed = 0.02; // 行驶速度

function updateVehiclePosition() {
    // 获取当前顶点和下一个顶点
    const currentVertex = squareVertices[currentEdge];
    const nextVertex = squareVertices[(currentEdge + 1) % squareVertices.length];

    // 计算向下一个顶点行驶的方向向量
    const direction = { x: nextVertex.x - currentVertex.x, z: nextVertex.z - currentVertex.z };
    const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
    const normalizedDirection = { x: direction.x / length, z: direction.z / length };

    // 更新车辆位置
    mercedesBenzModel.position.x += normalizedDirection.x * driveSpeed;
    mercedesBenzModel.position.z += normalizedDirection.z * driveSpeed;

    // 计算是否到达下一个顶点
    if (Math.abs(mercedesBenzModel.position.x - nextVertex.x) < 0.5 && Math.abs(mercedesBenzModel.position.z - nextVertex.z) < 0.5) {
        currentEdge = (currentEdge + 1) % squareVertices.length; // 转向下一个边
    }

    // 更新车辆朝向，加上Math.PI来调整方向
    mercedesBenzModel.rotation.y = Math.atan2(-normalizedDirection.x, normalizedDirection.z) + Math.PI;
}



function rendeLoop() {

    TWEEN.update() // update animations

    controls.update() // update orbit controls
    if (mercedesBenzModel) {
        updateVehiclePosition();
    }

    renderer.render(scene, camera) // render the scene using the camera

    requestAnimationFrame(rendeLoop) //loop the render function
    
}

rendeLoop() //start rendering

import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
const gui = new GUI()

// create parameters for GUI
var params = {color: sunLight.color.getHex(), color2: ambient.color.getHex(), color3: scene.background.getHex()}

// create a function to be called by GUI
const update = function () {
	var colorObj = new THREE.Color( params.color )
	var colorObj2 = new THREE.Color( params.color2 )
	var colorObj3 = new THREE.Color( params.color3 )
	sunLight.color.set(colorObj)
	ambient.color.set(colorObj2)
	scene.background.set(colorObj3)
}

//////////////////////////////////////////////////
//// GUI CONFIG
gui.add(sunLight, 'intensity').min(0).max(10).step(0.0001).name('Dir intensity')
gui.add(sunLight.position, 'x').min(-100).max(100).step(0.00001).name('Dir X pos')
gui.add(sunLight.position, 'y').min(0).max(100).step(0.00001).name('Dir Y pos')
gui.add(sunLight.position, 'z').min(-100).max(100).step(0.00001).name('Dir Z pos')
gui.addColor(params,'color').name('Dir color').onChange(update)
gui.addColor(params,'color2').name('Amb color').onChange(update)
gui.add(ambient, 'intensity').min(0).max(10).step(0.001).name('Amb intensity')
gui.addColor(params,'color3').name('BG color').onChange(update)

//////////////////////////////////////////////////
//// ON MOUSE MOVE TO GET CAMERA POSITION
document.addEventListener('mousemove', (event) => {
    event.preventDefault()

    console.log(camera.position)

}, false)