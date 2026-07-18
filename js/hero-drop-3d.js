// Interactive 3D amber drop — real transmission glass via Three.js MeshPhysicalMaterial
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const mount = document.getElementById('hero-drop-canvas');

// Guarantee the viewport has real dimensions even if style.css is cached/stale.
// clamp(200-320) x clamp(280-420) mirrored in JS so WebGL always gets a non-zero framebuffer.
function ensureSize() {
  if (!mount) return;
  const vw = innerWidth || 1200;
  const w = Math.max(200, Math.min(320, vw * 0.20));
  const h = Math.max(280, Math.min(420, vw * 0.28));
  mount.style.width = w + 'px';
  mount.style.height = h + 'px';
  mount.style.cursor = 'grab';
  const wrap = mount.closest('.hero-drop-wrap');
  if (wrap) { wrap.style.width = w + 'px'; wrap.style.height = h + 'px'; }
}

function boot() {
  if (!mount) return;
  ensureSize();
  if (mount.clientWidth === 0 || mount.clientHeight === 0) {
    requestAnimationFrame(boot);
    return;
  }
  init();
}

function init() {
  const W = () => mount.clientWidth || 1, H = () => mount.clientHeight || 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.6).texture;

  const camera = new THREE.PerspectiveCamera(30, W() / H(), 0.1, 100);
  camera.position.set(0, 0.2, 9.0);

  const key = new THREE.DirectionalLight(0xfff2d6, 2.8); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffc070, 2.4); rim.position.set(2, -1, -4); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffe0b0, 0.35));

  // matte golden — brushed/satin gold, no transparency, soft diffuse sheen
  const amber = new THREE.MeshPhysicalMaterial({
    color: 0x8f5a10, transmission: 0.0, metalness: 0.9,
    roughness: 0.4, envMapIntensity: 0.75,
    clearcoat: 0.25, clearcoatRoughness: 0.4, sheen: 0.4,
    sheenColor: new THREE.Color(0xe0a848), sheenRoughness: 0.6,
    emissive: new THREE.Color(0xc06f16), emissiveIntensity: 0.3,
  });
  const sparkMat = new THREE.MeshStandardMaterial({
    color: 0xf3d488, emissive: 0xd8a94a, emissiveIntensity: 0.5, roughness: 0.6, metalness: 0.7,
  });

  const group = new THREE.Group();
  scene.add(group);

  new GLTFLoader().load('/models/amber-drop.glb?v=5', (gltf) => {
    const root = gltf.scene;
    let maxV = 0, body = null;
    root.traverse((o) => { if (o.isMesh) { const v = o.geometry.attributes.position.count; if (v > maxV) { maxV = v; body = o; } } });
    root.traverse((o) => { if (o.isMesh) o.material = (o === body) ? amber : sparkMat; });
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    root.position.sub(center);
    root.scale.setScalar(3.3 / Math.max(size.x, size.y, size.z));
    group.add(root);
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false; controls.enablePan = false;
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.autoRotate = true; controls.autoRotateSpeed = 2.2;
  controls.minPolarAngle = Math.PI * 0.28; controls.maxPolarAngle = Math.PI * 0.72;
  controls.target.set(0, 0, 0);

  const resize = () => {
    ensureSize();
    const w = W(), h = H();
    if (w < 2 || h < 2) return;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
  };
  new ResizeObserver(resize).observe(mount);
  addEventListener('resize', resize);

  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();
}

boot();
