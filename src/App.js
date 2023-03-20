import "./App.css";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import circleImg from "./assets/circle.png";
import logo from "./assets/logo.glb";
import lion from "./assets/lion.glb";
import { Suspense, useCallback, useMemo, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import React from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function Points() {
  const imgTex = useLoader(THREE.TextureLoader, circleImg);
  const bufferRef = useRef();

  let t = 0; //phase shift
  let f = 0.002; // frequency
  let a = 3; //amptitude
  const graph = useCallback(
    (x, z) => {
      return Math.sin(f * (x ** 2 + z ** 2 + t)) * a;
    },
    [t, f, a]
  );

  const count = 100;
  const sep = 3;
  let positions = useMemo(() => {
    let positions = [];

    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = sep * (xi - count / 2);
        let z = sep * (zi - count / 2);
        let y = graph(x, z);
        positions.push(x, y, z);
      }
    }

    return new Float32Array(positions);
  }, [count, sep, graph]);

  useFrame(() => {
    t += 15;

    const positions = bufferRef.current.array;

    let i = 0;
    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = sep * (xi - count / 2);
        let z = sep * (zi - count / 2);

        positions[i + 1] = graph(x, z);
        i += 3;
      }
    }

    bufferRef.current.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          ref={bufferRef}
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        attach="material"
        map={imgTex}
        color={0xff3349}
        size={0.5}
        sizeAttenuation
        transparent={false}
        alphaTest={0.5}
        opacity={1.0}
      />
    </points>
  );
}

function LogoModel({ model }) {
  const gltf = useLoader(GLTFLoader, model);
  const meshRef = useRef();
  // useFrame(() => {
  //   meshRef.current.rotation.y += 0.01;
  // });
  useFrame((state, delta) => {
    // Move the mesh up and down over time
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 2;
  });

  return (
    <mesh ref={meshRef} position={[4, 0, -20]}>
      <primitive object={gltf.scene} scale={2} />
    </mesh>
  );
}

function AnimationCanvas() {
  return (
    <Canvas camera={{ position: [-30, 30, -60], fov: 60 }}>
      <ambientLight intensity={0.8} />
      <pointLight position={[30, 5, 30]} intensity={3.5} />
      <Suspense fallback={null}>
        <Points />
        <LogoModel model={logo} />
      </Suspense>
      <OrbitControls enableDamping autoRotate={false} autoRotateSpeed={0.5} />
    </Canvas>
  );
}

function App() {
  return (
    <div className="anim">
      <Suspense fallback={<div>Loading...</div>}>
        <AnimationCanvas />
      </Suspense>
    </div>
  );
}

export default App;
