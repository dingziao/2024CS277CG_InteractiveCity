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
// scene.background = new THREE.Color('#c8f0f9')

var textureLoader = new THREE.CubeTextureLoader();
var texture = textureLoader.load([
    './textures/DaylightBox_Right.jpg', './textures/DaylightBox_Left.jpg',
    './textures/DaylightBox_Top.jpg', './textures/DaylightBox_Bottom.jpg',
    './textures/DaylightBox_Front.jpg', './textures/DaylightBox_Back.jpg'
]);
scene.background = texture

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: true}) // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding // set color encoding
container.appendChild(renderer.domElement) // add the renderer to html div

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 500)
camera.position.set(50,5,-35)
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

    // ziao: load cause stuck?

    loadMercedesBenzModel();
    // loadDog();
})

let mercedesBenzModel; // 用于在渲染循环外部引用模型

function loadMercedesBenzModel() {
    loader.load('models/gltf/mersedes-benz_sl63_amg_free.glb', function (gltf) {
        // gltf.scene.position.set(18, 7.8, 25.3); // 初始化位置
        // gltf.scene.position.set(28.3, 7.8, -5); // 初始化位置
        gltf.scene.position.set(-15, 7.8, 25.3); // 初始化位置
        gltf.scene.scale.set(1.4, 1.4, 1.4); // 初始化缩放
        scene.add(gltf.scene);
        mercedesBenzModel = gltf.scene; // 保存对模型的引用
    });
}
/////////////////////////////////////////////////////////////////////////
//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
    controls.enabled = false //disable orbit controls to animate the camera
    
    new TWEEN.Tween(camera.position.set(50,10,-35 )).to({ // from camera position
        x: 0, //desired x position to go
        y: 50, //desired y position to go
        z: 40 //desired z position to go
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
    controls.minDistance = 20
    controls.maxDistance = 5000
    controls.enableRotate = true
    controls.enableZoom = true
    controls.maxPolarAngle = Math.PI /2.5
}

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION
const driveSpeed = 0.1; // 行驶速度

// 考虑到车辆的循环路径，我们将使用具体的坐标点来控制转向

function updateVehiclePosition() {
    let direction;
    let newTargetRotationY;
    let targetRotationY = mercedesBenzModel.rotation.y; // 初始化目标旋转角度为当前角度
    // 检测车辆位置并决定行进方向
    if (mercedesBenzModel.position.x < 28.3 && mercedesBenzModel.position.z === 25.3) {
        // 向x正方向行驶直到达到(28.3, 25.3)
        direction = {x: 1, z: 0 };
    } else if (mercedesBenzModel.position.x >= 28.3 && mercedesBenzModel.position.z > -15) {
        // 在(28.3, 25.3)左转，向-z方向行驶直到(28.3, -10)
        direction = {x: 0, z: -1 }; 
    } else if (mercedesBenzModel.position.z <= -15 && mercedesBenzModel.position.x > -13.5) {
        // 在(28.3, -10)左转，向-x方向行驶直到(-20, -10)
        direction = { x: -1, z: 0 }; 
    } else if (mercedesBenzModel.position.x <= -13.5 && mercedesBenzModel.position.z < 25.3) {
        // 在(-20, -10)左转，向+z方向行驶直到(-13.5, 25.3)
        direction = { x: 0, z: 1 };
    }

    // 规范化方向向量
    const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
    const normalizedDirection = { x: direction.x / length, z: direction.z / length };

    // 根据方向更新车辆位置
    mercedesBenzModel.position.x += normalizedDirection.x * driveSpeed;
    mercedesBenzModel.position.z += normalizedDirection.z * driveSpeed;

    // 调整车辆旋转以面向移动方向
    newTargetRotationY = Math.atan2(-normalizedDirection.x, -normalizedDirection.z) + Math.PI;

    // 修正旋转方向以选择最短路径
    const alpha = 0.05; // 根据需要调整这个值
    let currentRotationY = mercedesBenzModel.rotation.y;
    let rotationDifference = newTargetRotationY - currentRotationY;

    // 确保差异在 -π 到 π 范围内
    while (rotationDifference > Math.PI) rotationDifference -= 2 * Math.PI;
    while (rotationDifference < -Math.PI) rotationDifference += 2 * Math.PI;

    // 应用平滑旋转
    mercedesBenzModel.rotation.y += rotationDifference * alpha;
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
var params = {color: sunLight.color.getHex(), color2: ambient.color.getHex(), color3: null
    // scene.background.getHex()
}

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