/**
 * Playground 3D Scene Manager
 * Handles individual 3D model rendering for playground entries
 * Supports: OBJ and GLTF formats
 * Validates: Requirements 4.1, 4.5
 */

import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Task 23.3: centralized editable lighting setup (ambient + key/fill/rim).
const PLAYGROUND_3D_LIGHTING = {
  ambient: { color: 0xffffff, intensity: 0.8 },
  key: { type: 'point', color: 0xffffff, intensity: 1.0, position: [4.5, 5.2, 5.5], castShadow: true },
  fill: { type: 'point', color: 0xaec8ff, intensity: 0.35, position: [-4.8, 2.2, 3.8], castShadow: false },
  rim: { type: 'point', color: 0xffd8c0, intensity: 0.45, position: [0.0, 4.2, -5.8], castShadow: false }
};

// Task 23.4: shadow quality presets (auto chooses by device unless overridden).
const PLAYGROUND_3D_SHADOW_PRESETS = {
  desktop: {
    mapSize: 2048,
    bias: -0.00045,
    normalBias: 0.018,
    radius: 1.6,
    blurSamples: 8,
    shadowCameraNear: 0.1,
    shadowCameraFarMultiplier: 4.5,
    minShadowCameraFar: 28
  },
  mobile: {
    mapSize: 1024,
    bias: -0.0004,
    normalBias: 0.015,
    radius: 1.1,
    blurSamples: 4,
    shadowCameraNear: 0.1,
    shadowCameraFarMultiplier: 4.0,
    minShadowCameraFar: 22
  }
};

class Playground3DScene {
  constructor(container, modelUrl, options = {}) {
    console.log('=== Playground3DScene constructor ===');
    console.log('Container:', container);
    console.log('Model URL:', modelUrl);
    
    this.container = container;
    this.modelUrl = modelUrl;
    this.options = {
      materialType: (options.materialType || '').toLowerCase(),
      materialColor: options.materialColor || '',
      matcapTexture: options.matcapTexture || '',
      wireframe: options.wireframe,
      castShadows: options.castShadows,
      receiveShadows: options.receiveShadows,
      shadowQuality: (options.shadowQuality || '').toLowerCase()
    };
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model = null;
    this.shadowCatcher = null;
    this.shadowCastingLight = null;
    this.shadowPreset = this.getShadowPreset();
    this.mouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.isInitialized = false;
    this.isHovering = false;
    this.touchScrollLockContextId = `sketchbook-3d-${Math.random().toString(36).slice(2, 10)}`;

    this.init();
  }

  static get matcapTextureCache() {
    if (!window.__playgroundMatcapCache) {
      window.__playgroundMatcapCache = new Map();
    }
    return window.__playgroundMatcapCache;
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
      this.renderer.shadowMap.enabled = this.shouldCastShadows();
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.autoUpdate = true;
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
    const ambientLight = new THREE.AmbientLight(
      PLAYGROUND_3D_LIGHTING.ambient.color,
      PLAYGROUND_3D_LIGHTING.ambient.intensity
    );
    this.scene.add(ambientLight);

    // Key / Fill / Rim lights
    const keyLight = this.createConfiguredLight(PLAYGROUND_3D_LIGHTING.key);
    const fillLight = this.createConfiguredLight(PLAYGROUND_3D_LIGHTING.fill);
    const rimLight = this.createConfiguredLight(PLAYGROUND_3D_LIGHTING.rim);

    this.applyShadowQualityToLight(keyLight);
    this.scene.add(keyLight);
    this.scene.add(fillLight);
    this.scene.add(rimLight);

    this.shadowCastingLight = keyLight;

    this.setupShadowCatcher();
  }

  createConfiguredLight(config) {
    const type = (config.type || 'point').toLowerCase();
    let light;
    if (type === 'directional') {
      light = new THREE.DirectionalLight(config.color, config.intensity);
    } else {
      light = new THREE.PointLight(config.color, config.intensity);
    }
    const position = Array.isArray(config.position) ? config.position : [0, 0, 0];
    light.position.set(position[0] || 0, position[1] || 0, position[2] || 0);
    light.castShadow = this.shouldCastShadows() && !!config.castShadow;
    light.userData.baseCastShadow = !!config.castShadow;
    return light;
  }

  getShadowPresetName() {
    if (this.options.shadowQuality === 'mobile' || this.options.shadowQuality === 'desktop') {
      return this.options.shadowQuality;
    }
    const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const isNarrowViewport = window.innerWidth <= 900;
    return (isCoarsePointer || isNarrowViewport) ? 'mobile' : 'desktop';
  }

  getShadowPreset() {
    return PLAYGROUND_3D_SHADOW_PRESETS[this.getShadowPresetName()] || PLAYGROUND_3D_SHADOW_PRESETS.desktop;
  }

  applyShadowQualityToLight(light) {
    if (!light || !light.shadow) return;
    const preset = this.shadowPreset || this.getShadowPreset();
    light.shadow.mapSize.set(preset.mapSize, preset.mapSize);
    light.shadow.bias = preset.bias;
    light.shadow.normalBias = preset.normalBias;
    light.shadow.radius = preset.radius;
    if (typeof preset.blurSamples === 'number' && 'blurSamples' in light.shadow) {
      light.shadow.blurSamples = preset.blurSamples;
    }
    if (light.shadow.camera) {
      light.shadow.camera.near = preset.shadowCameraNear;
    }
  }

  setupShadowCatcher() {
    if (this.shadowCatcher) {
      this.scene.remove(this.shadowCatcher);
      this.shadowCatcher.geometry.dispose();
      this.shadowCatcher.material.dispose();
      this.shadowCatcher = null;
    }

    const geometry = new THREE.PlaneGeometry(30, 30);
    const material = new THREE.ShadowMaterial({ opacity: 0.24 });
    this.shadowCatcher = new THREE.Mesh(geometry, material);
    this.shadowCatcher.rotation.x = -Math.PI / 2;
    this.shadowCatcher.position.y = -2.2;
    this.shadowCatcher.receiveShadow = this.shouldReceiveShadows();
    this.shadowCatcher.visible = this.shouldCastShadows();
    this.scene.add(this.shadowCatcher);
  }

  updateShadowCatcherToModelBounds() {
    if (!this.model || !this.shadowCatcher) return;
    const box = new THREE.Box3().setFromObject(this.model);
    const size = box.getSize(new THREE.Vector3());
    const min = box.min;
    const maxDim = Math.max(size.x, size.z, 4);

    this.shadowCatcher.scale.set(maxDim / 30 * 1.8, maxDim / 30 * 1.8, 1);
    this.shadowCatcher.position.y = min.y - 0.04;

    if (this.shadowCastingLight && this.shadowCastingLight.shadow && this.shadowCastingLight.shadow.camera) {
      const preset = this.shadowPreset || this.getShadowPreset();
      const maxModelDim = Math.max(size.x, size.y, size.z, 4);
      this.shadowCastingLight.shadow.camera.far = Math.max(
        preset.minShadowCameraFar,
        maxModelDim * preset.shadowCameraFarMultiplier
      );
      this.shadowCastingLight.shadow.camera.updateProjectionMatrix();
    }
  }

  parseBoolean(value, fallback = true) {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    return fallback;
  }

  parseColorOrNull(value) {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;
    const c = new THREE.Color();
    try {
      c.set(raw);
      return c;
    } catch (error) {
      console.warn('Invalid material_color, using default:', raw);
      return null;
    }
  }

  shouldCastShadows() {
    return this.parseBoolean(this.options.castShadows, true);
  }

  shouldReceiveShadows() {
    return this.parseBoolean(this.options.receiveShadows, this.shouldCastShadows());
  }

  shouldWireframe() {
    return this.parseBoolean(this.options.wireframe, false);
  }

  resolveMatcapUrl() {
    const raw = String(this.options.matcapTexture || '').trim();
    if (!raw) {
      return '/assets/matcaps/C8D1DC_575B62_818892_6E747B-256px.png';
    }
    if (raw.startsWith('/')) return raw;
    return `/assets/matcaps/${raw}`;
  }

  getMatcapTextureIfLoaded(url) {
    const cache = Playground3DScene.matcapTextureCache;
    const cached = cache.get(url);
    if (cached && cached.texture) return cached.texture;
    return null;
  }

  ensureMatcapTextureLoaded(url) {
    const cache = Playground3DScene.matcapTextureCache;
    const cached = cache.get(url);
    if (cached && (cached.texture || cached.loading)) {
      return;
    }

    const loader = new THREE.TextureLoader();
    cache.set(url, { loading: true, texture: null });
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        cache.set(url, { loading: false, texture });
        if (this.model && this.options.materialType === 'matcap') {
          this.applyMaterialAndShadowOptions();
          if (this.renderer && this.camera) {
            this.renderer.render(this.scene, this.camera);
          }
        }
      },
      undefined,
      (error) => {
        console.warn('Failed loading matcap texture:', url, error);
        cache.delete(url);
      }
    );
  }

  createConfiguredMaterial(sourceMaterial = null) {
    const materialType = this.options.materialType;
    const explicitColor = this.parseColorOrNull(this.options.materialColor);
    const inheritedColor = sourceMaterial && sourceMaterial.color && typeof sourceMaterial.color.clone === 'function'
      ? sourceMaterial.color.clone()
      : null;
    const color = explicitColor || inheritedColor || new THREE.Color(0x4a90e2);
    const wireframe = this.options.wireframe !== undefined && this.options.wireframe !== ''
      ? this.shouldWireframe()
      : !!(sourceMaterial && sourceMaterial.wireframe);
    const side = sourceMaterial && sourceMaterial.side !== undefined ? sourceMaterial.side : THREE.DoubleSide;
    const transparent = !!(sourceMaterial && sourceMaterial.transparent);
    const opacity = sourceMaterial && sourceMaterial.opacity !== undefined ? sourceMaterial.opacity : 1;
    const map = sourceMaterial && sourceMaterial.map ? sourceMaterial.map : null;
    const alphaMap = sourceMaterial && sourceMaterial.alphaMap ? sourceMaterial.alphaMap : null;
    const vertexColors = !!(sourceMaterial && sourceMaterial.vertexColors);

    switch (materialType) {
      case 'lambert':
        return new THREE.MeshLambertMaterial({
          color,
          wireframe,
          side,
          transparent,
          opacity,
          map,
          alphaMap,
          vertexColors
        });
      case 'normal':
        return new THREE.MeshNormalMaterial({
          wireframe,
          side,
          transparent,
          opacity
        });
      case 'matcap': {
        const matcapUrl = this.resolveMatcapUrl();
        const matcapTexture = this.getMatcapTextureIfLoaded(matcapUrl);
        if (!matcapTexture) {
          this.ensureMatcapTextureLoaded(matcapUrl);
          // Fallback while matcap loads.
          return new THREE.MeshPhongMaterial({ color, shininess: 100, wireframe, side, transparent, opacity, map, alphaMap, vertexColors });
        }
        return new THREE.MeshMatcapMaterial({
          matcap: matcapTexture,
          color,
          wireframe,
          side,
          transparent,
          opacity,
          map,
          alphaMap
        });
      }
      case 'phong':
      default:
        return new THREE.MeshPhongMaterial({
          color,
          shininess: sourceMaterial && sourceMaterial.shininess !== undefined ? sourceMaterial.shininess : 100,
          wireframe,
          side,
          transparent,
          opacity,
          map,
          alphaMap,
          vertexColors
        });
    }
  }

  applyMaterialAndShadowOptions() {
    if (!this.model) return;
    const castShadows = this.shouldCastShadows();
    const receiveShadows = this.shouldReceiveShadows();
    const hasMaterialOverride = !!this.options.materialType || !!this.options.materialColor || this.options.wireframe !== undefined && this.options.wireframe !== '';

    this.model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = castShadows;
      child.receiveShadow = receiveShadows;

      if (!hasMaterialOverride) {
        if (!child.material) {
          child.material = new THREE.MeshPhongMaterial({ color: 0x4a90e2, side: THREE.DoubleSide });
        }
        return;
      }

      if (Array.isArray(child.material)) {
        child.material = child.material.map((sourceMaterial) => this.createConfiguredMaterial(sourceMaterial));
      } else {
        child.material = this.createConfiguredMaterial(child.material);
      }
    });

    if (this.renderer) {
      this.renderer.shadowMap.enabled = castShadows;
    }
    if (this.shadowCastingLight) {
      const shouldLightCast = castShadows && !!this.shadowCastingLight.userData.baseCastShadow;
      this.shadowCastingLight.castShadow = shouldLightCast;
    }
    if (this.shadowCatcher) {
      this.shadowCatcher.receiveShadow = receiveShadows;
      this.shadowCatcher.visible = castShadows;
    }
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

      // Apply material/shadow options from frontmatter.
      let meshCount = 0;
      this.model.traverse((child) => {
        if (child.isMesh) {
          meshCount++;
        }
      });
      this.applyMaterialAndShadowOptions();
      this.updateShadowCatcherToModelBounds();
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
    const material = this.createConfiguredMaterial();
    this.model = new THREE.Mesh(geometry, material);
    this.model.castShadow = this.shouldCastShadows();
    this.model.receiveShadow = this.shouldReceiveShadows();
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
      new Playground3DScene(container, modelUrl, {
        materialType: container.dataset.materialType,
        materialColor: container.dataset.materialColor,
        wireframe: container.dataset.wireframe,
        castShadows: container.dataset.castShadows,
        matcapTexture: container.dataset.matcapTexture,
        shadowQuality: container.dataset.shadowQuality
      });
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
