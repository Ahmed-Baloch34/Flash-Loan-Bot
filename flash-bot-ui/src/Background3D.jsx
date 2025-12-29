import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';

function EtherShape() {
  const meshRef = useRef();

  // Mouse Follow Logic
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate automatically
    meshRef.current.rotation.y += 0.005;
    
    // Follow Mouse (Tilt effect)
    const { x, y } = state.pointer;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, y * 0.5, 0.1);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, x * 0.5, 0.1);
  });

  return (
    <group ref={meshRef}>
      {/* Outer Wireframe (Blue) */}
      <mesh>
        <octahedronGeometry args={[2.5, 0]} />
        <meshStandardMaterial 
          color="#00f3ff" 
          wireframe={true} 
          emissive="#00f3ff"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Inner Solid Core (Black) */}
      <mesh>
        <octahedronGeometry args={[2.4, 0]} />
        <meshStandardMaterial color="black" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="absolute inset-0 -z-10 bg-[#050b14]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        
        {/* Lights to make it shine */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#ff00aa" />

        {/* Floating Animation */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <EtherShape />
        </Float>

        {/* Background Stars */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
}