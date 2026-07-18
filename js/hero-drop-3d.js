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
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, W() / H(), 0.1, 100);
  camera.position.set(0, 0.3, 7.2);

  // warm rim + key lights for amber sparkle
  const key = new THREE.DirectionalLight(0xfff2d6, 2.4); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb060, 2.0); rim.position.set(2, -1, -4); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffd9a0, 0.25));

  // amber glass material — transmission + attenuation gives real depth colour
  const amber = new THREE.MeshPhysicalMaterial({
    color: 0xffb066,
    transmission: 1.0,
    thickness: 2.2,
    ior: 1.55,
    roughness: 0.06,
    metalness: 0.0,
    attenuationColor: new THREE.Color(0xd0521a),
    attenuationDistance: 1.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.4,
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
    const s = 4.2 / Math.max(size.x, size.y, size.z);
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
