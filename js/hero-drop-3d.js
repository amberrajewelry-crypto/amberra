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
  const w = Math.max(240, Math.min(384, vw * 0.24));
  const h = Math.max(336, Math.min(504, vw * 0.336));
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
  // touch devices: no mouse → skip magnetic cursor, lighten the render
  const coarse = matchMedia('(pointer:coarse)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 2 : 2.5));
  renderer.setSize(W(), H());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, W() / H(), 0.1, 100);
  camera.position.set(0, 0.2, 9.0);

  const key = new THREE.DirectionalLight(0xfff2d6, 2.7); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffc27a, 2.9); rim.position.set(2, -1.5, -4); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffe6c0, 0.34));
  // orbiting glint light — sweeps a bright specular across the surface
  const glint = new THREE.PointLight(0xfff0d0, 40, 14, 2); scene.add(glint);

  // frosted golden amber: matte satin shell that diffuses the pulsing light glowing from within
  const amber = new THREE.MeshPhysicalMaterial({
    // rough surface + transmission = frosted glass; inner core light bleeds softly through, no gloss/sparkle
    color: 0xd99a26, transmission: 0.78, thickness: 1.1, ior: 1.5,
    roughness: 0.6, metalness: 0.0,
    attenuationColor: new THREE.Color(0xdc9c2c), attenuationDistance: 2.3,
    clearcoat: 0.0, clearcoatRoughness: 0.5, envMapIntensity: 0.45,
    dispersion: 0.0,
    sheen: 0.0,
    iridescence: 0.0,
    emissive: new THREE.Color(0xa8641a), emissiveIntensity: 0.12, transparent: true,
  });

  const group = new THREE.Group();
  scene.add(group);

  // glowing heart — soft pulsing core deep inside the drop (additive glow)
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xffc266, transparent: true, opacity: 0.14,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  group.add(core);

  const sparks = [];
  function seedSparks(halfW, halfH, cy) {
    const N = coarse ? 38 : 60;
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
      s.userData.home = s.position.clone(); // rest position for magnetic pull
      s.userData.phase = Math.random() * Math.PI * 2;
      s.userData.speed = 1.8 + Math.random() * 3.4;
      s.userData.peak = 2.0 + Math.random() * 2.4;
      group.add(s);
      sparks.push(s);
    }
  }

  new GLTFLoader().load('/models/amber-drop.glb?v=9', (gltf) => {
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

  // cursor reaction — magnetic: light + particles pull toward the pointer, glow rises (no wobble)
  let hover = false, hoverAmt = 0, cx = 0, cy = 0;
  mount.addEventListener('pointerenter', () => { hover = true; });
  mount.addEventListener('pointerleave', () => { hover = false; cx = 0; cy = 0; });
  if (!coarse) {
    mount.addEventListener('pointermove', (e) => {
      const rect = mount.getBoundingClientRect();
      cx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      cy = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    });
  }

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

    // glint sweep: orbiting light — magnetically drawn toward the cursor on hover
    const a = t * 0.6;
    const ox = Math.cos(a) * 4.6, oy = 1.6 + Math.sin(a * 0.7) * 1.6;
    const pull = hoverAmt * 0.85;
    glint.position.set(ox * (1 - pull) + cx * 4.2 * pull, oy * (1 - pull) + cy * 3.4 * pull, 4.2);
    glint.intensity = 42 + Math.sin(t * 1.25) * 16 + hoverAmt * 60;

    // gentle light play on the glossy surface
    amber.iridescence = 0.16 + Math.sin(t * 0.9) * 0.09 + hoverAmt * 0.2;
    amber.iridescenceIOR = 1.28 + Math.sin(t * 0.55) * 0.06;

    // wandering luminous soul: the light drifts inside the amber on a slow Lissajous path
    core.position.set(
      Math.sin(t * 0.37) * 0.32,
      Math.sin(t * 0.53 + 1.3) * 0.52,
      Math.cos(t * 0.31) * 0.32
    );
    // stronger, slower heartbeat — the inner light visibly pulses through the frosted shell
    const pulse = Math.abs(Math.sin(t * 1.15));
    core.material.opacity = 0.24 + pulse * 0.36 + hoverAmt * 0.26;
    core.scale.setScalar(0.82 + pulse * 0.34 + hoverAmt * 0.5);

    // inner starfield: sharp twinkle + magnetic drift + motes glow when the soul passes near
    const mag = hoverAmt * 0.55;
    for (const s of sparks) {
      const sp = Math.sin(t * s.userData.speed + s.userData.phase);
      const flash = Math.pow(Math.max(0, sp), 5); // sharp on/off blink like a star
      const near = Math.max(0, 1 - s.position.distanceTo(core.position) / 0.75);
      s.material.emissiveIntensity = (0.12 + flash * s.userData.peak + near * near * 1.6) * (1 + hoverAmt * 0.9);
      const h = s.userData.home;
      s.position.x += (h.x + cx * mag - s.position.x) * 0.12;
      s.position.y += (h.y + cy * mag - s.position.y) * 0.12;
    }

    // hover flare: faster spin + brighter emission + halo (via CSS class)
    hoverAmt += ((hover ? 1 : 0) - hoverAmt) * 0.08;
    controls.autoRotateSpeed = 2.0 + hoverAmt * 3.2;
    amber.emissiveIntensity = 0.1 + pulse * 0.22 + hoverAmt * 0.3;
    if (mount.classList.contains('hovered') !== hoverAmt > 0.5) mount.classList.toggle('hovered', hoverAmt > 0.5);

    // living breath + hover grow (no wobble)
    group.scale.setScalar((1 + hoverAmt * 0.07) * (1 + Math.sin(t * 0.85) * 0.02));

    controls.update();
    renderer.render(scene, camera);
  })();
}

boot();
