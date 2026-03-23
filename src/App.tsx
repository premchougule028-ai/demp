/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial, Edges } from '@react-three/drei';
import * as THREE from 'three';

function CyberCore({ phase }: { phase: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Scale up dynamically when phase >= 3
      const targetScale = phase >= 3 ? 1 : 0.001;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 4);

      // Spin faster while entering, then slow down to a steady loop
      const isEntering = phase >= 3 && groupRef.current.scale.x < 0.9;
      const speed = isEntering ? 4 : 1;
      
      groupRef.current.rotation.x += delta * 0.2 * speed;
      groupRef.current.rotation.y += delta * 0.3 * speed;
    }
    
    if (materialRef.current) {
      // Add a pulsing glow effect in the final phase
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.5;
      materialRef.current.emissiveIntensity = phase >= 5 ? pulse : 0.4;
    }
  });

  return (
    <group ref={groupRef} scale={0.001}>
      <Float speed={2.5} rotationIntensity={1} floatIntensity={2}>
        <mesh>
          <icosahedronGeometry args={[2.5, 1]} />
          <MeshDistortMaterial
            ref={materialRef}
            color="#050505"
            emissive="#00e5ff"
            emissiveIntensity={0.4}
            wireframe
            distort={0.4}
            speed={2.5}
          />
          <Edges
            scale={1.02}
            threshold={15}
            color="#00e5ff"
          />
        </mesh>
      </Float>
    </group>
  );
}

function FloatingObjects({ phase }: { phase: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Scale up when phase 5 starts
      const targetScale = phase >= 5 ? 1 : 0.001;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 2);

      // Continuous horizontal slide animation
      groupRef.current.children.forEach((child, i) => {
        child.position.x += delta * (1.5 + i * 0.3); // Slide speed
        if (child.position.x > 15) {
          child.position.x = -15; // Loop back to the left
        }
        child.rotation.x += delta * 0.5;
        child.rotation.y += delta * 0.3;
      });
    }
  });

  return (
    <group ref={groupRef} scale={0.001}>
      <mesh position={[-15, 3, -2]}>
        <octahedronGeometry args={[0.8]} />
        <meshStandardMaterial color="#00e5ff" wireframe />
      </mesh>
      <mesh position={[-10, -3, -4]}>
        <torusGeometry args={[1, 0.05, 16, 32]} />
        <meshStandardMaterial color="#ff00ff" wireframe />
      </mesh>
      <mesh position={[-20, 0, -3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#00e5ff" wireframe />
      </mesh>
      <mesh position={[-5, 4, -5]}>
        <tetrahedronGeometry args={[1.2]} />
        <meshStandardMaterial color="#ff00ff" wireframe />
      </mesh>
      <mesh position={[-25, -2, -2]}>
        <icosahedronGeometry args={[0.9]} />
        <meshStandardMaterial color="#00e5ff" wireframe />
      </mesh>
    </group>
  );
}

function CameraRig({ phase }: { phase: number }) {
  useFrame((state, delta) => {
    // Start far away, zoom in when 3D appears, zoom in closer for the final loop
    const targetZ = phase >= 5 ? 6 : (phase >= 3 ? 9 : 15);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * 2);
    
    // Add a subtle cinematic camera sway
    const swayX = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    const swayY = Math.cos(state.clock.elapsedTime * 0.3) * 0.5;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, swayX, delta);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, swayY, delta);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({ phase }: { phase: number }) {
  return (
    <>
      <CameraRig phase={phase} />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00e5ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff00ff" />
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={1} fade speed={1.5} />
      <CyberCore phase={phase} />
      <FloatingObjects phase={phase} />
    </>
  );
}

function DiagnosticTests() {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const testLines = [
      "INITIATING SYSTEM DIAGNOSTICS...",
      "CHECKING NEURAL LINK... OK",
      "BYPASSING MAINFRAME SECURITY... SUCCESS",
      "CALIBRATING 3D RENDER ENGINE... STABLE",
      "TESTING ORBITAL UPLINK... CONNECTED",
      "RUNNING QUANTUM DECRYPTION... 24%",
      "RUNNING QUANTUM DECRYPTION... 68%",
      "RUNNING QUANTUM DECRYPTION... 100%",
      "ANALYZING SHADOW PROTOCOLS... VERIFIED",
      "ALL SYSTEMS NOMINAL. READY FOR FULL PRESENTATION."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < testLines.length) {
        setLogs(prev => [...prev, testLines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1200);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col space-y-2 text-left h-64 overflow-hidden font-mono text-sm md:text-base text-cyan-400">
      {logs.map((log, idx) => (
        <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <span className="text-gray-500">[{new Date().toISOString().split('T')[1].slice(0,-2)}]</span> {log}
        </motion.div>
      ))}
      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>_</motion.div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000); // Team Shadow
    const t2 = setTimeout(() => setPhase(2), 2500); // Circuit breakers
    const t3 = setTimeout(() => setPhase(3), 4000); // 3D Graphics appear
    const t4 = setTimeout(() => setPhase(4), 7000); // Intro text fades out
    const t5 = setTimeout(() => setPhase(5), 8500); // Final loop appears
    const t6 = setTimeout(() => setPhase(6), 68500); // 1 MINUTE LATER: Text shrinks and moves up
    const t7 = setTimeout(() => setPhase(7), 70000); // Tests start
    
    let progInterval: any;
    const tProg = setTimeout(() => {
      progInterval = setInterval(() => {
        setProgress(p => Math.min(p + (100 / 600), 100));
      }, 100);
    }, 8500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(tProg);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center font-sans">
      {/* 3D Background - Appears at phase 3 and stays continuously */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 3 ? 1 : 0 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute inset-0 z-0"
      >
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
          <Scene phase={phase} />
        </Canvas>
      </motion.div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {/* Phase 1, 2, 3: Intro Sequence */}
          {(phase >= 1 && phase < 4) && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100, filter: "blur(12px)" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="flex flex-col items-center justify-center"
            >
              <motion.h1
                initial={{ letterSpacing: "0em", filter: "blur(10px) drop-shadow(0px 0px 0px rgba(0,229,255,0))", x: -50 }}
                animate={{ letterSpacing: "0.15em", filter: "blur(0px) drop-shadow(0px 40px 25px rgba(0,229,255,0.6))", x: 0 }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                className="text-3xl md:text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 mb-6 uppercase whitespace-nowrap"
              >
                Team Shadow
              </motion.h1>
              
              <AnimatePresence>
                {phase >= 2 && (
                  <motion.p
                    initial={{ opacity: 0, x: -30, letterSpacing: "0em" }}
                    animate={{ opacity: 1, x: 0, letterSpacing: "0.4em" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-xs md:text-lg font-mono text-cyan-400 uppercase font-bold drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                  >
                    we're circuit breakers
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Phase 5 & 6: Professional Loop */}
          {phase >= 5 && (
            <motion.div
              key="loop"
              initial={{ opacity: 0, y: 100, filter: "blur(10px)" }}
              animate={{ 
                opacity: 1, 
                y: phase >= 6 ? -300 : 0, 
                scale: phase >= 6 ? 0.5 : 1,
                filter: "blur(0px)" 
              }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              className="absolute flex flex-col items-center justify-center space-y-10 bg-black/30 p-12 rounded-3xl backdrop-blur-sm border border-white/5 w-full max-w-4xl"
            >
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1.5 }}
                className="text-xl md:text-3xl lg:text-4xl font-bold tracking-[0.1em] text-white leading-tight uppercase flex flex-col items-center text-center"
              >
                <span>This is a System Test</span>
                <span className="text-cyan-400 text-lg md:text-2xl mt-4 whitespace-nowrap">By Team Shadow</span>
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 1.5 }}
                className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1.5 }}
                className="flex flex-col items-center w-full"
              >
                <p className="text-xs md:text-base font-mono text-gray-400 tracking-widest uppercase mb-4">
                  Preparing for Full Presentation Experience
                </p>
                {phase === 5 && (
                  <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ delay: 3, duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mt-8 px-8 py-3 border border-cyan-500/30 rounded-full bg-cyan-500/5 shadow-[0_0_30px_rgba(0,229,255,0.15)]"
              >
                <span className="text-cyan-400 font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs">
                  Stay Tuned
                </span>
              </motion.div>
            </motion.div>
          )}

          {/* Phase 7: Diagnostic Tests */}
          {phase >= 7 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute w-full max-w-3xl bg-black/60 border border-cyan-500/30 p-8 rounded-xl backdrop-blur-md shadow-[0_0_30px_rgba(0,229,255,0.1)] mt-24"
            >
              <DiagnosticTests />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
