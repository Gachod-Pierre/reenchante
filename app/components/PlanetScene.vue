<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useGLTF } from "@tresjs/cientos";
import * as THREE from "three";
import { useSceneAnimation } from "../composables/useSceneAnimation";

const { state: gltf } = useGLTF("/models/earth-cartoon.glb");
const canvasRef = ref();

// ✅ Utiliser le composable pour l'animation
const {
  sunOpacity,
  rainbowOpacity,
  cloudsOpacity,
  pingsOpacity,
  startAnimation: startSceneAnimation,
  stopAnimation: stopSceneAnimation,
  getRenderLoopCallback,
  setAnimationFrameId,
} = useSceneAnimation();

const isDragging = ref(false);
const isHoveringPlanet = ref(false);
// ✅ NON-réactive pour éviter re-renders à chaque mousemove
let previousMousePosition = { x: 0, y: 0 };
// ⚠️ IMPORTANT: planetGroupRotation n'est utilisée QUE pour les binding Vue du template
// La vraie rotation est gérée par la variable Three.js "planetGroupThreeObject" ci-dessous
const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1024,
);
const planetGroupRef = ref<THREE.Group | null>(null);
const rainbowArcs = ref<
  Array<{ geometry: THREE.BufferGeometry; color: string }>
>([]);

// ✅ Variable Three.js NON-réactive pour la rotation continue
// Cela évite que Vue re-render le template 60 fois/sec
let planetGroupThreeObject: THREE.Group | null = null;
let planetGroupRotationX = 0;
let planetGroupRotationY = 0;

// ✅ Variables NON-réactives pour la rotation rapide (pas de Vue reactivity overhead)
let pendingDeltaX = 0;
let pendingDeltaY = 0;

// InstancedMesh pour les nuages (optimisation majeure: 200+ meshes → 1 seul)
const cloudInstancedMesh = ref<THREE.InstancedMesh | null>(null);

// ✅ Debug timing NON-réactif (mis à jour 60x/sec, ne doit pas trigger re-render)
const debugTimings = {
  rotationUpdate: 0,
  pingScaleUpdate: 0,
  totalFrame: 0,
  mousemoveEvents: 0,
  lastFrameTime: performance.now(),
};

// ✅ Style statique (pas de computed pour éviter les recalculate style)
const canvasStyle = {
  width: "100%",
  height: "100vh",
  backgroundColor: "#f4f4f4",
  backgroundImage:
    "linear-gradient(rgba(180, 180, 180, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(180, 180, 180, 0.2) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
  userSelect: "none" as const,
  zIndex: 0,
  overflow: "hidden",
};

// Fonction pour créer plusieurs arcs en ciel avec des couleurs distinctes
const createRainbowArcs = (): Array<{
  geometry: THREE.BufferGeometry;
  color: string;
}> => {
  // Disposer les anciennes géométries pour éviter les fuites mémoire
  rainbowArcs.value.forEach((arc) => {
    arc.geometry.dispose();
  });

  const rainbowColors = [
    "#FF0000", // Rouge
    "#FF7F00", // Orange
    "#FFFF00", // Jaune
    "#00FF00", // Vert
    "#0000FF", // Bleu
    "#4B0082", // Indigo
    "#9400D3", // Violet
  ];

  // Paramètres responsifs
  const isMobile = windowWidth.value < 768;
  const arcHeight = isMobile ? 5.5 : 7.5; // Moins haut sur mobile
  const arcWidth = isMobile ? 32 : 48; // Plus étroit sur mobile
  const yStartOffset = isMobile ? -1.5 : -1.5; // Décalé vers le bas sur mobile
  const zPosition = isMobile ? -8 : -8; // Même profondeur

  const arcs = rainbowColors.map((color, index) => {
    const segments = 32; // Réduit de 64 → 32 (low poly)
    const points: THREE.Vector3[] = [];

    // Offset vertical pour chaque arc (espacés de 0.3)
    const yOffset = yStartOffset + index * 0.3;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI;
      const x = (t - 0.5) * arcWidth;
      const y = Math.sin(angle) * arcHeight + yOffset;
      const z = zPosition;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    // Réduit: 64 segments de tube → 32, 8 radials → 4 (low poly tout en gardant couleurs distinctes)
    const tubeGeometry = new THREE.TubeGeometry(curve, 32, 0.3, 4, false);

    return { geometry: tubeGeometry, color };
  });

  return arcs;
};

// ✅ OPTIMISATION: Créer UN InstancedMesh pour tous les nuages (au lieu de 200 TresMesh)
const createCloudInstancedMesh = (clouds: Cloud[]): THREE.InstancedMesh => {
  // Créer une géométrie icosahedron LOW POLY réutilisée (réduit: detail 0 → pratiquement cube)
  const baseGeometry = new THREE.IcosahedronGeometry(1, 0);

  // Matériel unique pour toutes les instances
  const material = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    transparent: true,
  });

  // Créer le InstancedMesh avec autant d'instances que de nuages
  const instancedMesh = new THREE.InstancedMesh(
    baseGeometry,
    material,
    clouds.length,
  );

  // Configurer chaque instance avec sa propre matrice de transformation
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  clouds.forEach((cloud, index) => {
    // Positionner
    position.set(...cloud.position);

    // Rotation
    const euler = new THREE.Euler(...cloud.rotation);
    quaternion.setFromEuler(euler);

    // Échelle
    scale.set(cloud.scale, cloud.scale, cloud.scale);

    // Composer la matrice de transformation
    matrix.compose(position, quaternion, scale);

    // Appliquer à cette instance
    instancedMesh.setMatrixAt(index, matrix);
  });

  // Signaler à Three.js que les matrices ont changé
  instancedMesh.instanceMatrix.needsUpdate = true;

  // ⚠️ Pour l'opacité: utiliser color attribute au lieu de material unique
  // car chaque nuage a une opacité différente
  const opacities = new Float32Array(clouds.length);
  clouds.forEach((cloud, index) => {
    opacities[index] = cloud.opacity;
  });

  baseGeometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));

  // Modifier le material pour utiliser les opacités par instance
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      "uniform mat4 instanceMatrix;",
      `uniform mat4 instanceMatrix;
       attribute float opacity;
       varying float vOpacity;`,
    );
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      `void main() {
         vOpacity = opacity;`,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "uniform float opacity;",
      `uniform float opacity;
       varying float vOpacity;`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
      `gl_FragColor = vec4( outgoingLight, diffuseColor.a * vOpacity );`,
    );
  };

  return instancedMesh;
};

// Interface pour les nuages générés
interface Cloud {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  opacity: number;
}

// Interface pour les pings (actions sur continents)
interface Ping {
  id: string;
  continent: string;
  position: [number, number, number]; // Position sur la surface de la planète
  scale: number; // Scale initiale
  hovered: boolean;
  actionCount: number;
}

// Générateur de nombre pseudo-aléatoire seeded pour reproducibilité
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Génération procédurale des nuages (optimisée avec InstancedMesh)
const generateClouds = (): Cloud[] => {
  const clouds: Cloud[] = [];

  // COUCHE 1: Très loin (Z: -25 à -20)
  const layer1X = [-28, -20, -12, -4, 4, 12, 20, 28];
  for (let i = 0; i < layer1X.length; i++) {
    const baseSeed = i * 1000 + 1;
    const xVariation = seededRandom(baseSeed) * 4 - 2;
    const yVariation = seededRandom(baseSeed + 1) * 1 - 0.5;
    const zVariation = seededRandom(baseSeed + 2) * 2;
    const x = layer1X[i]!;

    clouds.push({
      position: [x + xVariation, -2.5 + yVariation, -24 + zVariation],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.75 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.35 + seededRandom(baseSeed + 7) * 0.1,
    });
  }

  // Ajouter des nuages supplémentaires pour la couche 1
  for (let i = 0; i < 10; i++) {
    const baseSeed = i * 1000 + 2000;
    clouds.push({
      position: [
        seededRandom(baseSeed) * 56 - 28,
        -2.5 + seededRandom(baseSeed + 1) * 1.2,
        -25 + seededRandom(baseSeed + 2) * 3,
      ],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.7 + seededRandom(baseSeed + 6) * 0.25,
      opacity: 0.32 + seededRandom(baseSeed + 7) * 0.12,
    });
  }

  // Ajouter plus de nuages à gauche pour la couche 1
  for (let i = 0; i < 6; i++) {
    const baseSeed = i * 1000 + 2100;
    clouds.push({
      position: [
        seededRandom(baseSeed) * 20 - 35,
        -2.5 + seededRandom(baseSeed + 1) * 1.2,
        -25 + seededRandom(baseSeed + 2) * 3,
      ],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.75 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.33 + seededRandom(baseSeed + 7) * 0.1,
    });
  }

  // COUCHE 2: Très loin (Z: -18 à -14)
  const layer2X = [-30, -22, -14, -6, 2, 10, 18, 26];
  for (let i = 0; i < layer2X.length; i++) {
    const baseSeed = i * 1000 + 3000;
    const xVariation = seededRandom(baseSeed) * 4 - 2;
    const yVariation = seededRandom(baseSeed + 1) * 1 - 0.5;
    const zVariation = seededRandom(baseSeed + 2) * 1.5;
    const x = layer2X[i]!;

    clouds.push({
      position: [x + xVariation, -2.6 + yVariation, -18 + zVariation],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.8 + seededRandom(baseSeed + 6) * 0.22,
      opacity: 0.45 + seededRandom(baseSeed + 7) * 0.12,
    });
  }

  // Ajouter des nuages supplémentaires pour la couche 2
  for (let i = 0; i < 12; i++) {
    const baseSeed = i * 1000 + 4000;
    clouds.push({
      position: [
        seededRandom(baseSeed) * 60 - 30,
        -2.7 + seededRandom(baseSeed + 1) * 1.2,
        -18 + seededRandom(baseSeed + 2) * 2.5,
      ],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.75 + seededRandom(baseSeed + 6) * 0.25,
      opacity: 0.43 + seededRandom(baseSeed + 7) * 0.12,
    });
  }

  // Ajouter plus de nuages à gauche pour la couche 2
  for (let i = 0; i < 6; i++) {
    const baseSeed = i * 1000 + 4100;
    clouds.push({
      position: [
        seededRandom(baseSeed) * 20 - 35,
        -2.7 + seededRandom(baseSeed + 1) * 1.2,
        -18 + seededRandom(baseSeed + 2) * 2.5,
      ],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.8 + seededRandom(baseSeed + 6) * 0.22,
      opacity: 0.44 + seededRandom(baseSeed + 7) * 0.1,
    });
  }

  // COUCHE 3: Loin (Z: -10 à -5)
  const layer3X = [-28, -18, -8, 2, 12, 22];
  for (let i = 0; i < layer3X.length; i++) {
    const baseSeed = i * 1000 + 5000;
    const xVariation = seededRandom(baseSeed) * 5 - 2.5;
    const yVariation = seededRandom(baseSeed + 1) * 1 - 0.5;
    const zVariation = seededRandom(baseSeed + 2) * 1.5;
    const x = layer3X[i]!;

    clouds.push({
      position: [x + xVariation, -2.5 + yVariation, -10 + zVariation],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.9 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.58 + seededRandom(baseSeed + 7) * 0.12,
    });
  }

  // Ajouter des nuages supplémentaires pour la couche 3
  for (let i = 0; i < 14; i++) {
    const baseSeed = i * 1000 + 6000;
    clouds.push({
      position: [
        seededRandom(baseSeed) * 56 - 28,
        -2.8 + seededRandom(baseSeed + 1) * 1.2,
        -10 + seededRandom(baseSeed + 2) * 3,
      ],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.85 + seededRandom(baseSeed + 6) * 0.25,
      opacity: 0.56 + seededRandom(baseSeed + 7) * 0.14,
    });
  }

  // Ajouter plus de nuages à gauche pour la couche 3
  for (let i = 0; i < 7; i++) {
    const baseSeed = i * 1000 + 6100;
    clouds.push({
      position: [
        seededRandom(baseSeed) * 20 - 35,
        -2.8 + seededRandom(baseSeed + 1) * 1.2,
        -10 + seededRandom(baseSeed + 2) * 3,
      ],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.9 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.55 + seededRandom(baseSeed + 7) * 0.13,
    });
  }

  // COUCHE 4: Moyen (Z: -3 à 1)
  const layer4X = [-30, -20, -10, 0, 10, 20, 30];
  for (let i = 0; i < layer4X.length; i++) {
    const baseSeed = i * 1000 + 7000;
    const xVariation = seededRandom(baseSeed) * 5 - 2.5;
    const yVariation = seededRandom(baseSeed + 1) * 1 - 0.5;
    const zVariation = seededRandom(baseSeed + 2) * 1.5;
    const x = layer4X[i]!;

    clouds.push({
      position: [x + xVariation, -2.5 + yVariation, -3 + zVariation],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 2.0 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.72 + seededRandom(baseSeed + 7) * 0.12,
    });
  }

  // Ajouter des nuages supplémentaires pour la couche 4
  for (let i = 0; i < 15; i++) {
    const baseSeed = i * 1000 + 8000;
    clouds.push({
      position: [
        seededRandom(baseSeed) * 60 - 30,
        -2.7 + seededRandom(baseSeed + 1) * 1.2,
        -2.5 + seededRandom(baseSeed + 2) * 2,
      ],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.85 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.7 + seededRandom(baseSeed + 7) * 0.14,
    });
  }

  // Ajouter plus de nuages à gauche pour la couche 4
  for (let i = 0; i < 7; i++) {
    const baseSeed = i * 1000 + 8100;
    clouds.push({
      position: [
        seededRandom(baseSeed) * 20 - 35,
        -2.7 + seededRandom(baseSeed + 1) * 1.2,
        -2.5 + seededRandom(baseSeed + 2) * 2,
      ],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.9 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.71 + seededRandom(baseSeed + 7) * 0.13,
    });
  }

  // COUCHE 5: Avant (Z: 1 à 3)
  const layer5X = [-32, -22, -12, -2, 8, 18, 28];
  for (let i = 0; i < layer5X.length; i++) {
    const baseSeed = i * 1000 + 9000;
    const xVariation = seededRandom(baseSeed) * 5 - 2.5;
    const yVariation = seededRandom(baseSeed + 1) * 1 - 0.5;
    const zVariation = seededRandom(baseSeed + 2) * 1;
    const x = layer5X[i]!;

    clouds.push({
      position: [x + xVariation, -2.5 + yVariation, 1.5 + zVariation],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 2.1 + seededRandom(baseSeed + 6) * 0.18,
      opacity: 0.72 + seededRandom(baseSeed + 7) * 0.1,
    });
  }

  // Ajouter des nuages supplémentaires pour la couche 5
  for (let i = 0; i < 8; i++) {
    const baseSeed = i * 1000 + 10000;
    clouds.push({
      position: [
        seededRandom(baseSeed) * 64 - 32,
        -2.7 + seededRandom(baseSeed + 1) * 1.2,
        0.8 + seededRandom(baseSeed + 2) * 1.5,
      ],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.95 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.6 + seededRandom(baseSeed + 7) * 0.1,
    });
  }

  // COUCHE 6: Fine couche opaque devant la planète (Z: 4 à 6)
  const layer6X = [-35, -20, -5, 10, 25];
  for (let i = 0; i < layer6X.length; i++) {
    const baseSeed = i * 1000 + 11000;
    const xVariation = seededRandom(baseSeed) * 6 - 3;
    const yVariation = seededRandom(baseSeed + 1) * 1.5 - 0.75;
    const zVariation = seededRandom(baseSeed + 2) * 1;
    const x = layer6X[i]!;

    clouds.push({
      position: [x + xVariation, -2.2 + yVariation, 4.5 + zVariation],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 2.1 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.98 + seededRandom(baseSeed + 7) * 0.02,
    });
  }

  // Ajouter des nuages supplémentaires pour la couche 6 (fine couche)
  for (let i = 0; i < 14; i++) {
    const baseSeed = i * 1000 + 12000;
    clouds.push({
      position: [
        seededRandom(baseSeed) * 70 - 35,
        -2.5 + seededRandom(baseSeed + 1) * 1.2,
        4.2 + seededRandom(baseSeed + 2) * 1.5,
      ],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 2.0 + seededRandom(baseSeed + 6) * 0.25,
      opacity: 0.96 + seededRandom(baseSeed + 7) * 0.04,
    });
  }

  return clouds;
};

// Génération des pings sur les continents
const generatePings = (scale: number = 5): Ping[] => {
  const pings: Ping[] = [];

  // Pings positionnés sur les continents réels
  const pingData = [
    {
      id: "europe",
      continent: "Europe",
      lat: 26.6,
      lng: 3.74,
      actions: 8,
    },
    {
      id: "afrique",
      continent: "Afrique",
      lat: -5.25,
      lng: -8.97,
      actions: 8,
    },
    {
      id: "asie",
      continent: "Asie",
      lat: 14.46,
      lng: -75.45,
      actions: 8,
    },
    {
      id: "océanie",
      continent: "Océanie",
      lat: -31.64,
      lng: -115.83,
      actions: 8,
    },
    {
      id: "antarctique",
      continent: "Antarctique",
      lat: -87.69,
      lng: 170.99,
      actions: 8,
    },
    {
      id: "amérique-nord",
      continent: "Amérique du Nord",
      lat: 23.48,
      lng: 108.29,
      actions: 8,
    },
    {
      id: "amérique-sud",
      continent: "Amérique du Sud",
      lat: -27.56,
      lng: 73.21,
      actions: 8,
    },
  ];

  pingData.forEach((data) => {
    // Convertir lat/lng en coordonnées cartésiennes
    // Le radius s'adapte au scale de la planète (3 sur mobile, 5 sur desktop)
    const radius = 5.2 * (scale / 5);
    const latRad = (data.lat * Math.PI) / 180;
    const lngRad = (data.lng * Math.PI) / 180;

    const x = radius * Math.cos(latRad) * Math.cos(lngRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.sin(lngRad);

    pings.push({
      id: data.id,
      continent: data.continent,
      position: [x, y, z],
      scale: 0.6,
      hovered: false,
      actionCount: data.actions,
    });
  });

  return pings;
};

const clouds = ref<Cloud[]>(generateClouds());

// Déterminer le scale initial et générer les pings
const initialScale = windowWidth.value < 768 ? 3 : 5;
const pings = ref<Ping[]>(generatePings(initialScale));

// Recalculer les pings quand la taille de la fenêtre change
watch(windowWidth, (newWidth) => {
  const newScale = newWidth < 768 ? 3 : 5;
  pings.value = generatePings(newScale);
});

// Valeurs responsives
const planetScale = computed((): [number, number, number] => {
  return windowWidth.value < 768 ? [3, 3, 3] : [5, 5, 5];
});

const sunPosition = computed((): [number, number, number] => {
  // Sur mobile: descendre le soleil (Y=1), sur desktop: le garder plus haut (Y=3)
  return windowWidth.value < 768 ? [5, 1, -15] : [5, 3, -15];
});

const hoverRadius = computed(() => {
  return windowWidth.value < 768 ? 400 : 500;
});

// ✅ Autres variables nécessaires pour le rendering
let camera: THREE.PerspectiveCamera | THREE.Camera | null = null;
let _raycaster: THREE.Raycaster | null = null;
let lastHoveringPlanetState = false;
const pingMeshRefs = new Map<string, THREE.Mesh>();
let cachedCanvasRect: DOMRect | null = null;
let lastMouseMoveTime = 0;
const MOUSE_THROTTLE_MS = 16;
const animationStarted = ref(false);

// ✅ Fonction pour démarrer l'animation avec la boucle de rotation
const startAnimationLoop = () => {
  if (animationStarted.value) return;
  animationStarted.value = true;

  // ✅ Utiliser le composable pour initialiser l'animation
  startSceneAnimation(gltf.value, (_elapsedTime, _progress) => {
    // Callback de la boucle d'animation - gère la rotation et autres updates

    // TIMING 1: Rotation update - DIRECTEMENT sur le Three.js object, pas de Vue reactivity!
    const rotStart = performance.now();

    // Rotation continue de la planète
    planetGroupRotationY += 0.0005;

    // ✅ Appliquer les deltas accumulés depuis les mousemove events
    planetGroupRotationY += pendingDeltaX * 0.0015;
    planetGroupRotationX += pendingDeltaY * 0.0015;

    // Décroissance progressive (inertie)
    pendingDeltaX *= 0.95;
    pendingDeltaY *= 0.95;

    // ✅ Mettre à jour directement le Three.js object
    if (planetGroupThreeObject) {
      planetGroupThreeObject.rotation.x = planetGroupRotationX;
      planetGroupThreeObject.rotation.y = planetGroupRotationY;
    }
    debugTimings.rotationUpdate = performance.now() - rotStart;
  });

  // Lancer la boucle d'animation
  const animate = () => {
    const callback = getRenderLoopCallback();
    callback?.();
    setAnimationFrameId(requestAnimationFrame(animate));
  };

  setAnimationFrameId(requestAnimationFrame(animate));
};

const handleMouseDown = (e: MouseEvent) => {
  // Rotation de la planète
  if (!isHoveringPlanet.value) return;

  isDragging.value = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
};

const handleMouseMove = (e: MouseEvent) => {
  debugTimings.mousemoveEvents += 1;

  // THROTTLE: Limiter à ~60fps
  const now = Date.now();
  if (now - lastMouseMoveTime < MOUSE_THROTTLE_MS) {
    return;
  }
  lastMouseMoveTime = now;

  // TIMING: Distance calculation pour hover detection
  const distStart = performance.now();

  // Utiliser offsetX/Y (rapide) ou fallback au cache
  const pointerEvent = e as
    | PointerEvent
    | (MouseEvent & { offsetX?: number; offsetY?: number });
  const mouseX = pointerEvent.offsetX ?? e.clientX;
  const mouseY = pointerEvent.offsetY ?? e.clientY;

  if (!cachedCanvasRect && !pointerEvent.offsetX) {
    const rect = canvasRef.value?.getBoundingClientRect();
    if (rect) {
      cachedCanvasRect = rect;
    }
  }

  if (!cachedCanvasRect && !pointerEvent.offsetX) return;

  // Calcul de la distance depuis le centre du canvas
  const centerX = cachedCanvasRect
    ? cachedCanvasRect.width / 2
    : window.innerWidth / 2;
  const centerY = cachedCanvasRect
    ? cachedCanvasRect.height * 0.95
    : window.innerHeight * 0.95;

  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const distanceSquared = dx * dx + dy * dy;
  const hoverRadiusSquared = hoverRadius.value * hoverRadius.value;

  // ✅ NE mettre à jour Vue reactivity que si l'état CHANGE
  const newHoveringState = distanceSquared < hoverRadiusSquared;
  if (newHoveringState !== lastHoveringPlanetState) {
    isHoveringPlanet.value = newHoveringState;
    lastHoveringPlanetState = newHoveringState;
  }

  // ✅ IMPORTANT: Si on n'est pas en train de drag, ne rien faire
  if (!isDragging.value) return;

  // Calculs pour la rotation (seulement si en drag)
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;

  // ✅ JUSTE STOCKER les deltas - les appliquer dans le render loop
  // Cela découple complètement le mousemove du rendering
  pendingDeltaX = deltaX;
  pendingDeltaY = deltaY;

  previousMousePosition = { x: e.clientX, y: e.clientY };

  const distTime = performance.now() - distStart;
  if (distTime > 2) {
    console.warn(`[Mousemove] Distance calc: ${distTime.toFixed(2)}ms`);
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handlePingHover = (pingId: string, isHovering: boolean) => {
  // ✅ Mettre à jour DIRECTEMENT le Three.js material sans passer par Vue reactivity
  // Cela évite un re-render du template et donc le lag!
  const mesh = pingMeshRefs.get(pingId);
  if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.emissiveIntensity = isHovering ? 1.2 : 0.4;
  }

  // Ne PAS mettre à jour hoveredPingId.value pour éviter le re-render Vue!
  // Le hover visuel est géré directement par le material ci-dessus
};

const handlePingClick = (pingId: string) => {
  const ping = pings.value.find((p) => p.id === pingId);
  if (ping) {
    console.log(
      `Clicked on ${ping.continent} ping with ${ping.actionCount} actions`,
    );
    // TODO: Afficher l'overlay avec les actions du continent
  }
};

onMounted(async () => {
  // Attacher les listeners au div conteneur qui existe immédiatement
  const container = canvasRef.value;
  if (container) {
    // passive: true = le navigateur ne doit pas attendre la callback pour scroller
    container.addEventListener("mousedown", handleMouseDown, { passive: true });
    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseup", handleMouseUp, { passive: true });
    container.addEventListener("mouseleave", handleMouseUp, { passive: true });

    // Support tactile pour mobile
    container.addEventListener(
      "touchstart",
      (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const touch = e.touches?.[0];
          if (touch) {
            handleMouseDown({
              clientX: touch.clientX,
              clientY: touch.clientY,
            } as MouseEvent);
          }
        }
      },
      { passive: true },
    );
    container.addEventListener(
      "touchmove",
      (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const touch = e.touches?.[0];
          if (touch) {
            handleMouseMove({
              clientX: touch.clientX,
              clientY: touch.clientY,
            } as MouseEvent);
          }
        }
      },
      { passive: true },
    );
    container.addEventListener("touchend", handleMouseUp, { passive: true });
  }

  // Initialiser le raycaster
  _raycaster = new THREE.Raycaster();

  // Pré-cacher le rect du canvas (une seule fois au setup)
  const canvas = canvasRef.value?.querySelector("canvas");
  if (canvas) {
    cachedCanvasRect = canvasRef.value?.getBoundingClientRect() || null;
  }

  // Créer une caméra pour le raycasting avec les mêmes paramètres que le template
  if (canvas) {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 10);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.updateProjectionMatrix();
    }
  }

  // Écouter les changements de taille de la fenêtre
  const handleResize = () => {
    windowWidth.value = window.innerWidth;
    // Mettre à jour le cache rect au resize
    cachedCanvasRect = canvasRef.value?.getBoundingClientRect() || null;
  };

  window.addEventListener("resize", handleResize);

  // Créer les arcs en ciel
  rainbowArcs.value = createRainbowArcs();

  // ✅ Créer le InstancedMesh pour les nuages (optimisation majeure)
  cloudInstancedMesh.value = createCloudInstancedMesh(clouds.value);

  // ✅ Watch pour capturer la référence Three.js du planetGroup
  watch(
    () => planetGroupRef.value,
    (group) => {
      if (group) {
        planetGroupThreeObject = group;
      }
    },
    { immediate: true },
  );

  // Recréer les arcs quand la fenêtre change de taille
  watch(windowWidth, () => {
    rainbowArcs.value = createRainbowArcs();
  });

  // Watch pour démarrer l'animation dès que le GLB se charge
  watch(
    () => gltf.value?.scene,
    (scene) => {
      if (scene && !animationStarted.value) {
        startAnimationLoop();
      }
    },
    { immediate: true, deep: true },
  );

  // Cleanup au démount
  return () => {
    window.removeEventListener("resize", handleResize);
  };
});

watch(
  () => gltf.value,
  () => {
    // Watching for gltf value changes
  },
  { deep: true },
);

onUnmounted(() => {
  // Arrêter l'animation
  stopSceneAnimation();

  // Disposer les géométries des arcs
  rainbowArcs.value.forEach((arc) => {
    arc.geometry.dispose();
  });

  // ✅ Disposer le InstancedMesh et ses ressources
  if (cloudInstancedMesh.value) {
    cloudInstancedMesh.value.geometry.dispose();
    (cloudInstancedMesh.value.material as THREE.Material).dispose();
    cloudInstancedMesh.value = null;
  }

  const container = canvasRef.value;
  if (container) {
    container.removeEventListener("mousedown", handleMouseDown);
    container.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("mouseup", handleMouseUp);
    container.removeEventListener("mouseleave", handleMouseUp);
  }

  // Nettoyer les refs
  pingMeshRefs.clear();
  cachedCanvasRect = null;
});
</script>

<template>
  <div
    ref="canvasRef"
    :style="[canvasStyle, { cursor: isHoveringPlanet ? 'grab' : 'default' }]"
  >
    <!-- Titre en haut à gauche -->
    <h1
      class="fixed left-5 md:left-8 lg:left-10 z-50 m-0 text-[3rem] md:text-[4.5rem] lg:text-[6rem] font-black top-24 md:top-8 lg:top-10 bg-clip-text text-transparent"
      :style="{
        backgroundImage:
          'linear-gradient(90deg, #FF69B4, #FF1493, #C71585, #D94C8A, #FF1493, #FF69B4)',
        opacity: sunOpacity,
        transition: 'opacity 0.3s ease-out',
      }"
    >
      Réenchante<br />le Monde
    </h1>

    <TresCanvas
      ref="canvasThreeRef"
      alpha
      :clear-alpha="0"
      clear-color="#000000"
      antialias
    >
      <TresPerspectiveCamera
        ref="cameraRef"
        :position="[0, 2, 10]"
        :fov="50"
        @update="
          (c: any) => {
            camera = c;
          }
        "
      />
      <TresAmbientLight :intensity="2" />
      <TresDirectionalLight :position="[10, 10, 10]" :intensity="2" />

      <!-- Soleil en arrière-plan -->
      <TresMesh :position="sunPosition" :scale="[4, 4, 4]">
        <TresSphereGeometry :args="[1, 32, 32]" />
        <TresMeshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          :emissive-intensity="3 * sunOpacity"
          :tone-mapped="false"
          transparent
          :opacity="sunOpacity"
        />
      </TresMesh>

      <!-- Halo de brillance du soleil -->
      <TresMesh
        :position="sunPosition"
        :scale="[4.5, 4.5, 4.5]"
        :render-order="10"
      >
        <TresSphereGeometry :args="[1, 16, 16]" />
        <TresMeshBasicMaterial
          color="#ffff00"
          transparent
          :opacity="0.8 * sunOpacity"
          :depth-write="false"
          :depth-test="true"
        />
      </TresMesh>

      <!-- Arcs en ciel multiples avec couleurs distinctes -->
      <template
        v-for="(arc, index) in rainbowArcs"
        :key="`rainbow-arc-${index}`"
      >
        <TresMesh :position="[0, 0, 0]">
          <primitive :object="arc.geometry" />
          <TresMeshStandardMaterial
            :color="arc.color"
            emissive="#ffffff"
            :emissive-intensity="0.3 * rainbowOpacity"
            transparent
            :opacity="rainbowOpacity"
          />
        </TresMesh>
      </template>

      <!-- ✅ OPTIMISATION: InstancedMesh unique pour tous les nuages (200+ meshes → 1) -->
      <!-- Nuages générés procéduralement -->
      <template v-for="(cloud, index) in clouds" :key="`cloud-${index}`">
        <TresMesh :position="cloud.position" :rotation="cloud.rotation">
          <TresIcosahedronGeometry :args="[cloud.scale, 0]" />
          <TresMeshStandardMaterial
            color="#ffffff"
            transparent
            :opacity="cloud.opacity * cloudsOpacity"
          />
        </TresMesh>
      </template>

      <!-- Groupe contenant la planète et les pings (pour la rotation commune) -->
      <TresGroup ref="planetGroupRef" :position="[0, -2, 0]">
        <!-- Planète GLB (position relative au groupe qui est à [0, -2, 0]) -->
        <Suspense v-if="gltf?.scene">
          <primitive
            :object="gltf?.scene"
            :scale="planetScale"
            :position="[0, 0, 0]"
            @pointerenter="isHoveringPlanet = true"
            @pointerleave="isHoveringPlanet = false"
          />
        </Suspense>

        <!-- Pings rouges accrochés à la planète -->
        <template v-for="ping in pings" :key="`ping-group-${ping.id}`">
          <TresMesh
            :ref="
              (el: any) => {
                if (el instanceof THREE.Mesh) {
                  pingMeshRefs.set(ping.id, el);
                }
              }
            "
            :position="ping.position"
            :scale="[ping.scale, ping.scale, ping.scale]"
            @pointerenter="handlePingHover(ping.id, true)"
            @pointerleave="handlePingHover(ping.id, false)"
            @click="handlePingClick(ping.id)"
          >
            <TresSphereGeometry :args="[1, 16, 16]" />
            <TresMeshStandardMaterial
              color="#ff69b4"
              emissive="#ff1493"
              :emissive-intensity="0.4 * pingsOpacity"
              transparent
              :opacity="pingsOpacity"
            />
          </TresMesh>
        </template>
      </TresGroup>
    </TresCanvas>
  </div>
</template>
