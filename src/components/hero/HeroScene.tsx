import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// Ashima simplex noise, shared by both shaders
const NOISE = /* glsl */ `
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
// Highland massif: two peaks (think Kitanglad and Kalatungan) plus rolling noise
float terrain(vec2 p, float t){
  float h = 1.7*exp(-dot(p-vec2(-1.2,-1.4),p-vec2(-1.2,-1.4))*0.22);
  h += 1.2*exp(-dot(p-vec2(2.4,-2.6),p-vec2(2.4,-2.6))*0.3);
  h += 0.55*snoise(p*0.22+vec2(t*0.015,0.0));
  h += 0.22*snoise(p*0.55-vec2(0.0,t*0.02));
  h += 0.08*snoise(p*1.4);
  return h;
}
`;

const terrainVert = /* glsl */ `
uniform float uTime;
varying float vH;
varying float vDist;
${NOISE}
void main(){
  vec3 pos = position;
  float h = terrain(pos.xy, uTime);
  pos.z = h;
  vH = h;
  vec4 mv = modelViewMatrix * vec4(pos,1.0);
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const terrainFrag = /* glsl */ `
uniform vec3 uLine;
uniform vec3 uIndex;
uniform vec3 uBase;
uniform float uReveal;
varying float vH;
varying float vDist;
void main(){
  float k = vH * 7.0;
  float line = 1.0 - min(abs(fract(k - 0.5) - 0.5) / fwidth(k), 1.0);
  // every fifth contour is an index contour, drawn heavier, like a survey map
  float k5 = k / 5.0;
  float idx = 1.0 - min(abs(fract(k5 - 0.5) - 0.5) / (fwidth(k5) * 1.8), 1.0);
  vec3 col = uBase + vec3(0.02, 0.05, 0.05) * clamp(vH, 0.0, 2.0);
  col = mix(col, uLine, line * 0.55);
  col = mix(col, uIndex, idx * 0.9);
  float fog = smoothstep(5.0, 15.0, vDist);
  float reveal = smoothstep(uReveal - 0.15, uReveal, (vH + 1.0) / 3.2);
  col = mix(col, uBase, fog);
  gl_FragColor = vec4(col, 1.0 - reveal);
  #include <colorspace_fragment>
}
`;

function Terrain({ still }: { still: boolean }) {
	const mat = useRef<THREE.ShaderMaterial>(null);
	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uReveal: { value: still ? 2 : 0 },
			uLine: { value: new THREE.Color('#5f9c97') },
			uIndex: { value: new THREE.Color('#d8a93b') },
			uBase: { value: new THREE.Color('#062b2f') },
		}),
		[still],
	);

	useFrame((_, dt) => {
		if (!mat.current) return;
		const u = mat.current.uniforms;
		u.uTime.value += dt;
		// rising-tide reveal on load: contours appear from the valleys up
		u.uReveal.value = Math.min(2, u.uReveal.value + dt * 0.55);
	});

	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
			<planeGeometry args={[22, 22, 260, 260]} />
			<shaderMaterial
				ref={mat}
				vertexShader={terrainVert}
				fragmentShader={terrainFrag}
				uniforms={uniforms}
				transparent
			/>
		</mesh>
	);
}

const seedVert = /* glsl */ `
uniform float uPixelRatio;
varying float vFade;
void main(){
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(9.0 * uPixelRatio / -mv.z, 1.0, 6.0 * uPixelRatio);
  vFade = smoothstep(3.2, 2.2, position.y) * smoothstep(-1.0, -0.2, position.y);
}
`;
const seedFrag = /* glsl */ `
uniform vec3 uColor;
varying float vFade;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vFade * 0.8;
  gl_FragColor = vec4(uColor, a);
  #include <colorspace_fragment>
}
`;

// Seeds drifting upward from the valleys
function Seeds({ count = 420 }) {
	const ref = useRef<THREE.Points>(null);
	const seedUniforms = useMemo(
		() => ({
			uColor: { value: new THREE.Color('#e7c46d') },
			uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
		}),
		[],
	);
	const { positions, speeds } = useMemo(() => {
		const positions = new Float32Array(count * 3);
		const speeds = new Float32Array(count);
		for (let i = 0; i < count; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 16;
			positions[i * 3 + 1] = Math.random() * 4 - 1;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 1;
			speeds[i] = 0.05 + Math.random() * 0.12;
		}
		return { positions, speeds };
	}, [count]);

	useFrame((state, dt) => {
		const geo = ref.current?.geometry;
		if (!geo) return;
		const arr = geo.attributes.position.array as Float32Array;
		const t = state.clock.elapsedTime;
		for (let i = 0; i < count; i++) {
			arr[i * 3 + 1] += speeds[i] * dt;
			arr[i * 3] += Math.sin(t * 0.4 + i) * 0.0015;
			if (arr[i * 3 + 1] > 3.2) arr[i * 3 + 1] = -1;
		}
		geo.attributes.position.needsUpdate = true;
	});

	return (
		<points ref={ref}>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[positions, 3]} />
			</bufferGeometry>
			<shaderMaterial
				vertexShader={seedVert}
				fragmentShader={seedFrag}
				uniforms={seedUniforms}
				transparent
				depthWrite={false}
				blending={THREE.AdditiveBlending}
			/>
		</points>
	);
}

// Camera follows the pointer gently and lifts away as the page scrolls
function Rig({ still }: { still: boolean }) {
	const { camera } = useThree();
	const pointer = useRef({ x: 0, y: 0 });
	useEffect(() => {
		const onMove = (e: PointerEvent) => {
			pointer.current.x = e.clientX / window.innerWidth - 0.5;
			pointer.current.y = e.clientY / window.innerHeight - 0.5;
		};
		window.addEventListener('pointermove', onMove, { passive: true });
		return () => window.removeEventListener('pointermove', onMove);
	}, []);

	useFrame(() => {
		const s = Math.min(1, window.scrollY / window.innerHeight);
		const tx = still ? 0 : pointer.current.x * 1.4;
		const ty = 2.6 + s * 2.2 - (still ? 0 : pointer.current.y * 0.6);
		const tz = 6.2 + s * 1.5;
		camera.position.x += (tx - camera.position.x) * 0.04;
		camera.position.y += (ty - camera.position.y) * 0.04;
		camera.position.z += (tz - camera.position.z) * 0.04;
		camera.lookAt(0, -0.2 - s * 0.8, -2);
	});
	return null;
}

export default function HeroScene() {
	const [still, setStill] = useState(false);
	const [visible, setVisible] = useState(true);
	const wrap = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		setStill(mq.matches);
		const onChange = () => setStill(mq.matches);
		mq.addEventListener('change', onChange);

		// stop rendering once the hero has scrolled away
		const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
		if (wrap.current) io.observe(wrap.current);
		return () => {
			mq.removeEventListener('change', onChange);
			io.disconnect();
		};
	}, []);

	return (
		<div ref={wrap} className="absolute inset-0" aria-hidden="true">
			<Canvas
				frameloop={visible && !still ? 'always' : 'demand'}
				dpr={[1, 1.75]}
				camera={{ position: [0, 2.6, 6.2], fov: 42, near: 0.1, far: 40 }}
				gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
			>
				<Terrain still={still} />
				{!still && <Seeds />}
				<Rig still={still} />
			</Canvas>
		</div>
	);
}
