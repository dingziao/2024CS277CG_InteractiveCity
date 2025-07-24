# Interactive 3D City View (Three.js)

A browser-based 3D city experience built with Three.js. Users can explore the scene and interact with animated models.\
3D models from [sketchfab.com](https://sketchfab.com/features/free-3d-models).\
Background from [ektogamat](https://github.com/ektogamat/threejs-andy-boilerplate).\
⭐Live @  [Live Demo](https://dingziao.github.io/CS277_CG_InteractiveCityView/)

## ⭐Features
**1. Clickable 3D Models**:  
  Implemented precise raycasting to detect user clicks on specific objects (e.g. dog, car, helicopter, café).  
  Each model triggers an action like scaling or opening an external link.

**2. Autonomous Animations**:  
  - Mercedes-Benz car follows a looped path with smooth turns.  
  - Helicopter flies with randomized 3D motion and auto-direction changes.

**3. Cinematic Intro**:  
  Initial camera animation using `TWEEN.js` before enabling orbit controls.

**4. Scene Elements**:  
  - Realistic skybox (HDR textures)  
  - Ambient + directional lighting  
  - Animated characters (police, doctor, girl, boy, dog)

## ⭐Tech Stack

- Three.js  
- GLTF + DRACO compressed models  
- Raycaster for interaction  
- OrbitControls for navigation  
- TWEEN.js for smooth camera and object animations

## ⭐Highlight

Click interactions are powered by this logic:

```js
raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(scene.children).map(i => i.object);
if (intersects[0]?.name === "Object_206") {
    dog.scale.x === 0.5
      ? window.open("https://example.com")
      : dog.scale.set(0.5, 0.5, 0.5);
}


```

<br>

<p align="center">
<img src="https://github.com/dingziao/Computer-Graphics-Final-Project/assets/75987534/f6be2f4f-3f74-4d7e-a2ef-1f333fa1acdb" alt="Weixin Image" width="50%" style="border-radius: 6px;" />
</p>
