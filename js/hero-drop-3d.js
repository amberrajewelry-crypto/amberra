// Interactive 3D amber drop — real transmission glass via Three.js MeshPhysicalMaterial
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const mount = document.getElementById('hero-drop-canvas');
if (mount) {
  const W = () => mount.clientWidth, H = () => mount.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();               // transparent background
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.6).texture;

  const camera = new THREE.PerspectiveCamera(30, W() / H(), 0.1, 100);
  camera.position.set(0, 0.2, 9.0);

  // warm rim + key lights for amber sparkle
  const key = new THREE.DirectionalLight(0xfff2d6, 2.8); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffc070, 2.4); rim.position.set(2, -1, -4); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffe0b0, 0.35));

  // amber glass — brighter honey-gold, softer attenuation (less dark/red)
  const amber = new THREE.MeshPhysicalMaterial({
    color: 0xffc878,
    transmission: 1.0,
    thickness: 1.6,
    ior: 1.52,
    roughness: 0.05,
    metalness: 0.0,
    attenuationColor: new THREE.Color(0xff8a2a),
    attenuationDistance: 2.4,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    envMapIntensity: 0.85,
    specularIntensity: 1.0,
  });
  const sparkMat = new THREE.MeshStandardMaterial({
    color: 0xffdd88, emissive: 0xffb347, emissiveIntensity: 2.2, roughness: 0.4,
  });

  const group = new THREE.Group();
  scene.add(group);

  new GLTFLoader().load('/models/amber-drop.glb?v=2', (gltf) => {
    const root = gltf.scene;
    // biggest mesh = drop body → amber; the rest = inner sparks → emissive
    let maxV = 0, body = null;
    root.traverse((o) => { if (o.isMesh) { const v = o.geometry.attributes.position.count; if (v > maxV) { maxV = v; body = o; } } });
    root.traverse((o) => { if (o.isMesh) o.material = (o === body) ? amber : sparkMat; });

    // center + scale to fit
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    root.position.sub(center);
    const s = 3.3 / Math.max(size.x, size.y, size.z);
    root.scale.setScalar(s);
    group.add(root);
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false; controls.enablePan = false;
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.autoRotate = true; controls.autoRotateSpeed = 2.2;
  controls.minPolarAngle = Math.PI * 0.28; controls.maxPolarAngle = Math.PI * 0.72;
  controls.target.set(0, 0, 0);

  addEventListener('resize', () => {
    camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H());
  });

  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();
}
