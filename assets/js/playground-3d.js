/**
 * Playground 3D Scene Manager
 * Handles individual 3D model rendering for playground entries
 * Supports: OBJ and GLTF formats
 * Validates: Requirements 4.1, 4.5
 */

import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Playground3DScene {
  constructor(container, modelUrl) {
    console.log('=== Playground3DScene constructor ===');
    console.log('Container:', container);
    console.log('Model URL:', modelUrl);
    
    this.container = container;
    this.modelUrl = modelUrl;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model = null;
    this.mouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.isInitialized = false;
    this.isHovering = false;
    this.touchScrollLockContextId = `sketchbook-3d-${Math.random().toString(36).slice(2, 10)}`;

    this.init();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent background

    // Camera setup
    let width = this.container.clientWidth;
    let height = this.container.clientHeight;
    
    // Debug: log container dimensions
    console.log('3D Container dimensions:', { width, height, url: this.modelUrl });
    
    if (width === 0 || height === 0) {
      console.warn('3D container has zero dimensions, retrying...');
      // Retry with exponential backoff
      setTimeout(() => this.init(), 200);
      return;
    }
    
    // Ensure minimum dimensions
    width = Math.max(width, 100);
    height = Math.max(height, 100);
    
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    // Renderer setup
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;
      this.container.appendChild(this.renderer.domElement);
    } catch (error) {
      console.error('Failed to create WebGL renderer:', error);
      this.createFallbackCube();
      return;
    }

    // Add lighting
    this.addLighting();

    // Load model
    this.loadModel();

    // Event listeners
    this.setupEventListeners();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Start animation loop
    this.animate();
    this.isInitialized = true;
  }

  addLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Point light for dynamic effect
    const pointLight = new THREE.PointLight(0xff6b6b, 0.5);
    pointLight.position.set(-5, 5, 5);
    this.scene.add(pointLight);
  }

  loadModel() {
    const fileExtension = this.modelUrl.split('.').pop().toLowerCase();
    console.log('loadModel() called with extension:', fileExtension, 'URL:', this.modelUrl);

    if (fileExtension === 'obj') {
      console.log('Loading OBJ model...');
      this.loadOBJ();
    } else if (fileExtension === 'gltf' || fileExtension === 'glb') {
      console.log('Loading GLTF model...');
      this.loadGLTF();
    } else {
      console.warn(`Unsupported 3D format: ${fileExtension}. Supported: .obj, .gltf`);
      this.createFallbackCube();
    }
  }

  loadOBJ() {
    console.log('loadOBJ() called for:', this.modelUrl);
    
    const loader = new OBJLoader();
    console.log('OBJLoader instance created, loading URL:', this.modelUrl);
    
    loader.load(
      this.modelUrl,
      (object) => {
        console.log('✓ OBJ model loaded successfully');
        console.log('Object:', object);
        console.log('Object children:', object.children);
        this.model = object;
        this.scene.add(this.model);
        this.centerAndScaleModel();
      },
      (progress) => {
        if (progress.total > 0) {
          console.log('OBJ Loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
        }
      },
      (error) => {
        console.error('✗ Error loading OBJ model:', error);
        console.error('Error details:', error.message || error);
        this.createFallbackCube();
      }
    );
  }

  loadGLTF() {
    console.log('loadGLTF() called for:', this.modelUrl);
    
    const loader = new GLTFLoader();
    console.log('GLTFLoader instance created, loading URL:', this.modelUrl);
    
    loader.load(
      this.modelUrl,
      (gltf) => {
        console.log('✓ GLTF model loaded successfully');
        console.log('GLTF scene:', gltf.scene);
        console.log('GLTF scene children:', gltf.scene.children);
        this.model = gltf.scene;
        this.scene.add(this.model);
        this.centerAndScaleModel();
      },
      (progress) => {
        if (progress.total > 0) {
          console.log('GLTF Loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
        }
      },
      (error) => {
        console.error('✗ Error loading GLTF model:', error);
        console.error('Error details:', error.message || error);
        this.createFallbackCube();
      }
    );
  }

  centerAndScaleModel() {
    if (!this.model) {
      console.warn('No model to center and scale');
      return;
    }

    try {
      console.log('centerAndScaleModel() called');
      console.log('Model type:', this.model.constructor.name);
      
      // Calculate bounding box
      const box = new THREE.Box3().setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      console.log('Model bounding box:', { 
        center: { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) },
        size: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) }
      });

      // Center the model
      this.model.position.sub(center);
      console.log('Model centered at:', this.model.position);

      // Scale to fit in view
      const maxDim = Math.max(size.x, size.y, size.z);
      console.log('Max dimension:', maxDim.toFixed(2));
      
      if (maxDim === 0) {
        console.warn('Model has zero dimensions');
        return;
      }
      const scale = 4 / maxDim;
      console.log('Applying scale:', scale.toFixed(2));
      this.model.scale.multiplyScalar(scale);

      // Apply material if needed
      let meshCount = 0;
      this.model.traverse((child) => {
        if (child.isMesh) {
          meshCount++;
          child.castShadow = true;
          child.receiveShadow = true;
          if (!child.material) {
            console.log('Applying default material to mesh', meshCount);
            child.material = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
          } else {
            console.log('Mesh', meshCount, 'already has material:', child.material.constructor.name);
          }
        }
      });
      console.log('Total meshes found:', meshCount);
      
      console.log('✓ Model centered and scaled successfully');
    } catch (error) {
      console.error('Error centering and scaling model:', error);
      this.createFallbackCube();
    }
  }

  createFallbackCube() {
    console.log('createFallbackCube() called - using fallback');
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      shininess: 100,
      side: THREE.DoubleSide
    });
    this.model = new THREE.Mesh(geometry, material);
    this.scene.add(this.model);

    // Add edges
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x2c5aa0 }));
    this.model.add(line);
    console.log('Fallback cube created');
  }

  setupEventListeners() {
    // Mouse movement
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.container.addEventListener('mouseenter', () => this.onMouseEnter());
    this.container.addEventListener('mouseleave', () => this.onMouseLeave());

    // Touch movement
    this.container.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    this.container.addEventListener('touchstart', () => {
      this.onMouseEnter();
      this.lockTouchScroll();
    }, { passive: true });
    this.container.addEventListener('touchend', () => {
      this.onMouseLeave();
      this.unlockTouchScroll();
    }, { passive: true });
    this.container.addEventListener('touchcancel', () => {
      this.onMouseLeave();
      this.unlockTouchScroll();
    }, { passive: true });
  }

  onMouseMove(event) {
    const rect = this.container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Normalize to container coordinates
    this.mouse.x = (x / rect.width) * 2 - 1;
    this.mouse.y = -(y / rect.height) * 2 + 1;

    // Set target rotation
    this.targetRotation.y = this.mouse.x * Math.PI * 0.5;
    this.targetRotation.x = this.mouse.y * Math.PI * 0.5;
  }

  onTouchMove(event) {
    if (event.cancelable) {
      event.preventDefault();
    }
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const rect = this.container.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.mouse.x = (x / rect.width) * 2 - 1;
      this.mouse.y = -(y / rect.height) * 2 + 1;

      this.targetRotation.y = this.mouse.x * Math.PI * 0.5;
      this.targetRotation.x = this.mouse.y * Math.PI * 0.5;
    }
  }

  onMouseEnter() {
    this.isHovering = true;
  }

  onMouseLeave() {
    this.isHovering = false;
    // Smoothly return to default rotation
    this.targetRotation.x = 0;
    this.targetRotation.y = 0;
  }

  lockTouchScroll() {
    if (window.TouchScrollLock && typeof window.TouchScrollLock.lock === 'function') {
      window.TouchScrollLock.lock(this.touchScrollLockContextId);
    }
  }

  unlockTouchScroll() {
    if (window.TouchScrollLock && typeof window.TouchScrollLock.unlock === 'function') {
      window.TouchScrollLock.unlock(this.touchScrollLockContextId);
    }
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.model || !this.renderer) return;

    try {
      // Smoothly interpolate rotation
      this.model.rotation.x += (this.targetRotation.x - this.model.rotation.x) * 0.1;
      this.model.rotation.y += (this.targetRotation.y - this.model.rotation.y) * 0.1;

      // Auto-rotate when not interacting
      if (!this.isHovering && Math.abs(this.targetRotation.x) < 0.01 && Math.abs(this.targetRotation.y) < 0.01) {
        this.model.rotation.z += 0.005;
      }

      this.renderer.render(this.scene, this.camera);
    } catch (error) {
      console.error('Error in animation loop:', error);
    }
  }
}

// Initialize 3D scenes for all playground items
function initializeThreeDScenes() {
  console.log('=== Initializing 3D scenes ===');
  
  // Find only the original 3D containers (collapsed state)
  const threeDContainers = document.querySelectorAll('.playground-3d-thumb');
  console.log('Found', threeDContainers.length, '3D containers');
  
  threeDContainers.forEach((container, index) => {
    const modelUrl = container.getAttribute('data-3d-url');
    console.log(`[Container ${index}] modelUrl =`, modelUrl);
    console.log(`[Container ${index}] data-3d-initialized =`, container.getAttribute('data-3d-initialized'));
    
    if (modelUrl && !container.hasAttribute('data-3d-initialized')) {
      console.log(`[Container ${index}] Creating Playground3DScene...`);
      container.setAttribute('data-3d-initialized', 'true');
      new Playground3DScene(container, modelUrl);
    } else if (!modelUrl) {
      console.warn(`[Container ${index}] No modelUrl found`);
    } else {
      console.log(`[Container ${index}] Already initialized`);
    }
  });
  console.log('=== 3D scenes initialization complete ===');
}

// Wait for DOM to be fully ready
if (document.readyState === 'loading') {
  console.log('DOM still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired, waiting 100ms for layout...');
    // Wait a bit more for layout to be calculated
    setTimeout(initializeThreeDScenes, 100);
  });
} else {
  // DOM already loaded
  console.log('DOM already loaded, waiting 100ms for layout...');
  setTimeout(initializeThreeDScenes, 100);
}

export { Playground3DScene };

// Make Playground3DScene available globally for use in non-module scripts
window.Playground3DScene = Playground3DScene;
