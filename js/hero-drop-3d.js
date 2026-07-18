// Interactive 3D amber drop — translucent amber with inner shimmer, surface glint sweep, cursor reaction
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const mount = document.getElementById('hero-drop-canvas');

// Guarantee real dimensions even if style.css is cached/stale.
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
  if (mount.clientWidth === 0 || mount.clientHeight === 0) { requestAnimationFrame(boot); return; }
  init();
}

function init() {
  const W = () => mount.clientWidth || 1, H = () => mount.clientHeight || 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.5).texture;

  const camera = new THREE.PerspectiveCamera(30, W() / H(), 0.1, 100);
  camera.position.set(0, 0.2, 9.0);

  const key = new THREE.DirectionalLight(0xfff2d6, 2.6); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb060, 2.2); rim.position.set(2, -1, -4); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffe0b0, 0.3));
  // orbiting glint light — sweeps a bright specular across the surface
  const glint = new THREE.PointLight(0xfff0d0, 40, 14, 2); scene.add(glint);

  // translucent deep amber (dark cognac resin) — light passes through, inner motes show
  const amber = new THREE.MeshPhysicalMaterial({
    color: 0xe0a91e, transmission: 0.86, thickness: 1.1, ior: 1.5,
    roughness: 0.15, metalness: 0.0,
    attenuationColor: new THREE.Color(0xffbe36), attenuationDistance: 3.2,
    clearcoat: 0.55, clearcoatRoughness: 0.2, envMapIntensity: 1.0,
    emissive: new THREE.Color(0xffab30), emissiveIntensity: 0.42, transparent: true,
  });

  const group = new THREE.Group();
  scene.add(group);

  const sparks = [];
  function seedSparks(halfW, halfH, cy) {
    const N = 20;
    for (let i = 0; i < N; i++) {
      // rejection-sample inside an ellipsoid (bulb-biased) so motes stay within the amber
      let x, y, z;
      do {
        x = (Math.random() * 2 - 1);
        y = (Math.random() * 2 - 1);
        z = (Math.random() * 2 - 1);
      } while (x * x + y * y + z * z > 1);
      const m = new THREE.MeshStandardMaterial({
        color: 0xffe6b0, emissive: 0xffb347, emissiveIntensity: 1.4, roughness: 0.35, metalness: 0.0,
      });
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.02 * halfH * 2, 8, 8), m);
      // keep motes inside the bulb — tight radial spread, biased slightly up from the tapered tip
      s.position.set(x * halfW * 0.55, cy + y * halfH * 0.42, z * halfW * 0.55);
      s.userData.phase = Math.random() * Math.PI * 2;
      s.userData.speed = 1.4 + Math.random() * 2.6;
      s.userData.base = 0.5 + Math.random() * 1.4;
      group.add(s);
      sparks.push(s);
    }
  }

  new GLTFLoader().load('/models/amber-drop.glb?v=5', (gltf) => {
    const root = gltf.scene;
    let maxV = 0, body = null;
    root.traverse((o) => { if (o.isMesh) { const v = o.geometry.attributes.position.count; if (v > maxV) { maxV = v; body = o; } } });
    root.traverse((o) => { if (o.isMesh) o.material = amber; });
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    root.position.sub(center);
    const scl = 3.3 / Math.max(size.x, size.y, size.z);
    root.scale.setScalar(scl);
    group.add(root);
    // sparks live in group space; drop spans ~[-1.65..1.65] in tallest axis
    const halfH = (size.y * scl) / 2, halfW = (size.x * scl) / 2;
    seedSparks(halfW, halfH, halfH * 0.02);
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false; controls.enablePan = false;
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.autoRotate = true; controls.autoRotateSpeed = 2.0;
  controls.minPolarAngle = Math.PI * 0.3; controls.maxPolarAngle = Math.PI * 0.72;
  controls.target.set(0, 0, 0);

  // cursor reaction — tilt toward pointer + hover flare
  let tpx = 0, tpy = 0, px = 0, py = 0, hover = false, hoverAmt = 0;
  addEventListener('pointermove', (e) => {
    const r = mount.getBoundingClientRect();
    tpx = ((e.clientX - (r.left + r.width / 2)) / innerWidth) * 2;
    tpy = ((e.clientY - (r.top + r.height / 2)) / innerHeight) * 2;
  });
  mount.addEventListener('pointerenter', () => { hover = true; });
  mount.addEventListener('pointerleave', () => { hover = false; });

  const resize = () => {
    ensureSize();
    const w = W(), h = H();
    if (w < 2 || h < 2) return;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
  };
  new ResizeObserver(resize).observe(mount);
  addEventListener('resize', resize);

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // glint sweep: orbiting light + breathing intensity
    const a = t * 0.6;
    glint.position.set(Math.cos(a) * 4.6, 1.6 + Math.sin(a * 0.7) * 1.6, 4.2);
    glint.intensity = 42 + Math.sin(t * 1.25) * 16 + hoverAmt * 55;

    // inner shimmer: twinkle motes
    for (const s of sparks) {
      const v = s.userData.base + Math.sin(t * s.userData.speed + s.userData.phase) * 1.2;
      s.material.emissiveIntensity = Math.max(0.1, v) * (1 + hoverAmt * 0.8);
    }

    // hover flare: faster spin + brighter emission + halo (via CSS class)
    hoverAmt += ((hover ? 1 : 0) - hoverAmt) * 0.08;
    controls.autoRotateSpeed = 2.0 + hoverAmt * 3.2;
    amber.emissiveIntensity = 0.16 + hoverAmt * 0.5;
    if (mount.classList.contains('hovered') !== hoverAmt > 0.5) mount.classList.toggle('hovered', hoverAmt > 0.5);

    // parallax tilt toward cursor
    px += (tpx - px) * 0.06; py += (tpy - py) * 0.06;
    group.rotation.z = -px * 0.14;
    group.rotation.x = py * 0.14;

    controls.update();
    renderer.render(scene, camera);
  })();
}

boot();
