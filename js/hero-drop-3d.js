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
    // matte cognac amber: deep dark honey core, soft satin surface, subtle light play
    color: 0xa8650e, transmission: 0.56, thickness: 2.1, ior: 1.53,
    roughness: 0.62, metalness: 0.0,
    attenuationColor: new THREE.Color(0xd98a1e), attenuationDistance: 1.35,
    clearcoat: 0.24, clearcoatRoughness: 0.5, envMapIntensity: 0.7,
    iridescence: 0.18, iridescenceIOR: 1.3, iridescenceThicknessRange: [120, 440],
    emissive: new THREE.Color(0xc47816), emissiveIntensity: 0.2, transparent: true,
  });

  const group = new THREE.Group();
  scene.add(group);

  const sparks = [];
  function seedSparks(halfW, halfH, cy) {
    const N = 60;
    for (let i = 0; i < N; i++) {
      // rejection-sample inside an ellipsoid (bulb-biased) so motes stay within the amber
      let x, y, z;
      do {
        x = (Math.random() * 2 - 1);
        y = (Math.random() * 2 - 1);
        z = (Math.random() * 2 - 1);
      } while (x * x + y * y + z * z > 1);
      const m = new THREE.MeshStandardMaterial({
        color: 0xfff4d8, emissive: 0xffe1a0, emissiveIntensity: 1.4, roughness: 0.3, metalness: 0.0,
      });
      // tiny star-like specks of varied size
      const r = (0.008 + Math.random() * 0.011) * halfH * 2;
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), m);
      // keep motes inside the bulb — tight radial spread, biased slightly up from the tapered tip
      s.position.set(x * halfW * 0.55, cy + y * halfH * 0.42, z * halfW * 0.55);
      s.userData.phase = Math.random() * Math.PI * 2;
      s.userData.speed = 1.8 + Math.random() * 3.4;
      s.userData.peak = 2.0 + Math.random() * 2.4;
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

  // cursor reaction — clean hover flare (no wobble): gentle grow + brighter glow/spin/shimmer
  let hover = false, hoverAmt = 0;
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

    // gentle light play on the matte surface
    amber.iridescence = 0.14 + Math.sin(t * 0.9) * 0.08 + hoverAmt * 0.2;
    amber.iridescenceIOR = 1.28 + Math.sin(t * 0.55) * 0.06;

    // inner starfield: sharp star-like twinkle (crisp flashes, not soft breathing)
    for (const s of sparks) {
      const sp = Math.sin(t * s.userData.speed + s.userData.phase);
      const flash = Math.pow(Math.max(0, sp), 5); // sharp on/off blink like a star
      s.material.emissiveIntensity = (0.12 + flash * s.userData.peak) * (1 + hoverAmt * 0.9);
    }

    // hover flare: faster spin + brighter emission + halo (via CSS class)
    hoverAmt += ((hover ? 1 : 0) - hoverAmt) * 0.08;
    controls.autoRotateSpeed = 2.0 + hoverAmt * 3.2;
    amber.emissiveIntensity = 0.16 + hoverAmt * 0.5;
    if (mount.classList.contains('hovered') !== hoverAmt > 0.5) mount.classList.toggle('hovered', hoverAmt > 0.5);

    // living breath + hover grow (no wobble)
    group.scale.setScalar((1 + hoverAmt * 0.07) * (1 + Math.sin(t * 0.85) * 0.02));

    controls.update();
    renderer.render(scene, camera);
  })();
}

boot();
