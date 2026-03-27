import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironmentCustom } from './lib/RoomEnvironmentCustom.js';

const WELCOME_HERO_3D_CONFIG = {
  camera: {
    fov: 10,
    near: 0.1,
    far: 100,
    fitHeightRatioDesktop: 0.92,
    fitHeightRatioMobile: 0.86,
    fitWidthRatioDesktop: 0.88,
    fitWidthRatioMobile: 0.94,
    minDistanceMultiplier: 1.12,
    positionOffsetDesktop: { x: 0, y: -0.5, z: 0.5 },
    positionOffsetMobile: { x: 0, y: -0.5, z: 0.5 },
    lookAt: { x: 0, y: 0, z: 0 }
  },
  model: {
    scaleDesktop: 3.88,
    scaleMobile: 4.28,
    offsetDesktop: { x: 0, y: -0.9, z: 0 },
    offsetMobile: { x: 0, y: -1.9, z: 0 },
    pointerTilt: {
      enabled: true,
      maxRotateX: 0.085,
      maxRotateY: 0.14,
      smoothing: 0.7
    },
    pupilFollow: {
      enabled: true,
      maxOffsetX: 0.009,
      maxOffsetY: 0.008,
      crossEyeStrength: 0.08,
      smoothing: 0.9,
      segmentSizeX: 0,
      segmentSizeY: 0
    },
    browFollow: {
      enabled: true,
      maxOffsetY: 0.012,
      maxOffsetSideY: 0.0048,
      maxRotateZ: 0.12,
      maxRotateX: 0.012,
      maxRotateY: 0.018
    }
  },
  lights: {
    ambient: { color: 0xffffff, intensity: 0 },
    key: { color: 0xffffff, intensity: 0.72, position: { x: 1.4, y: 2.1, z: 3.4 } },
    fill: { color: 0xf1f5f8, intensity: 0, position: { x: -1.2, y: 0.45, z: 1.4 } },
    rim: { color: 0xffffff, intensity: 0, position: { x: 0.45, y: 0.6, z: -2.4 } },
    screenGlow: {
      enabled: true,
      colors: {
        blue: 0x7fc8ff,
        violet: 0x9176ff
      },
      intensity: 2.6,
      fillIntensity: 4.0,
      distance: 3.0,
      decay: 1.6,
      angle: 0.92,
      penumbra: 0.82,
      lightOffset: { x: 0, y: -0.7, z: 0.15 },
      targetOffset: { x: -0.16, y: 0.18, z: 0.23 },
      rayOffset: { x: 0, y: -0.13, z: 0.07 },
      rayLength: 0.4,
      rayRadius: 1.5,
      rayOpacity: 0.15,
      raySpread: 0.0,
      raySourceWidth: 0.32,
      rotation: { x: 0, y: 0, z: 0 },
      helperSphere: {
        enabled: false,
        radius: 0.08,
        opacity: 0.15
      },
      scatter: {
        enabled: true,
        color: 0xff8a68,
        strength: 1.8,
        power: 0.9,
        wrap: 1.1,
        distance: 2.2
      }
    }
  },
  materials: {
    preserveOriginal: true,
    globalRoughnessBias: 0.12,
    globalMetalnessBias: -0.04,
    envMapIntensity: 0.18,
    screenEmissive: 0xe8f3ff,
    screenEmissiveIntensity: 0.3
  },
  renderer: {
    exposure: 0.5,
    maxPixelRatio: 2
  }
};

window.WELCOME_HERO_3D_CONFIG = WELCOME_HERO_3D_CONFIG;

class WelcomeHero3D {
  constructor(container) {
    this.container = container;
    this.modelUrl = container.dataset.modelUrl;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.modelRoot = new THREE.Group();
    this.characterRoot = new THREE.Group();
    this.staticRoot = new THREE.Group();
    this.model = null;
    this.modelCenter = null;
    this.modelSize = null;
    this.screenGlowLightGroup = null;
    this.screenGlowRayGroup = null;
    this.computerObject = null;
    this.screenGlowTarget = new THREE.Object3D();
    this.pointerTarget = new THREE.Vector2(0, 0);
    this.pointerCurrent = new THREE.Vector2(0, 0);
    this.pupilPointerCurrent = new THREE.Vector2(0, 0);
    this.eyeWhiteMesh = null;
    this.browMeshes = [];
    this.browBaseTransforms = new Map();
    this.smileMesh = null;
    this.smileIndices = [];
    this.smileCurrent = 0;
    this.smileTarget = 0;
    this.pupilMeshes = [];
    this.pupilBasePositions = new Map();
    this.pupilMetadata = new Map();
    this.keyLight = null;
    this.shadowTarget = new THREE.Object3D();
    this.animationFrame = null;
    this.resizeObserver = null;

    this.init();
  }

  init() {
    if (!this.container || !this.modelUrl) {
      return;
    }

    const width = Math.max(this.container.clientWidth, 320);
    const height = Math.max(this.container.clientHeight, 320);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      WELCOME_HERO_3D_CONFIG.camera.fov,
      width / height,
      WELCOME_HERO_3D_CONFIG.camera.near,
      WELCOME_HERO_3D_CONFIG.camera.far
    );
    this.camera.position.set(0, 0.15, 9.2);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      stencil: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, WELCOME_HERO_3D_CONFIG.renderer.maxPixelRatio));
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = WELCOME_HERO_3D_CONFIG.renderer.exposure;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    this.setupEnvironment();
    this.modelRoot.add(this.staticRoot, this.characterRoot);
    this.scene.add(this.modelRoot);
    this.scene.add(this.shadowTarget);
    this.scene.add(this.screenGlowTarget);
    this.addLights();
    this.loadModel();
    this.bindPointer();
    this.bindStickerSmile();
    this.bindResize();
    this.animate();
  }

  addLights() {
    const { ambient: ambientConfig, key: keyConfig, fill: fillConfig, rim: rimConfig } = WELCOME_HERO_3D_CONFIG.lights;
    const ambient = new THREE.AmbientLight(ambientConfig.color, ambientConfig.intensity);
    const key = new THREE.DirectionalLight(keyConfig.color, keyConfig.intensity);
    key.position.set(keyConfig.position.x, keyConfig.position.y, keyConfig.position.z);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.00025;
    key.shadow.normalBias = 0.02;
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 12;
    key.shadow.camera.left = -3;
    key.shadow.camera.right = 3;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -3;
    key.target = this.shadowTarget;
    this.keyLight = key;

    const fill = new THREE.DirectionalLight(fillConfig.color, fillConfig.intensity);
    fill.position.set(fillConfig.position.x, fillConfig.position.y, fillConfig.position.z);

    const rim = new THREE.DirectionalLight(rimConfig.color, rimConfig.intensity);
    rim.position.set(rimConfig.position.x, rimConfig.position.y, rimConfig.position.z);

    this.scene.add(ambient, key, fill, rim);
  }

  setupEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const roomEnvironment = new RoomEnvironmentCustom();
    const envRenderTarget = pmremGenerator.fromScene(roomEnvironment);
    this.scene.environment = envRenderTarget.texture;
    roomEnvironment.dispose();
    pmremGenerator.dispose();
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      this.modelUrl,
      (gltf) => {
        this.model = gltf.scene;
        this.prepareModel(this.model);
        this.centerModelOnce(this.model);
        this.characterRoot.add(this.model);
        this.extractStaticObjects();
        this.addScreenGlow();
        this.fitModelToViewport();
        this.updateShadowTarget();
      },
      undefined,
      (error) => {
        console.error('Failed to load welcome hero model:', error);
      }
    );
  }

  prepareModel(model) {
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const isBusinessmanGlasses = this.isInsideNamedGroup(child, 'businessman_glasses');
      const isHairStrandMesh = /dm3d-hair-curve/i.test(child.name || '');
      const meshName = child.name || '';
      if (meshName === 'barista_brow.L' || meshName === 'barista_brow.R' || meshName === 'barista_browL' || meshName === 'barista_browR') {
        this.browMeshes.push(child);
      }
      if (meshName === 'cabeza001' && child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).length) {
        this.smileMesh = child;
        this.smileIndices = Object.entries(child.morphTargetDictionary)
          .filter(([name]) => name.toLowerCase().startsWith('smile'))
          .map(([, index]) => index);
      }
      if (meshName === 'barista_eyes') {
        this.eyeWhiteMesh = child;
        child.renderOrder = 1;
      }
      if (meshName === 'barista_pupils') {
        child.visible = false;
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((material) => this.prepareMaterial(material, { isBusinessmanGlasses, isHairStrandMesh, meshName }));
        } else {
          child.material = this.prepareMaterial(child.material, { isBusinessmanGlasses, isHairStrandMesh, meshName });
        }
      }
    });
  }

  isInsideNamedGroup(object, groupName) {
    let current = object;
    while (current) {
      if (current.name === groupName) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  prepareMaterial(material, options = {}) {
    if (!material) return;
    let prepared = material;
    const isGlassesPart = options.isBusinessmanGlasses;
    const isGlassLensMesh = options.meshName === 'businessman_glasses_glass';
    const isGlassesMaterial = isGlassesPart && material.name === 'gafas';
    const isLensGlassMaterial = isGlassLensMesh || material.name === 'cristal';
    const isHairStrandMaterial = options.isHairStrandMesh || /dm3d-poly-material/i.test(material.name || '');
    const looksLikeScreen = /screen|monitor|display/i.test(material.name || '');
    const isEyeWhite = options.meshName === 'barista_eyes';
    const isPupil = options.meshName === 'barista_pupils';

    if (isGlassesPart || isLensGlassMaterial || isHairStrandMaterial || looksLikeScreen || isEyeWhite || isPupil) {
      prepared = material.clone();
    }

    if ('roughness' in prepared && typeof prepared.roughness === 'number') {
      prepared.roughness = THREE.MathUtils.clamp(
        prepared.roughness + WELCOME_HERO_3D_CONFIG.materials.globalRoughnessBias,
        0,
        1
      );
    }
    if ('metalness' in prepared && typeof prepared.metalness === 'number') {
      prepared.metalness = THREE.MathUtils.clamp(
        prepared.metalness + WELCOME_HERO_3D_CONFIG.materials.globalMetalnessBias,
        0,
        1
      );
    }

    if ('emissive' in prepared && looksLikeScreen) {
      prepared.emissive = new THREE.Color(WELCOME_HERO_3D_CONFIG.materials.screenEmissive);
      prepared.emissiveIntensity = WELCOME_HERO_3D_CONFIG.materials.screenEmissiveIntensity;
    }
    if ('envMapIntensity' in prepared) {
      prepared.envMapIntensity = WELCOME_HERO_3D_CONFIG.materials.envMapIntensity;
    }

    if ((isGlassesPart || isLensGlassMaterial) && 'roughness' in prepared && typeof prepared.roughness === 'number') {
      prepared.roughness = 0.08;
    }

    if (isHairStrandMaterial) {
      this.applyHairStrandShader(prepared);
    }

    if (isEyeWhite) {
      if ('color' in prepared && prepared.color) {
        prepared.color = new THREE.Color(0xffffff);
      }
      prepared.transparent = false;
      prepared.opacity = 1;
      prepared.depthWrite = true;
      if ('roughness' in prepared && typeof prepared.roughness === 'number') {
        prepared.roughness = 0.95;
      }
      if ('metalness' in prepared && typeof prepared.metalness === 'number') {
        prepared.metalness = 0;
      }
      if ('emissive' in prepared && prepared.emissive) {
        prepared.emissive = new THREE.Color(0xffffff);
      }
      if ('emissiveIntensity' in prepared) {
        prepared.emissiveIntensity = 0.55;
      }
      if ('toneMapped' in prepared) {
        prepared.toneMapped = false;
      }
      prepared.stencilWrite = true;
      prepared.stencilRef = 1;
      prepared.stencilFunc = THREE.AlwaysStencilFunc;
      prepared.stencilFail = THREE.KeepStencilOp;
      prepared.stencilZFail = THREE.KeepStencilOp;
      prepared.stencilZPass = THREE.ReplaceStencilOp;
    }

    if (isPupil) {
      if ('color' in prepared && prepared.color) {
        prepared.color = new THREE.Color(0x000000);
      }
      prepared.transparent = false;
      prepared.opacity = 1;
      prepared.depthWrite = true;
      if ('roughness' in prepared && typeof prepared.roughness === 'number') {
        prepared.roughness = 0.75;
      }
      if ('metalness' in prepared && typeof prepared.metalness === 'number') {
        prepared.metalness = 0;
      }
      if ('emissive' in prepared && prepared.emissive) {
        prepared.emissive = new THREE.Color(0x000000);
      }
      if ('emissiveIntensity' in prepared) {
        prepared.emissiveIntensity = 0;
      }
      if ('toneMapped' in prepared) {
        prepared.toneMapped = false;
      }
      prepared.stencilWrite = true;
      prepared.stencilRef = 1;
      prepared.stencilFunc = THREE.EqualStencilFunc;
      prepared.stencilFail = THREE.KeepStencilOp;
      prepared.stencilZFail = THREE.KeepStencilOp;
      prepared.stencilZPass = THREE.KeepStencilOp;
    }

    if (isGlassesMaterial || isLensGlassMaterial) {
      prepared.transparent = true;
      prepared.opacity = isLensGlassMaterial ? 0.32 : 0.46;
      prepared.depthWrite = false;
      prepared.alphaTest = 0;
      prepared.side = THREE.DoubleSide;

      if ('transmission' in prepared) {
        prepared.transmission = isLensGlassMaterial ? 0.82 : 0.58;
      }
      if ('thickness' in prepared) {
        prepared.thickness = isLensGlassMaterial ? 0.08 : 0.18;
      }
      if ('ior' in prepared) {
        prepared.ior = isLensGlassMaterial ? 1.18 : 1.28;
      }
      if ('roughness' in prepared && typeof prepared.roughness === 'number') {
        prepared.roughness = isLensGlassMaterial ? 0.04 : 0.08;
      }
      if ('metalness' in prepared && typeof prepared.metalness === 'number') {
        prepared.metalness = 0;
      }
      if ('color' in prepared && prepared.color) {
        prepared.color = new THREE.Color(isLensGlassMaterial ? 0xf4fbff : 0xe9f1f6);
      }
      if ('emissive' in prepared && prepared.emissive) {
        prepared.emissive = new THREE.Color(isLensGlassMaterial ? 0x05080b : 0x13181d);
      }
      if ('emissiveIntensity' in prepared) {
        prepared.emissiveIntensity = isLensGlassMaterial ? 0.02 : 0.06;
      }
    }

    if (!isGlassesMaterial) {
      prepared.depthWrite = true;
    }
    prepared.needsUpdate = true;
    return prepared;
  }

  applyHairStrandShader(material) {
    if (!material || typeof material.onBeforeCompile !== 'function') return;

    material.defines = {
      ...(material.defines || {}),
      USE_UV: ''
    };

    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
        float hash21(vec2 p) {
          p = fract(p * vec2(123.34, 345.45));
          p += dot(p, p + 34.345);
          return fract(p.x * p.y);
        }
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <normal_fragment_begin>',
        `#include <normal_fragment_begin>
        float strandCoordN = vUv.y;
        float lineAN = sin(strandCoordN * 120.0 + vUv.x * 4.0);
        float lineBN = sin(strandCoordN * 220.0 - vUv.x * 7.0);
        float lineCN = sin(strandCoordN * 420.0 + vUv.x * 13.0);
        float strandsN = 0.5 + 0.23 * lineAN + 0.16 * lineBN + 0.09 * lineCN;
        float strandMaskN = smoothstep(0.12, 0.96, strandsN);
        vec3 strandNormalOffset = vec3(dFdx(strandMaskN), dFdy(strandMaskN), 0.0) * 0.18;
        normal = normalize(normal + strandNormalOffset);
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float strandCoord = vUv.y;
        float lineA = sin(strandCoord * 120.0 + vUv.x * 4.0);
        float lineB = sin(strandCoord * 220.0 - vUv.x * 7.0);
        float lineC = sin(strandCoord * 420.0 + vUv.x * 13.0);
        float cellNoise = hash21(vec2(floor(vUv.x * 38.0), floor(strandCoord * 14.0)));
        float strands = 0.5 + 0.23 * lineA + 0.16 * lineB + 0.09 * lineC;
        strands = mix(strands, strands + cellNoise * 0.15, 0.7);
        float strandMask = smoothstep(0.12, 0.96, strands);
        vec3 darkTint = vec3(0.5, 0.34, 0.23);
        vec3 lightTint = vec3(1.08, 0.86, 0.62);
        diffuseColor.rgb *= mix(darkTint, lightTint, strandMask);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.82, 0.58, 0.38), 0.14);
        `
      );
    };

    material.customProgramCacheKey = () => 'hair-strand-v2';
    material.needsUpdate = true;
  }

  centerModelOnce(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.sub(center);
    this.modelCenter = center.clone();

    this.modelSize = {
      x: size.x,
      y: size.y,
      z: size.z,
      maxDim: Math.max(size.x, size.y, size.z, 1)
    };

    this.buildCustomPupils();
    this.browMeshes.forEach((mesh) => {
      this.browBaseTransforms.set(mesh.uuid, {
        position: mesh.position.clone(),
        rotation: mesh.rotation.clone()
      });
    });

    this.pupilMeshes.forEach((mesh) => {
      this.pupilBasePositions.set(mesh.uuid, mesh.position.clone());
    });
  }

  addScreenGlow() {
    const glowConfig = WELCOME_HERO_3D_CONFIG.lights.screenGlow;
    if (!glowConfig?.enabled || !this.computerObject) return;

    if (this.screenGlowLightGroup) {
      this.computerObject.remove(this.screenGlowLightGroup);
    }
    if (this.screenGlowRayGroup) {
      this.computerObject.remove(this.screenGlowRayGroup);
    }

    this.screenGlowLightGroup = new THREE.Group();
    this.screenGlowRayGroup = new THREE.Group();

    this.screenGlowRayGroup.position.set(
      glowConfig.rayOffset.x,
      glowConfig.rayOffset.y,
      glowConfig.rayOffset.z
    );
    this.screenGlowRayGroup.rotation.set(
      glowConfig.rotation.x,
      glowConfig.rotation.y,
      glowConfig.rotation.z
    );

    const blueLight = new THREE.SpotLight(
      glowConfig.colors.blue,
      glowConfig.intensity,
      glowConfig.distance,
      glowConfig.angle,
      glowConfig.penumbra,
      glowConfig.decay
    );
    const violetLight = new THREE.SpotLight(
      glowConfig.colors.violet,
      glowConfig.fillIntensity,
      glowConfig.distance,
      glowConfig.angle * 1.05,
      glowConfig.penumbra,
      glowConfig.decay
    );

    blueLight.position.set(
      glowConfig.lightOffset.x,
      glowConfig.lightOffset.y,
      glowConfig.lightOffset.z
    );
    violetLight.position.set(
      glowConfig.lightOffset.x + 0.08,
      glowConfig.lightOffset.y + 0.02,
      glowConfig.lightOffset.z - 0.02
    );
    blueLight.target = this.screenGlowTarget;
    violetLight.target = this.screenGlowTarget;

    this.screenGlowLightGroup.add(blueLight, violetLight);
    this.screenGlowRayGroup.add(
      this.createGodRayFan(glowConfig.colors.blue, glowConfig.rayRadius, glowConfig.rayLength, glowConfig.rayOpacity, glowConfig.raySpread, glowConfig.raySourceWidth),
      this.createGodRayFan(glowConfig.colors.violet, glowConfig.rayRadius * 0.86, glowConfig.rayLength * 0.94, glowConfig.rayOpacity * 0.9, glowConfig.raySpread * 0.82, glowConfig.raySourceWidth * 0.92)
    );

    const helperConfig = glowConfig.helperSphere;
    if (helperConfig?.enabled) {
      const helper = new THREE.Mesh(
        new THREE.SphereGeometry(helperConfig.radius, 20, 20),
        new THREE.MeshBasicMaterial({
          color: glowConfig.colors.blue,
          transparent: true,
          opacity: helperConfig.opacity
        })
      );
      this.screenGlowRayGroup.add(helper);
    }

    this.computerObject.add(this.screenGlowLightGroup);
    this.computerObject.add(this.screenGlowRayGroup);
    this.updateScreenGlowTarget();
  }

  rebuildScreenGlow() {
    this.addScreenGlow();
  }

  extractStaticObjects() {
    if (!this.model) return;
    const computer = this.model.getObjectByName('computer');
    if (computer) {
      this.staticRoot.attach(computer);
      this.computerObject = computer;
    }
  }

  createGodRayFan(color, radius, length, opacity, spread, sourceWidth) {
    const group = new THREE.Group();
    const rayAngles = [-spread, -spread * 0.45, 0, spread * 0.45, spread];
    const rayOffsets = [-0.5, -0.2, 0, 0.2, 0.5];

    rayAngles.forEach((angle, index) => {
      const beamOpacity = opacity * (index === 2 ? 1 : 0.72);
      const beamWidth = radius * (index === 2 ? 0.42 : 0.28);
      const beam = this.createSingleGodRay(color, beamWidth, length, beamOpacity);
      beam.position.x = rayOffsets[index] * sourceWidth;
      beam.rotation.y = angle;
      group.add(beam);
    });

    return group;
  }

  createSingleGodRay(color, width, length, opacity) {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float widthAtDepth = mix(0.08, 1.0, vUv.y);
          float beamShape = 1.0 - smoothstep(widthAtDepth, widthAtDepth + 0.08, abs(vUv.x - 0.5) * 2.0);
          float falloff = 1.0 - smoothstep(0.0, 1.0, vUv.y);
          float beam = beamShape * pow(falloff, 1.15);
          gl_FragColor = vec4(uColor, beam * uOpacity);
        }
      `
    });

    const geometry = new THREE.PlaneGeometry(width, length, 1, 1);
    const beam = new THREE.Mesh(geometry, material);
    beam.position.set(0, length * 0.5, 0);
    return beam;
  }

  updateScreenGlowTarget() {
    const glowConfig = WELCOME_HERO_3D_CONFIG.lights.screenGlow;
    if (!glowConfig?.enabled || !this.computerObject) return;

    const worldOrigin = new THREE.Vector3();
    this.computerObject.getWorldPosition(worldOrigin);
    this.screenGlowTarget.position.set(
      worldOrigin.x + glowConfig.targetOffset.x,
      worldOrigin.y + glowConfig.targetOffset.y,
      worldOrigin.z + glowConfig.targetOffset.z
    );
    this.screenGlowTarget.updateMatrixWorld();
  }

  updateShadowTarget() {
    if (!this.keyLight) return;
    this.shadowTarget.position.set(
      this.modelRoot.position.x,
      this.modelRoot.position.y - 0.1,
      this.modelRoot.position.z + 0.2
    );
    this.shadowTarget.updateMatrixWorld();
    this.keyLight.shadow.needsUpdate = true;
  }

  buildCustomPupils() {
    if (!this.eyeWhiteMesh?.geometry?.attributes?.position) return;

    const position = this.eyeWhiteMesh.geometry.attributes.position;
    const sides = {
      left: this.createSideBounds(),
      right: this.createSideBounds()
    };

    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const y = position.getY(index);
      const z = position.getZ(index);
      const side = x < 0 ? sides.left : sides.right;
      side.min.x = Math.min(side.min.x, x);
      side.min.y = Math.min(side.min.y, y);
      side.min.z = Math.min(side.min.z, z);
      side.max.x = Math.max(side.max.x, x);
      side.max.y = Math.max(side.max.y, y);
      side.max.z = Math.max(side.max.z, z);
      side.count += 1;
    }

    Object.entries(sides).forEach(([sideName, side]) => {
      if (!side.count) return;

      const width = side.max.x - side.min.x;
      const height = side.max.y - side.min.y;
      const radius = Math.max(Math.min(width, height) * 0.36, 0.016);
      const center = new THREE.Vector3(
        (side.min.x + side.max.x) * 0.5,
        (side.min.y + side.max.y) * 0.5,
        side.max.z + 0.0015
      );

      const iris = new THREE.Mesh(
        new THREE.CircleGeometry(radius, 32),
        new THREE.MeshBasicMaterial({
          map: this.createIrisGradientTexture(),
          toneMapped: false,
          depthTest: false,
          depthWrite: false
        })
      );
      iris.position.copy(center);
      iris.renderOrder = 2;
      iris.material.stencilWrite = true;
      iris.material.stencilRef = 1;
      iris.material.stencilFunc = THREE.EqualStencilFunc;
      iris.material.stencilFail = THREE.KeepStencilOp;
      iris.material.stencilZFail = THREE.KeepStencilOp;
      iris.material.stencilZPass = THREE.KeepStencilOp;
      const pupil = new THREE.Mesh(
        new THREE.CircleGeometry(radius * 0.62, 24),
        new THREE.MeshBasicMaterial({
          color: 0x050505,
          toneMapped: false,
          depthTest: false,
          depthWrite: false
        })
      );
      pupil.position.set(0, 0, 0.0003);
      pupil.renderOrder = 3;
      pupil.material.stencilWrite = true;
      pupil.material.stencilRef = 1;
      pupil.material.stencilFunc = THREE.EqualStencilFunc;
      pupil.material.stencilFail = THREE.KeepStencilOp;
      pupil.material.stencilZFail = THREE.KeepStencilOp;
      pupil.material.stencilZPass = THREE.KeepStencilOp;
      const highlight = new THREE.Mesh(
        new THREE.CircleGeometry(radius * 0.32, 24),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          toneMapped: false,
          depthTest: false,
          depthWrite: false
        })
      );
      highlight.position.set(-radius * 0.38, radius * 0.36, 0.0004);
      highlight.renderOrder = 4;
      highlight.material.stencilWrite = true;
      highlight.material.stencilRef = 1;
      highlight.material.stencilFunc = THREE.EqualStencilFunc;
      highlight.material.stencilFail = THREE.KeepStencilOp;
      highlight.material.stencilZFail = THREE.KeepStencilOp;
      highlight.material.stencilZPass = THREE.KeepStencilOp;
      iris.add(pupil);
      pupil.add(highlight);
      this.eyeWhiteMesh.add(iris);
      this.pupilMeshes.push(iris);
      this.pupilMetadata.set(iris.uuid, {
        side: sideName,
        eyeCenter: center.clone()
      });
    });
  }

  createSideBounds() {
    return {
      min: new THREE.Vector3(Infinity, Infinity, Infinity),
      max: new THREE.Vector3(-Infinity, -Infinity, -Infinity),
      count: 0
    };
  }

  createIrisGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#48613a');
    gradient.addColorStop(0.5, '#6f8a54');
    gradient.addColorStop(1, '#9ab67b');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  fitModelToViewport() {
    if (!this.model || !this.modelSize || !this.camera || !this.container) return;

    const isMobile = window.innerWidth <= 768;
    const fitHeightRatio = isMobile
      ? WELCOME_HERO_3D_CONFIG.camera.fitHeightRatioMobile
      : WELCOME_HERO_3D_CONFIG.camera.fitHeightRatioDesktop;
    const fitWidthRatio = isMobile
      ? WELCOME_HERO_3D_CONFIG.camera.fitWidthRatioMobile
      : WELCOME_HERO_3D_CONFIG.camera.fitWidthRatioDesktop;

    const verticalFov = THREE.MathUtils.degToRad(this.camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * this.camera.aspect);
    const distanceForHeight = (this.modelSize.y * 0.5) / Math.tan(verticalFov / 2);
    const distanceForWidth = (this.modelSize.x * 0.5) / Math.tan(horizontalFov / 2);
    const fitDistance = Math.max(
      distanceForHeight / fitHeightRatio,
      distanceForWidth / fitWidthRatio,
      this.modelSize.maxDim * WELCOME_HERO_3D_CONFIG.camera.minDistanceMultiplier
    );

    const cameraOffset = isMobile
      ? WELCOME_HERO_3D_CONFIG.camera.positionOffsetMobile
      : WELCOME_HERO_3D_CONFIG.camera.positionOffsetDesktop;
    this.camera.position.set(
      cameraOffset.x,
      cameraOffset.y,
      fitDistance + cameraOffset.z
    );
    this.camera.lookAt(
      WELCOME_HERO_3D_CONFIG.camera.lookAt.x,
      WELCOME_HERO_3D_CONFIG.camera.lookAt.y,
      WELCOME_HERO_3D_CONFIG.camera.lookAt.z
    );

    const scale = isMobile
      ? WELCOME_HERO_3D_CONFIG.model.scaleMobile
      : WELCOME_HERO_3D_CONFIG.model.scaleDesktop;
    this.modelRoot.scale.setScalar(scale);

    const modelOffset = isMobile
      ? WELCOME_HERO_3D_CONFIG.model.offsetMobile
      : WELCOME_HERO_3D_CONFIG.model.offsetDesktop;
    this.modelRoot.position.set(modelOffset.x, modelOffset.y, modelOffset.z);
    this.updateShadowTarget();
    this.updateScreenGlowTarget();
    this.updateRendererSize();
  }

  bindResize() {
    this.handleResize = () => this.onResize();

    window.addEventListener('resize', this.handleResize, { passive: true });

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.onResize());
      this.resizeObserver.observe(this.container);
    }
  }

  bindPointer() {
    this.handlePointerMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      this.pointerTarget.set(
        THREE.MathUtils.clamp(x, -1, 1),
        THREE.MathUtils.clamp(y, -1, 1)
      );
    };

    this.handlePointerLeave = () => {
      this.pointerTarget.set(0, 0);
    };

    window.addEventListener('mousemove', this.handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', this.handlePointerLeave, { passive: true });
  }

  bindStickerSmile() {
    const setSmile = (active) => {
      this.smileTarget = active ? 1 : 0;
    };

    const onPressStart = (event) => {
      const sticker = event.target.closest('.sticker-wrapper');
      if (!sticker) return;
      setSmile(true);
    };

    const onPressEnd = () => {
      setSmile(false);
    };

    document.addEventListener('pointerdown', onPressStart, true);
    document.addEventListener('pointerup', onPressEnd, true);
    document.addEventListener('pointercancel', onPressEnd, true);
    document.addEventListener('touchstart', onPressStart, { passive: true, capture: true });
    document.addEventListener('touchend', onPressEnd, true);
    document.addEventListener('touchcancel', onPressEnd, true);
  }

  onResize() {
    this.updateRendererSize();
  }

  updateRendererSize() {
    if (!this.renderer || !this.camera || !this.container) return;
    const width = Math.max(this.container.clientWidth, 320);
    const height = Math.max(this.container.clientHeight, 320);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, WELCOME_HERO_3D_CONFIG.renderer.maxPixelRatio));
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animationFrame = window.requestAnimationFrame(() => this.animate());
    if (!this.renderer || !this.scene || !this.camera) return;

    this.clock.getElapsedTime();
    this.updatePointerState();
    this.updatePointerTilt();
    this.updatePupilFollow();
    this.updateBrows();
    this.updateSmile();
    this.renderer.render(this.scene, this.camera);
  }

  updatePointerState() {
    const tiltConfig = WELCOME_HERO_3D_CONFIG.model.pointerTilt;
    const tiltSmoothing = tiltConfig?.smoothing ?? 0.04;
    const pupilSmoothing = WELCOME_HERO_3D_CONFIG.model.pupilFollow?.smoothing ?? 0.16;
    this.pointerCurrent.lerp(this.pointerTarget, tiltSmoothing);
    this.pupilPointerCurrent.lerp(this.pointerTarget, pupilSmoothing);
  }

  updatePointerTilt() {
    const tiltConfig = WELCOME_HERO_3D_CONFIG.model.pointerTilt;
    if (!tiltConfig?.enabled) return;
    this.characterRoot.rotation.x = this.pointerCurrent.y * tiltConfig.maxRotateX;
    this.characterRoot.rotation.y = this.pointerCurrent.x * tiltConfig.maxRotateY;
  }

  updatePupilFollow() {
    const pupilConfig = WELCOME_HERO_3D_CONFIG.model.pupilFollow;
    if (!pupilConfig?.enabled || this.pupilMeshes.length === 0) return;

    const pointerX = this.pupilPointerCurrent.x;
    const pointerY = this.pupilPointerCurrent.y;

    this.pupilMeshes.forEach((mesh) => {
      const basePosition = this.pupilBasePositions.get(mesh.uuid);
      const metadata = this.pupilMetadata.get(mesh.uuid);
      if (!basePosition) return;

      const sideFactor = metadata?.side === 'left' ? 1 : -1;
      const crossEyeOffset = -pointerX * sideFactor * pupilConfig.crossEyeStrength;
      mesh.position.x =
        basePosition.x +
        (pointerX + crossEyeOffset) * pupilConfig.maxOffsetX;
      mesh.position.y = basePosition.y - pointerY * pupilConfig.maxOffsetY;
    });
  }

  updateBrows() {
    const browConfig = WELCOME_HERO_3D_CONFIG.model.browFollow;
    if (!browConfig?.enabled || this.browMeshes.length === 0) return;

    this.browMeshes.forEach((mesh) => {
      const base = this.browBaseTransforms.get(mesh.uuid);
      if (!base) return;
      const isLeft = mesh.name.endsWith('.L') || mesh.name.endsWith('browL');
      const side = isLeft ? 1 : -1;
      const lookY = this.pointerCurrent.y;
      const lookX = this.pointerCurrent.x;
      const sideLift = -lookX * side * browConfig.maxOffsetSideY;
      mesh.position.y = base.position.y - lookY * browConfig.maxOffsetY;
      mesh.position.y += sideLift;
      mesh.rotation.z = base.rotation.z - lookY * browConfig.maxRotateZ * side;
      mesh.rotation.x = base.rotation.x - lookY * browConfig.maxRotateX;
      mesh.rotation.y = base.rotation.y - lookX * browConfig.maxRotateY * side;
    });
  }

  updateSmile() {
    this.smileCurrent = THREE.MathUtils.lerp(this.smileCurrent, this.smileTarget, 0.32);
    if (!this.smileMesh || this.smileIndices.length === 0 || !Array.isArray(this.smileMesh.morphTargetInfluences)) return;
    this.smileIndices.forEach((index) => {
      this.smileMesh.morphTargetInfluences[index] = this.smileCurrent;
    });
  }
}

function initWelcomeHero3D() {
  const container = document.getElementById('welcome-hero-3d-canvas');
  if (!container) return;
  if (container.dataset.heroInitialized === 'true') return;
  container.dataset.heroInitialized = 'true';
  new WelcomeHero3D(container);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWelcomeHero3D);
} else {
  initWelcomeHero3D();
}
