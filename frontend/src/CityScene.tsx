import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CityScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(light);

    // Add a simple cube (placeholder building)
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x3a86ff });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      cube.position.set(0,0,0)
    }

    animate();

    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div 
      ref ={mountRef}
      style={{ 
        width: "100vw", 
        height: "80vh", 
        overflow: "hidden",
      }} 
    />
  );

  // .back {
  // position: relative;
  // z-index: -1; /* negative pushes it behind */
    // }
}