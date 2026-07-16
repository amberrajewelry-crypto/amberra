// drop-3d.js — Interactive 3D amber teardrop
import * as THREE from 'https://esm.sh/three@0.177.0'
import { GLTFLoader } from 'https://esm.sh/three@0.177.0/examples/jsm/loaders/GLTFLoader.js'

const canvas = document.getElementById('drop-canvas')
if (!canvas) throw new Error('drop-canvas not found')

const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
if (!gl) {
  canvas.style.display = 'none'
  throw new Error('No WebGL')
}

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.3
const isMobile = /Mobi|Android/i.test(navigator.userAgent)
renderer.setPixelRatio(isMobile ? 1 : Math.min(devicePixelRatio, 2))

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
camera.position.set(0, 0.2, 6)

// Warm studio lighting
const key = new THREE.DirectionalLight(0xffeedd, 4)
key.position.set(3, 4, 5)
scene.add(key)

const fill = new THREE.DirectionalLight(0xffd8a0, 1.5)
fill.position.set(-3, 1, 3)
scene.add(fill)

const rim = new THREE.DirectionalLight(0xffcc80, 2.5)
rim.position.set(0, -1, -4)
scene.add(rim)

scene.add(new THREE.AmbientLight(0x4a3520, 0.6))

// Procedural environment map for reflections
const pmrem = new THREE.PMREMGenerator(renderer)
const envScene = new THREE.Scene()
envScene.add(new THREE.Mesh(
  new THREE.SphereGeometry(10, 32, 32),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: `varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1);}`,
    fragmentShader: `varying vec3 vP;void main(){
      float t=normalize(vP).y*.5+.5;
      vec3 a=vec3(.08,.05,.02),b=vec3(.3,.2,.08),c=vec3(.12,.08,.03);
      vec3 col=mix(a,b,smoothstep(0.,.5,t));
      col=mix(col,c,smoothstep(.5,1.,t));
      gl_FragColor=vec4(col,1);}`
  })
))
scene.environment = pmrem.fromScene(envScene, 0.04).texture

// Load model
let drop = null
const loader = new GLTFLoader()
loader.load('/models/amber-drop.glb', (gltf) => {
  const mesh = gltf.scene.children[0]

  mesh.material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0.3, 0.16, 0.03),
    metalness: 0.0,
    roughness: 0.008,
    transmission: 0.95,
    thickness: 5.0,
    ior: 1.55,
    attenuationColor: new THREE.Color(0.75, 0.42, 0.08),
    attenuationDistance: 0.25,
    clearcoat: 1.0,
    clearcoatRoughness: 0.003,
    envMapIntensity: 2.5,
    specularIntensity: 1.2,
    specularColor: new THREE.Color(1.0, 0.85, 0.45),
  })

  mesh.geometry.center()
  const box = new THREE.Box3().setFromObject(mesh)
  const h = box.getSize(new THREE.Vector3()).y
  mesh.scale.setScalar(1.8 / h)

  drop = mesh
  scene.add(drop)
}, undefined, (err) => {
  console.error('glTF load error:', err)
  canvas.style.display = 'none'
})

// Mouse
let tx = 0, ty = 0, cx = 0, cy = 0
const MAX = 0.25

document.addEventListener('mousemove', (e) => {
  tx = (e.clientX / innerWidth - 0.5) * 2 * MAX
  ty = -(e.clientY / innerHeight - 0.5) * 2 * MAX
}, { passive: true })

if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return
    tx = Math.max(-MAX, Math.min(MAX, (e.gamma || 0) * Math.PI / 180))
    ty = Math.max(-MAX, Math.min(MAX, ((e.beta || 0) - 45) * Math.PI / 180))
  }, { passive: true })
}

// Resize
function resize() {
  const sec = document.getElementById('hero-3d')
  if (!sec) return
  const w = sec.clientWidth, h = sec.clientHeight
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}
resize()
window.addEventListener('resize', resize, { passive: true })

// Animate
const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)
  const t = clock.getElapsedTime()

  cx += (tx - cx) * 0.04
  cy += (ty - cy) * 0.04

  if (drop) {
    drop.rotation.y = cx
    drop.rotation.x = cy
    drop.position.y = 0.2 + Math.sin(t * 0.8) * 0.06
    drop.rotation.z = Math.sin(t * 0.5) * 0.02
  }

  renderer.render(scene, camera)
}
animate()
