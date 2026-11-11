// displacement-morph.js — WebGL scroll-driven image transitions
import * as THREE from 'https://esm.sh/three@0.177.0'

const NOISE_SCALE = 4.0
const DISP_INTENSITY = 0.4

const vertexShader = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}`

const fragmentShader = `
uniform sampler2D uTex1;
uniform sampler2D uTex2;
uniform float uProgress;
uniform float uTime;
varying vec2 vUv;

vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1;i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;
  i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}

void main(){
  float disp = snoise(vUv * ${NOISE_SCALE.toFixed(1)} + uTime * 0.1);
  float strength = ${DISP_INTENSITY.toFixed(1)} * (1.0 - abs(uProgress * 2.0 - 1.0));
  vec2 distortedUv = vUv + vec2(disp * strength);
  vec4 t1 = texture2D(uTex1, distortedUv);
  vec4 t2 = texture2D(uTex2, distortedUv);
  gl_FragColor = mix(t1, t2, uProgress);
}`

export function initDisplacementMorph() {
  const canvas = document.getElementById('morph-canvas')
  if (!canvas) return Promise.resolve(null)

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const loader = new THREE.TextureLoader()

  const uniforms = {
    uTex1: { value: null },
    uTex2: { value: null },
    uProgress: { value: 0 },
    uTime: { value: 0 }
  }

  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  scene.add(mesh)

  const textures = []
  const images = [
    '/images/editorial/amber-raw.webp',
    '/images/editorial/artisan-hands.webp',
    '/images/editorial/product-hero.webp',
    '/images/editorial/model-editorial.webp'
  ]

  const loaded = images.map((src, idx) => new Promise(resolve => {
    loader.load(src, tex => {
      tex.minFilter = THREE.LinearFilter
      textures[idx] = tex
      resolve()
    }, undefined, () => resolve()) // resolve even on error
  }))

  let active = false
  let raf = null

  function render() {
    uniforms.uTime.value = performance.now() * 0.001
    renderer.render(scene, camera)
    if (active) raf = requestAnimationFrame(render)
  }

  function show(pairIndex, progress) {
    if (pairIndex < 0 || pairIndex >= textures.length - 1) return
    if (!textures[pairIndex] || !textures[pairIndex + 1]) return
    uniforms.uTex1.value = textures[pairIndex]
    uniforms.uTex2.value = textures[pairIndex + 1]
    uniforms.uProgress.value = Math.max(0, Math.min(1, progress))
    canvas.style.opacity = '1'
    if (!active) { active = true; render() }
  }

  function hide() {
    canvas.style.opacity = '0'
    active = false
    if (raf) cancelAnimationFrame(raf)
  }

  function resize() {
    renderer.setSize(innerWidth, innerHeight)
  }

  window.addEventListener('resize', resize)

  return Promise.all(loaded).then(() => ({ show, hide, textures }))
}
