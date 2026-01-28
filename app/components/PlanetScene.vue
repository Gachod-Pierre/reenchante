<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useGLTF } from "@tresjs/cientos";
import * as THREE from "three";

const { state: gltf } = useGLTF("/models/earth-cartoon.glb");
const canvasRef = ref();
let animationId: number;
const animationStarted = ref(false);
let camera: THREE.PerspectiveCamera | THREE.Camera | null = null;
let _raycaster: THREE.Raycaster | null = null;

const isDragging = ref(false);
const isHoveringPlanet = ref(false);
const previousMousePosition = ref({ x: 0, y: 0 });
const rotationDelta = ref({ x: 0, y: 0 });
const planetGroupRotation = ref({ x: 0, y: 0 });
const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1024,
);
const hoveredPingId = ref<string | null>(null);
const planetGroupRef = ref<THREE.Group | null>(null);
const rainbowArcs = ref<
  Array<{ geometry: THREE.BufferGeometry; color: string }>
>([]);

// Computed style pour le canvas - évite les hydration mismatches
const canvasStyle = computed(() => ({
  width: "100%",
  height: "100vh",
  backgroundColor: "#f4f4f4",
  backgroundImage:
    "linear-gradient(rgba(180, 180, 180, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(180, 180, 180, 0.2) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
  userSelect: "none" as const,
  zIndex: 0,
  overflow: "hidden",
  cursor: isHoveringPlanet.value ? "grab" : "default",
}));

// Fonction pour créer plusieurs arcs en ciel avec des couleurs distinctes
const createRainbowArcs = (): Array<{
  geometry: THREE.BufferGeometry;
  color: string;
}> => {
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
    const segments = 64;
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
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.3, 8, false);

    return { geometry: tubeGeometry, color };
  });

  return arcs;
};

// Interface pour les nuages générés
interface Cloud {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  opacity: number;
  geometry: "icosahedron" | "dodecahedron" | "octahedron";
}

// Interface pour les pings (actions sur continents)
interface Ping {
  id: string;
  continent: string;
  position: [number, number, number]; // Position sur la surface de la planète
  scale: number;
  currentScale: number; // Scale courante interpolée
  hovered: boolean;
  actionCount: number;
}

// Générateur de nombre pseudo-aléatoire seeded pour reproducibilité
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Génération procédurale des nuages
const generateClouds = (): Cloud[] => {
  const clouds: Cloud[] = [];
  const geometries: Array<"icosahedron" | "dodecahedron" | "octahedron"> = [
    "icosahedron",
    "dodecahedron",
    "octahedron",
  ];

  const getGeometry = (
    seed: number,
  ): "icosahedron" | "dodecahedron" | "octahedron" => {
    return geometries[seed % geometries.length]!;
  };

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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      geometry: getGeometry(baseSeed),
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
      currentScale: 0.6,
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

const startAnimation = () => {
  if (animationStarted.value || !gltf.value?.scene) return;
  animationStarted.value = true;

  const animate = () => {
    // Mettre à jour la rotation du groupe (planète + pings)
    planetGroupRotation.value.y += 0.0005;
    planetGroupRotation.value.y += rotationDelta.value.y;
    planetGroupRotation.value.x += rotationDelta.value.x;
    rotationDelta.value.x *= 0.95;
    rotationDelta.value.y *= 0.95;

    // Interpoler progressivement la scale des pings
    pings.value.forEach((ping) => {
      const targetScale = hoveredPingId.value === ping.id ? 0.95 : 0.6;
      ping.currentScale += (targetScale - ping.currentScale) * 0.12; // Interpolation linéaire
    });

    animationId = requestAnimationFrame(animate);
  };
  animate();
};

const handleMouseDown = (e: MouseEvent) => {
  // Rotation de la planète
  if (!isHoveringPlanet.value) return;

  isDragging.value = true;
  previousMousePosition.value = { x: e.clientX, y: e.clientY };
};

const handleMouseMove = (e: MouseEvent) => {
  // ANCIEN CODE - Détection circulaire simple (fonctionne bien)
  const rect = canvasRef.value?.getBoundingClientRect();
  if (rect) {
    const centerX = rect.width / 2;
    const centerY = rect.height * 0.95;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const distanceFromCenter = Math.sqrt(
      Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2),
    );
    isHoveringPlanet.value = distanceFromCenter < hoverRadius.value;
  }

  if (!isDragging.value || !isHoveringPlanet.value) return;

  const deltaX = e.clientX - previousMousePosition.value.x;
  const deltaY = e.clientY - previousMousePosition.value.y;

  rotationDelta.value.y += deltaX * 0.0015;
  rotationDelta.value.x += deltaY * 0.0015;

  previousMousePosition.value = { x: e.clientX, y: e.clientY };
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handlePingHover = (pingId: string, isHovering: boolean) => {
  if (isHovering) {
    hoveredPingId.value = pingId;
  } else if (hoveredPingId.value === pingId) {
    hoveredPingId.value = null;
  }
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

onMounted(() => {
  // Attacher les listeners au div conteneur qui existe immédiatement
  const container = canvasRef.value;
  if (container) {
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseleave", handleMouseUp);

    // Support tactile pour mobile
    container.addEventListener("touchstart", (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches?.[0];
        if (touch) {
          handleMouseDown({
            clientX: touch.clientX,
            clientY: touch.clientY,
          } as MouseEvent);
        }
      }
    });
    container.addEventListener("touchmove", (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches?.[0];
        if (touch) {
          handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY,
          } as MouseEvent);
        }
      }
    });
    container.addEventListener("touchend", handleMouseUp);
  }

  // Initialiser le raycaster
  _raycaster = new THREE.Raycaster();

  // Créer une caméra pour le raycasting avec les mêmes paramètres que le template
  const canvas = canvasRef.value?.querySelector("canvas");
  if (canvas) {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 10);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.updateProjectionMatrix();
    }
    console.log("Raycaster camera initialized");
  }

  // Écouter les changements de taille de la fenêtre
  window.addEventListener("resize", () => {
    windowWidth.value = window.innerWidth;
  });

  // Créer les arcs en ciel
  rainbowArcs.value = createRainbowArcs();

  // Recréer les arcs quand la fenêtre change de taille
  watch(windowWidth, () => {
    rainbowArcs.value = createRainbowArcs();
  });

  // Watch pour démarrer l'animation dès que le GLB se charge
  watch(
    () => gltf.value?.scene,
    (scene) => {
      if (scene && !animationStarted.value) {
        startAnimation();
      }
    },
    { immediate: true, deep: true },
  );
});

watch(
  () => gltf.value,
  () => {
    // Watching for gltf value changes
  },
  { deep: true },
);

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  const container = canvasRef.value;
  if (container) {
    container.removeEventListener("mousedown", handleMouseDown);
    container.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("mouseup", handleMouseUp);
    container.removeEventListener("mouseleave", handleMouseUp);
  }
});
</script>

<template>
  <div ref="canvasRef" :style="canvasStyle">
    <!-- Titre en haut à gauche -->
    <h1
      class="fixed left-5 md:left-8 lg:left-10 z-50 m-0 text-[3rem] md:text-[4.5rem] lg:text-[6rem] font-black top-24 md:top-8 lg:top-10 bg-clip-text text-transparent"
      :style="{
        backgroundImage:
          'linear-gradient(90deg, #FF69B4, #FF1493, #C71585, #D94C8A, #FF1493, #FF69B4)',
      }"
    >
      Réenchante <br />
      le Monde
    </h1>

    <TresCanvas alpha :clear-alpha="0" clear-color="#000000" antialias>
      <TresPerspectiveCamera
        ref="cameraRef"
        :position="[0, 2, 10]"
        :fov="50"
        @update="(c: any) => (camera = c)"
      />
      <TresAmbientLight :intensity="2" />
      <TresDirectionalLight :position="[10, 10, 10]" :intensity="2" />

      <!-- Soleil en arrière-plan -->
      <TresMesh :position="sunPosition" :scale="[4, 4, 4]">
        <TresSphereGeometry :args="[1, 64, 64]" />
        <TresMeshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          :emissive-intensity="3"
          :tone-mapped="false"
        />
      </TresMesh>

      <!-- Halo de brillance du soleil -->
      <TresMesh
        :position="sunPosition"
        :scale="[4.5, 4.5, 4.5]"
        :render-order="10"
      >
        <TresSphereGeometry :args="[1, 32, 32]" />
        <TresMeshBasicMaterial
          color="#ffff00"
          transparent
          :opacity="0.8"
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
            :emissive-intensity="0.3"
          />
        </TresMesh>
      </template>

      <!-- Nuages générés procéduralement -->
      <template v-for="(cloud, index) in clouds" :key="`cloud-${index}`">
        <TresMesh :position="cloud.position" :rotation="cloud.rotation">
          <!-- Icosahedron -->
          <template v-if="cloud.geometry === 'icosahedron'">
            <TresIcosahedronGeometry :args="[cloud.scale, 0]" />
          </template>
          <!-- Dodecahedron -->
          <template v-else-if="cloud.geometry === 'dodecahedron'">
            <TresDodecahedronGeometry :args="[cloud.scale]" />
          </template>
          <!-- Octahedron -->
          <template v-else-if="cloud.geometry === 'octahedron'">
            <TresOctahedronGeometry :args="[cloud.scale, 0]" />
          </template>

          <TresMeshStandardMaterial
            color="#ffffff"
            transparent
            :opacity="cloud.opacity"
          />
        </TresMesh>
      </template>

      <!-- Groupe contenant la planète et les pings (pour la rotation commune) -->
      <TresGroup
        ref="planetGroupRef"
        :position="[0, -2, 0]"
        :rotation="[planetGroupRotation.x, planetGroupRotation.y, 0]"
      >
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
            :position="ping.position"
            :scale="[ping.currentScale, ping.currentScale, ping.currentScale]"
            @pointerenter="handlePingHover(ping.id, true)"
            @pointerleave="handlePingHover(ping.id, false)"
            @click="handlePingClick(ping.id)"
          >
            <TresSphereGeometry :args="[1, 32, 32]" />
            <TresMeshStandardMaterial
              color="#ff69b4"
              emissive="#ff1493"
              :emissive-intensity="hoveredPingId === ping.id ? 1.2 : 0.4"
            />
          </TresMesh>
        </template>
      </TresGroup>
    </TresCanvas>
  </div>
</template>
