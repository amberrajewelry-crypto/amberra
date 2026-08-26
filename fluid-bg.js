import * as THREE from 'three'
import { EffectComposer, RenderPass, BloomEffect, EffectPass } from 'https://esm.sh/postprocessing@6.37.3?external=three'

const canvas = document.getElementById('fluid-canvas')
if (!canvas) throw new Error('fluid-canvas not found')

// mobile: run the SAME WebGL fluid sim, just cheaper (lower sim res + pixelRatio 1
// + fewer pressure iters) so the gold still reacts to touch (touchmove handled
// below). IS_MOBILE tunes the perf knobs. Bare block keeps the closing brace balanced.
const IS_MOBILE = window.matchMedia('(max-width:768px)').matches
{

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  powerPreference: 'high-performance',
  alpha: false,
})
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(Math.min(devicePixelRatio, IS_MOBILE ? 1 : 1.5))
renderer.autoClear = false

const simScene  = new THREE.Scene()
const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
const quad      = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null)
simScene.add(quad)

const SIM_SCALE = IS_MOBILE ? 0.4 : 0.5
const SIM_W = Math.round(innerWidth  * SIM_SCALE)
const SIM_H = Math.round(innerHeight * SIM_SCALE)

const RT_OPTS = {
  minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat, type: THREE.HalfFloatType,
  depthBuffer: false, stencilBuffer: false,
}
const makeRT = (w = SIM_W, h = SIM_H) => new THREE.WebGLRenderTarget(w, h, { ...RT_OPTS })

let velA   = makeRT(), velB   = makeRT()
let colA   = makeRT(), colB   = makeRT()
let pressA = makeRT(), pressB = makeRT()
const divRT  = makeRT()
const dispRT = makeRT(innerWidth, innerHeight)

const SIM_TS = new THREE.Vector2(1.0 / SIM_W, 1.0 / SIM_H)

const VERT = `
varying vec2 vUV;
void main() {
  vUV = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`

function makeMat(frag, uniforms = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: frag, uniforms,
    depthTest: false, depthWrite: false,
  })
}

function renderTo(mat, rt) {
  quad.material = mat
  renderer.setRenderTarget(rt)
  renderer.render(simScene, simCamera)
}

const advMat = makeMat(`
precision highp float; varying vec2 vUV;
uniform float uDt; uniform sampler2D uInput; uniform sampler2D uVel; uniform float uDecay;
void main() {
  vec2 vel = texture2D(uVel, vUV).xy;
  vec2 prev = fract(vUV - uDt * vel);
  gl_FragColor = texture2D(uInput, prev) * (1.0 - uDecay);
}`, { uDt:{value:1/30}, uInput:{value:null}, uVel:{value:null}, uDecay:{value:0} })

const divMat = makeMat(`
precision highp float; varying vec2 vUV;
uniform sampler2D uVel; uniform vec2 uTs;
void main() {
  float x0=texture2D(uVel,vUV-vec2(uTs.x,0)).x, x1=texture2D(uVel,vUV+vec2(uTs.x,0)).x;
  float y0=texture2D(uVel,vUV-vec2(0,uTs.y)).y, y1=texture2D(uVel,vUV+vec2(0,uTs.y)).y;
  gl_FragColor = vec4((x1-x0+y1-y0)*0.5,0,0,1);
}`, { uVel:{value:null}, uTs:{value:SIM_TS} })

const jacMat = makeMat(`
precision highp float; varying vec2 vUV;
uniform sampler2D uPrev; uniform sampler2D uDiv; uniform vec2 uTs;
void main() {
  vec4 x0=texture2D(uPrev,vUV-vec2(uTs.x,0)), x1=texture2D(uPrev,vUV+vec2(uTs.x,0));
  vec4 y0=texture2D(uPrev,vUV-vec2(0,uTs.y)), y1=texture2D(uPrev,vUV+vec2(0,uTs.y));
  vec4 d=texture2D(uDiv,vUV);
  gl_FragColor = (x0+x1+y0+y1-d)*0.25;
}`, { uPrev:{value:null}, uDiv:{value:null}, uTs:{value:SIM_TS} })

const gradMat = makeMat(`
precision highp float; varying vec2 vUV;
uniform sampler2D uVel; uniform sampler2D uPress; uniform vec2 uTs;
void main() {
  float x0=texture2D(uPress,vUV-vec2(uTs.x,0)).r, x1=texture2D(uPress,vUV+vec2(uTs.x,0)).r;
  float y0=texture2D(uPress,vUV-vec2(0,uTs.y)).r, y1=texture2D(uPress,vUV+vec2(0,uTs.y)).r;
  vec2 v=texture2D(uVel,vUV).xy; v-=0.5*vec2(x1-x0,y1-y0);
  gl_FragColor = vec4(v,0,1);
}`, { uVel:{value:null}, uPress:{value:null}, uTs:{value:SIM_TS} })

const forceMat = makeMat(`
precision highp float; varying vec2 vUV;
uniform vec4 uTouch; uniform float uRadius; uniform float uAspect; uniform sampler2D uVel;
void main() {
  vec2 suv=vec2(vUV.x*uAspect,vUV.y), stp=vec2(uTouch.x*uAspect,uTouch.y);
  vec2 d=suv-stp; float r=length(d)/uRadius;
  float str=1.0/max(r*r,0.01);
  vec2 dlt=uTouch.zw;
  if(length(dlt)>0.0001) str*=clamp(dot(normalize(d),normalize(-dlt)),0.0,1.0);
  gl_FragColor=texture2D(uVel,vUV)+vec4(str*dlt*uRadius*3.5,0,0);
}`, { uTouch:{value:new THREE.Vector4()}, uRadius:{value:0.25}, uAspect:{value:innerWidth/innerHeight}, uVel:{value:null} })

const injectMat = makeMat(`
precision highp float; varying vec2 vUV;
uniform vec4 uTouch; uniform float uRadius; uniform float uAspect; uniform sampler2D uColor;
void main() {
  vec2 suv=vec2(vUV.x*uAspect,vUV.y), stp=vec2(uTouch.x*uAspect,uTouch.y);
  vec2 d=suv-stp; float r=length(d)/uRadius;
  float str=1.0/max(r*r,0.01);
  vec2 dlt=uTouch.zw;
  if(length(dlt)>0.0001) str*=clamp(dot(normalize(d),normalize(-dlt)),0.0,1.0);
  str=min(str,9.0);
  vec3 gold=vec3(0.45,0.22,0.03);
  gl_FragColor=texture2D(uColor,vUV)+vec4(gold*str*length(dlt)*uRadius*3.8,0);
}`, { uTouch:{value:new THREE.Vector4()}, uRadius:{value:0.25}, uAspect:{value:innerWidth/innerHeight}, uColor:{value:null} })

const clearMat   = makeMat(`void main(){gl_FragColor=vec4(0);}`,{})
const velInitMat = makeMat(`
precision highp float; varying vec2 vUV;
#define PI 3.14159265358979
void main() {
  vec2 p=vUV*2.0-1.0;
  gl_FragColor=vec4(vec2(sin(2.0*PI*p.y),sin(2.0*PI*p.x))*0.06,0,1);
}`,{})
const colInitMat = makeMat(`
precision highp float; varying vec2 vUV;
void main() {
  vec2 p=vUV*2.0-1.0, off=p-vec2(0.15,-0.05);
  float g=exp(-dot(off,off)*2.8)*0.28;
  gl_FragColor=vec4(0.90*g,0.72*g,0.16*g,1);
}`,{})

renderTo(velInitMat,velA); renderTo(velInitMat,velB)
renderTo(colInitMat,colA); renderTo(colInitMat,colB)
renderTo(clearMat,pressA); renderTo(clearMat,pressB)

const compMat = makeMat(`
precision highp float; varying vec2 vUV;
uniform sampler2D uColor; uniform float uTime; uniform vec2 uSimTs;
void main() {
  vec2 c=vUV*2.0-1.0;
  float vig=1.0-smoothstep(0.25,0.95,length(c*vec2(0.72,1.0)));
  vec3 bg=vec3(0.022,0.008,0.001);
  vec3 fl=texture2D(uColor,vUV).rgb*vig;

  float hL=dot(texture2D(uColor,vUV-vec2(uSimTs.x,0)).rgb,vec3(0.299,0.587,0.114));
  float hR=dot(texture2D(uColor,vUV+vec2(uSimTs.x,0)).rgb,vec3(0.299,0.587,0.114));
  float hD=dot(texture2D(uColor,vUV-vec2(0,uSimTs.y)).rgb,vec3(0.299,0.587,0.114));
  float hU=dot(texture2D(uColor,vUV+vec2(0,uSimTs.y)).rgb,vec3(0.299,0.587,0.114));
  vec3 N=normalize(vec3((hL-hR)*6.0,(hD-hU)*6.0,1.0));
  vec3 L=normalize(vec3(0.6,0.5,1.2));
  float diff=max(dot(N,L),0.0);
  float shadow=1.0-smoothstep(0.0,0.6,max(dot(N,-L),0.0));
  vec3 H=normalize(L+vec3(0,0,1));
  float spec=pow(max(dot(N,H),0.0),28.0);

  float flLum=dot(fl,vec3(0.33));

  float sweep1=sin(uTime*0.28)*0.5+0.5;
  float diag1=c.x*0.7-c.y*0.5;
  float band1=diag1-(sweep1*2.6-1.3);
  float beam1=exp(-band1*band1*5.0);
  float str1=beam1*(0.1+flLum*0.9);

  float sweep2=sin(uTime*0.17+2.1)*0.5+0.5;
  float diag2=-c.x*0.5+c.y*0.65;
  float band2=diag2-(sweep2*2.4-1.2);
  float beam2=exp(-band2*band2*5.0);
  float str2=beam2*(0.08+flLum*0.85);

  float beamMax=max(beam1,beam2);

  vec3 lit=fl*(0.35+0.65*diff)*shadow;
  vec3 specCol=vec3(0.75,0.50,0.12)*spec*flLum*2.5;
  vec3 sweepCol=mix(vec3(0.45,0.22,0.04),vec3(0.85,0.62,0.18),beamMax)*(str1+str2);
  gl_FragColor=vec4(bg+lit+specCol+sweepCol,1);
}`, { uColor:{value:null}, uTime:{value:0}, uSimTs:{value:SIM_TS} })

const dispScene  = new THREE.Scene()
const dispCamera = new THREE.OrthographicCamera(-1,1,1,-1,0,1)
dispScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2), new THREE.MeshBasicMaterial({map:dispRT.texture})))

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(dispScene, dispCamera))
composer.addPass(new EffectPass(dispCamera, new BloomEffect({
  intensity:1.5, luminanceThreshold:0.42, luminanceSmoothing:0.5, radius:0.70,
})))

const mouseUV=new THREE.Vector2(-1,-1), prevUV=new THREE.Vector2(-1,-1), delta=new THREE.Vector2(0,0)
let active=false, lastUserMove=0
function onMove(cx,cy){
  const rect=canvas.getBoundingClientRect()
  const x=(cx-rect.left)/rect.width, y=1-(cy-rect.top)/rect.height
  delta.set(x-prevUV.x,y-prevUV.y); prevUV.copy(mouseUV); mouseUV.set(x,y)
  active=true; lastUserMove=performance.now()
}
window.addEventListener('mousemove',e=>onMove(e.clientX,e.clientY))
window.addEventListener('mouseleave',()=>{active=false})
window.addEventListener('touchmove',e=>onMove(e.touches[0].clientX,e.touches[0].clientY),{passive:true})
window.addEventListener('touchend',()=>{active=false})

// Auto-animation: slow Lissajous cursor
const autoPrev=new THREE.Vector2(0.5,0.5), autoCur=new THREE.Vector2(0.5,0.5)
const autoDelta=new THREE.Vector2(0,0)
function getAutoPos(t){
  // Slow Lissajous: a=2, b=3, slightly offset phase for organic feel
  const x=0.5+0.38*Math.sin(t*0.11+0.5)
  const y=0.5+0.32*Math.sin(t*0.17+1.2)
  return {x,y}
}

const ITERS=IS_MOBILE?18:32, DT=1/30, VEL_DECAY=0.0005, COL_DECAY=0.0075

function simStep(t){
  advMat.uniforms.uInput.value=velA.texture; advMat.uniforms.uVel.value=velA.texture
  advMat.uniforms.uDt.value=DT; advMat.uniforms.uDecay.value=VEL_DECAY
  renderTo(advMat,velB); [velA,velB]=[velB,velA]

  // Use real mouse if recently active, else auto-animation
  const userIdle = performance.now()-lastUserMove > 1200
  let touchX, touchY, touchDX, touchDY, doForce=false

  if(active && delta.lengthSq()>1e-8){
    touchX=mouseUV.x; touchY=mouseUV.y; touchDX=delta.x; touchDY=delta.y; doForce=true
  } else if(userIdle){
    const p=getAutoPos(t), pp=getAutoPos(t-0.016)
    autoDelta.set(p.x-pp.x, p.y-pp.y)
    if(autoDelta.lengthSq()>1e-10){
      touchX=p.x; touchY=p.y; touchDX=autoDelta.x*0.55; touchDY=autoDelta.y*0.55; doForce=true
    }
  }

  if(doForce){
    forceMat.uniforms.uTouch.value.set(touchX,touchY,touchDX,touchDY)
    forceMat.uniforms.uVel.value=velA.texture
    renderTo(forceMat,velB); [velA,velB]=[velB,velA]
  }

  divMat.uniforms.uVel.value=velA.texture; renderTo(divMat,divRT)

  renderTo(clearMat,pressA)
  for(let i=0;i<ITERS;i++){
    jacMat.uniforms.uPrev.value=pressA.texture; jacMat.uniforms.uDiv.value=divRT.texture
    renderTo(jacMat,pressB); [pressA,pressB]=[pressB,pressA]
  }

  gradMat.uniforms.uVel.value=velA.texture; gradMat.uniforms.uPress.value=pressA.texture
  renderTo(gradMat,velB); [velA,velB]=[velB,velA]

  advMat.uniforms.uInput.value=colA.texture; advMat.uniforms.uVel.value=velA.texture
  advMat.uniforms.uDecay.value=COL_DECAY
  renderTo(advMat,colB); [colA,colB]=[colB,colA]

  if(doForce){
    injectMat.uniforms.uTouch.value.set(touchX,touchY,touchDX,touchDY)
    injectMat.uniforms.uColor.value=colA.texture
    renderTo(injectMat,colB); [colA,colB]=[colB,colA]
  }
}

const clock=new THREE.Clock()
function animate(){
  requestAnimationFrame(animate)
  const t=clock.getElapsedTime()
  simStep(t); delta.set(0,0)
  compMat.uniforms.uColor.value=colA.texture
  compMat.uniforms.uTime.value=clock.getElapsedTime()
  renderTo(compMat,dispRT)
  renderer.setRenderTarget(null)
  composer.render()
}
animate()

window.addEventListener('resize',()=>{
  renderer.setSize(innerWidth,innerHeight)
  composer.setSize(innerWidth,innerHeight)
  dispRT.setSize(innerWidth,innerHeight)
  forceMat.uniforms.uAspect.value=innerWidth/innerHeight
  injectMat.uniforms.uAspect.value=innerWidth/innerHeight
})

}
