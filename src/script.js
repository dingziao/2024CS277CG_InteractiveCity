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
const container = document.querySelector('#container')

const clock = new THREE.Clock();
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

    //ziao: Load moving model after intro animation
    // loadMercedesBenzModel();
    // loadHelicopter();
    
    loadDog();
    loadCharacter();
})

let mercedesBenzModel; // 用于在渲染循环外部引用模型
let dog;
let helicopterModel;

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

function loadDog() {
    loader.load('models/gltf/animated_dog_shiba_inu.glb', function (gltf) {
        gltf.scene.position.set(3, 8, 3); // 初始化位置
        gltf.scene.scale.set(0.05, 0.05, 0.05); // 初始化缩放
        scene.add(gltf.scene);
        dog = gltf.scene; // 保存对模型的引用
    });
}

function loadCharacter() {
    loader.load('models/gltf/character_policeman.glb', function (gltf) {
        gltf.scene.position.set(6, 8, -18);
        gltf.scene.scale.set(3, 3, 3);
        scene.add(gltf.scene);
    });

    loader.load('models/gltf/character_girl.glb', function (gltf) {
        gltf.scene.position.set(25, 8, 40);
        gltf.scene.scale.set(2, 2, 2);
        scene.add(gltf.scene);
    });

    loader.load('models/gltf/character_boy.glb', function (gltf) {
        gltf.scene.position.set(27, 8, 40);
        gltf.scene.scale.set(2, 2, 2);
        scene.add(gltf.scene);
    });

    loader.load('models/gltf/character_doctor.glb', function (gltf) {
        gltf.scene.position.set(6, 8, -18);
        gltf.scene.scale.set(3, 3, 3);
        scene.add(gltf.scene);
    });
}

let mixer; // 定义一个全局变量来存储动画混合器

function loadHelicopter() {
    loader.load('models/gltf/helicopter.glb', function (gltf) {
        gltf.scene.position.set(-15, 30, 25.3); // 初始化位置
        gltf.scene.scale.set(0.3, 0.3, 0.3); // 初始化缩放
        scene.add(gltf.scene);

        // 创建动画混合器并播放所有动画
        mixer = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });
        helicopterModel = gltf.scene;
    });
}

var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()

function onMouseClick(event){

    //将鼠标点击位置的屏幕坐标转换成threejs中的标准坐标

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY/window.innerHeight) *2 + 1
    
    // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
    raycaster.setFromCamera( mouse, camera );

    // 获取raycaster直线和所有模型相交的数组集合
    var intersects = raycaster.intersectObjects( scene.children ).map(i=>i.object);
    for(let i of intersects) {
        //Dog
        if(i.name == "Object_206") {
            // window.open("https://en.wikipedia.org/wiki/Dog");
            dog.scale.x == 0.5 ?  
            window.open("https://www.petfinder.com/search/dogs-for-adoption/us/nh/hanover/") 
            : dog.scale.set(0.5, 0.5, 0.5);
            console.log(dog);
            break
        }

        // Car
        if(i.name == "SL63_underbody_SL63_underbody_0" || i.name == "SL63_engine-63V8_chassis2_0") {
            window.open("https://www.mbusa.com/en/vehicles/class/sl/roadster?sd_campaign_type=Search&sd_digadprov=Resolution&sd_campaign=Corporate_Google_Brand_TEV&sd_channel=GOOGLE&sd_adid=TEV_AMG_Roadster_SL&sd_digadkeyword=mercedes+sl&gad_source=1&gclid=CjwKCAiA3JCvBhA8EiwA4kujZhW-5bsvJLBYuYIw2ej7qgo2-v1m6m2MBDxWvmNsUTAoabxJwFrRGhoCzd4QAvD_BwE&gclsrc=aw.ds");
            break;
        }

        // Helicopter
        if(i.name == "Copter_Palette_0") {
            window.open("https://www.boeing.com/defense/ah-64-apache");
            break;
        }

        //Hamburger
        if(i.name == "Hambuger_Color_0") {
            window.open("https://www.grubhub.com/food/burger_king/nh-hanover");
            break
        }

        //Cafe
        if(i.userData.name == "Piattino_caffe_01_Color_0") {
            window.open("https://lousrestaurant.com");
            break
        }

        // Bus
        if(i.name == "Fermata_bus_01_Color_0" || i.userData.name == "BUS_STOP_02_Color_0") {
            window.open("https://dartmouthcoach.com/")
            break
        }
    }  
}

window.addEventListener( 'click', onMouseClick, false );
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
        //Load model
        loadMercedesBenzModel();
        loadHelicopter();
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


let helicopterSpeed = 0.03;
let lastDirectionChangeTime = 0; // 上次方向变更的时间
let directionChangeInterval = Math.random() * 500 + 3000;
let direction = {x: -20, z: 30, y: 25}; // 初始方向，包括y轴

function updateHelicopterPosition(deltaTime) {
    lastDirectionChangeTime += deltaTime * 1000;

    // 检查是否需要改变方向
    if (lastDirectionChangeTime >= directionChangeInterval) {
        const directionChangeMagnitude = 0.5;
        direction = {
            x: direction.x + (Math.random() * 2 - 1) * directionChangeMagnitude,
            z: direction.z + (Math.random() * 2 - 1) * directionChangeMagnitude,
            y: direction.y + (Math.random() * 2 - 1) * directionChangeMagnitude,
        };
        // 重新规范化方向向量以确保其长度为1
        const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z + direction.y * direction.y);
        direction.x /= length;
        direction.z /= length;
        direction.y /= length;
        lastDirectionChangeTime = 0;
        directionChangeInterval = Math.random() * 500 + 3000;
    }

    // 规范化方向向量
    const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z + direction.y * direction.y);
    const normalizedDirection = { 
        x: direction.x / length, 
        z: direction.z / length,
        y: direction.y / length 
    };

    // 预测更新后的位置
    let predictedPosition = {
        x: helicopterModel.position.x + normalizedDirection.x * helicopterSpeed,
        y: helicopterModel.position.y + normalizedDirection.y * helicopterSpeed,
        z: helicopterModel.position.z + normalizedDirection.z * helicopterSpeed,
    };

    // 检查并处理边界碰撞
    let boundaryHit = false;
    if (predictedPosition.x <= -40 || predictedPosition.x >= 25) {
        direction.x *= -1; // 反向
        boundaryHit = true;
    }
    if (predictedPosition.y <= 30 || predictedPosition.y >= 50) {
        direction.y *= -1; // 反向
        boundaryHit = true;
    }
    if (predictedPosition.z <= -20 || predictedPosition.z >= 50) {
        direction.z *= -1; // 反向
        boundaryHit = true;
    }

    if (boundaryHit) {
        // 如果到达边界，重新计算方向并预测位置
        const correctedDirection = {
            x: direction.x,
            y: direction.y,
            z: direction.z
        };
        predictedPosition = {
            x: helicopterModel.position.x + correctedDirection.x * helicopterSpeed,
            y: helicopterModel.position.y + correctedDirection.y * helicopterSpeed,
            z: helicopterModel.position.z + correctedDirection.z * helicopterSpeed,
        };
    }

    // 确保位置在边界内
    predictedPosition.x = Math.max(-40, Math.min(25, predictedPosition.x));
    predictedPosition.y = Math.max(30, Math.min(50, predictedPosition.y));
    predictedPosition.z = Math.max(-20, Math.min(50, predictedPosition.z));

    // 更新直升机位置
    helicopterModel.position.x = predictedPosition.x;
    helicopterModel.position.y = predictedPosition.y;
    helicopterModel.position.z = predictedPosition.z;

    // 调整直升机旋转以面向移动方向（忽略Y轴旋转）
    let newTargetRotationY = Math.atan2(-normalizedDirection.x, -normalizedDirection.z) + 1.5 * Math.PI;
    const alpha = 0.01;
    let currentRotationY = helicopterModel.rotation.y;
    let rotationDifference = newTargetRotationY - currentRotationY;

    // 确保差异在 -π 到 π 范围内
    while (rotationDifference > Math.PI) rotationDifference -= 2 * Math.PI;
    while (rotationDifference < -Math.PI) rotationDifference += 2 * Math.PI;

    // 应用平滑旋转
    helicopterModel.rotation.y += rotationDifference * alpha;
}

let updatePosition = 1;
function rendeLoop() {
    const delta = clock.getDelta();
    TWEEN.update() // update animations
    if (mixer) mixer.update(delta); 
    controls.update() // update orbit controls
    if (mercedesBenzModel) {
        updateVehiclePosition();
    }
    if (helicopterModel) {
        updateHelicopterPosition(delta);
    }
    if(sunLight.position.x == 100) updatePosition = -1;
    if(sunLight.position.x == -100) updatePosition = 1;
    sunLight.position.set(sunLight.position.x+updatePosition, 44, 14)

    renderer.render(scene, camera) // render the scene using the camera

    requestAnimationFrame(rendeLoop) //loop the render function
    
}

rendeLoop() //start rendering

import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
// const gui = new GUI()

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
// gui.add(sunLight, 'intensity').min(0).max(10).step(0.0001).name('Dir intensity')
// gui.add(sunLight.position, 'x').min(-100).max(100).step(0.00001).name('Dir X pos')
// gui.add(sunLight.position, 'y').min(0).max(100).step(0.00001).name('Dir Y pos')
// gui.add(sunLight.position, 'z').min(-100).max(100).step(0.00001).name('Dir Z pos')
// gui.addColor(params,'color').name('Dir color').onChange(update)
// gui.addColor(params,'color2').name('Amb color').onChange(update)
// gui.add(ambient, 'intensity').min(0).max(10).step(0.001).name('Amb intensity')
// gui.addColor(params,'color3').name('BG color').onChange(update)

//////////////////////////////////////////////////
//// ON MOUSE MOVE TO GET CAMERA POSITION
document.addEventListener('mousemove', (event) => {
    event.preventDefault()

    // console.log(camera.position)

}, false)
