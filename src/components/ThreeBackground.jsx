import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeBackground Component — High-performance 3D background using Three.js.
 * Features floating geometric shapes and a connected particle web.
 */
export default function ThreeBackground() {
  const containerRef = useRef();

  useEffect(() => {
    let scene, camera, renderer, objects = [], particles, lines;
    const container = containerRef.current;
    if (!container) return;

    // Setup Scene
    scene = new THREE.Scene();

    // Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.z = 6;

    // Renderer setup with alpha for transparency
    renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: 'high-performance' 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 2, 20); // Blueish
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x9333ea, 2, 20); // Purpleish
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Geometric Shapes Generator
    const geometries = [
      new THREE.BoxGeometry(0.8, 0.8, 0.8),
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.TorusGeometry(0.4, 0.15, 16, 50),
      new THREE.IcosahedronGeometry(0.6, 0)
    ];

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.3,
    });

    for (let i = 0; i < 12; i++) {
        const mesh = new THREE.Mesh(geometries[i % geometries.length], material);
        mesh.position.set(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 5
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        const scale = Math.random() * 0.5 + 0.3;
        mesh.scale.set(scale, scale, scale);
        scene.add(mesh);
        objects.push({
            mesh,
            rotSpeed: (Math.random() - 0.5) * 0.015,
            floatSpeed: (Math.random() - 0.5) * 0.01,
            floatOffset: Math.random() * Math.PI * 2
        });
    }

    // Particle Web
    const particleCount = 60;
    const positions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    
    for (let i = 0; i < particleCount * 3; i+=3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i+1] = (Math.random() - 0.5) * 15;
      positions[i+2] = (Math.random() - 0.5) * 10;
      
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      });
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({ 
        size: 0.1, 
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.8 
    });
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Connected Line Web
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particleCount * particleCount * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x9333ea,
        transparent: true,
        opacity: 0.15 
    });
    lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    let frame = 0;

    const animate = () => {
        frame = requestAnimationFrame(animate);
        
        objects.forEach(obj => {
            obj.mesh.rotation.x += obj.rotSpeed;
            obj.mesh.rotation.y += obj.rotSpeed;
            obj.mesh.position.y += Math.sin(Date.now() * 0.001 + obj.floatOffset) * 0.002;
        });

        const posAttr = particles.geometry.attributes.position;
        let lineIdx = 0;
        const linePosArr = lines.geometry.attributes.position.array;

        for (let i = 0; i < particleCount; i++) {
            const ix = i * 3;
            posAttr.array[ix] += particleVelocities[i].x;
            posAttr.array[ix+1] += particleVelocities[i].y;
            posAttr.array[ix+2] += particleVelocities[i].z;

            // Boundary checks
            if (Math.abs(posAttr.array[ix]) > 10) particleVelocities[i].x *= -1;
            if (Math.abs(posAttr.array[ix+1]) > 8) particleVelocities[i].y *= -1;
            if (Math.abs(posAttr.array[ix+2]) > 5) particleVelocities[i].z *= -1;

            // Connection checks
            for (let j = i + 1; j < particleCount; j++) {
                const jx = j * 3;
                const dx = posAttr.array[ix] - posAttr.array[jx];
                const dy = posAttr.array[ix+1] - posAttr.array[jx+1];
                const dz = posAttr.array[ix+2] - posAttr.array[jx+2];
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                if (dist < 4.5 && lineIdx < linePosArr.length - 6) {
                    linePosArr[lineIdx++] = posAttr.array[ix];
                    linePosArr[lineIdx++] = posAttr.array[ix+1];
                    linePosArr[lineIdx++] = posAttr.array[ix+2];
                    linePosArr[lineIdx++] = posAttr.array[jx];
                    linePosArr[lineIdx++] = posAttr.array[jx+1];
                    linePosArr[lineIdx++] = posAttr.array[jx+2];
                }
            }
        }
        posAttr.needsUpdate = true;
        lines.geometry.setDrawRange(0, lineIdx / 3);
        lines.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', handleResize);
        if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
        renderer.dispose();
        geometries.forEach(g => g.dispose());
        material.dispose();
        particleMaterial.dispose();
    };
  }, []);

  return <div ref={containerRef} className="three-bg-container" />;
}
