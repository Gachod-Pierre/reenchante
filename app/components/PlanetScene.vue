<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useGLTF } from "@tresjs/cientos";

const { state: gltf } = useGLTF("/models/earth-cartoon.glb");
const canvasRef = ref();
let animationId: number;
const animationStarted = ref(false);

const isDragging = ref(false);
const isHoveringPlanet = ref(false);
const previousMousePosition = ref({ x: 0, y: 0 });
const rotationDelta = ref({ x: 0, y: 0 });
const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1024,
);

// Interface pour les nuages générés
interface Cloud {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  opacity: number;
  geometry: "icosahedron" | "dodecahedron" | "octahedron";
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

  // COUCHE 1: Très loin (Z: -25 à -20)
  const layer1X = [-28, -20, -12, -4, 4, 12, 20, 28];
  for (let i = 0; i < layer1X.length; i++) {
    const baseSeed = i * 1000 + 1;
    const xVariation = seededRandom(baseSeed) * 4 - 2;
    const yVariation = seededRandom(baseSeed + 1) * 1 - 0.5;
    const zVariation = seededRandom(baseSeed + 2) * 2;

    clouds.push({
      position: [layer1X[i] + xVariation, -2.5 + yVariation, -24 + zVariation],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.75 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.35 + seededRandom(baseSeed + 7) * 0.1,
      geometry: geometries[baseSeed % 3],
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
      geometry: geometries[baseSeed % 3],
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
      geometry: geometries[baseSeed % 3],
    });
  }

  // COUCHE 2: Très loin (Z: -18 à -14)
  const layer2X = [-30, -22, -14, -6, 2, 10, 18, 26];
  for (let i = 0; i < layer2X.length; i++) {
    const baseSeed = i * 1000 + 3000;
    const xVariation = seededRandom(baseSeed) * 4 - 2;
    const yVariation = seededRandom(baseSeed + 1) * 1 - 0.5;
    const zVariation = seededRandom(baseSeed + 2) * 1.5;

    clouds.push({
      position: [layer2X[i] + xVariation, -2.6 + yVariation, -18 + zVariation],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.8 + seededRandom(baseSeed + 6) * 0.22,
      opacity: 0.45 + seededRandom(baseSeed + 7) * 0.12,
      geometry: geometries[baseSeed % 3],
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
      geometry: geometries[baseSeed % 3],
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
      geometry: geometries[baseSeed % 3],
    });
  }

  // COUCHE 3: Loin (Z: -10 à -5)
  const layer3X = [-28, -18, -8, 2, 12, 22];
  for (let i = 0; i < layer3X.length; i++) {
    const baseSeed = i * 1000 + 5000;
    const xVariation = seededRandom(baseSeed) * 5 - 2.5;
    const yVariation = seededRandom(baseSeed + 1) * 1 - 0.5;
    const zVariation = seededRandom(baseSeed + 2) * 1.5;

    clouds.push({
      position: [layer3X[i] + xVariation, -2.5 + yVariation, -10 + zVariation],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 1.9 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.58 + seededRandom(baseSeed + 7) * 0.12,
      geometry: geometries[baseSeed % 3],
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
      geometry: geometries[baseSeed % 3],
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
      geometry: geometries[baseSeed % 3],
    });
  }

  // COUCHE 4: Moyen (Z: -3 à 1)
  const layer4X = [-30, -20, -10, 0, 10, 20, 30];
  for (let i = 0; i < layer4X.length; i++) {
    const baseSeed = i * 1000 + 7000;
    const xVariation = seededRandom(baseSeed) * 5 - 2.5;
    const yVariation = seededRandom(baseSeed + 1) * 1 - 0.5;
    const zVariation = seededRandom(baseSeed + 2) * 1.5;

    clouds.push({
      position: [layer4X[i] + xVariation, -2.5 + yVariation, -3 + zVariation],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 2.0 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.72 + seededRandom(baseSeed + 7) * 0.12,
      geometry: geometries[baseSeed % 3],
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
      geometry: geometries[baseSeed % 3],
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
      geometry: geometries[baseSeed % 3],
    });
  }

  // COUCHE 5: Avant (Z: 1 à 3)
  const layer5X = [-32, -22, -12, -2, 8, 18, 28];
  for (let i = 0; i < layer5X.length; i++) {
    const baseSeed = i * 1000 + 9000;
    const xVariation = seededRandom(baseSeed) * 5 - 2.5;
    const yVariation = seededRandom(baseSeed + 1) * 1 - 0.5;
    const zVariation = seededRandom(baseSeed + 2) * 1;

    clouds.push({
      position: [layer5X[i] + xVariation, -2.5 + yVariation, 1.5 + zVariation],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 2.1 + seededRandom(baseSeed + 6) * 0.18,
      opacity: 0.72 + seededRandom(baseSeed + 7) * 0.1,
      geometry: geometries[baseSeed % 3],
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
      geometry: geometries[baseSeed % 3],
    });
  }

  // COUCHE 6: Fine couche opaque devant la planète (Z: 4 à 6)
  const layer6X = [-35, -20, -5, 10, 25];
  for (let i = 0; i < layer6X.length; i++) {
    const baseSeed = i * 1000 + 11000;
    const xVariation = seededRandom(baseSeed) * 6 - 3;
    const yVariation = seededRandom(baseSeed + 1) * 1.5 - 0.75;
    const zVariation = seededRandom(baseSeed + 2) * 1;

    clouds.push({
      position: [layer6X[i] + xVariation, -2.2 + yVariation, 4.5 + zVariation],
      rotation: [
        seededRandom(baseSeed + 3) * Math.PI,
        seededRandom(baseSeed + 4) * Math.PI,
        seededRandom(baseSeed + 5) * Math.PI,
      ],
      scale: 2.1 + seededRandom(baseSeed + 6) * 0.2,
      opacity: 0.98 + seededRandom(baseSeed + 7) * 0.02,
      geometry: geometries[baseSeed % 3],
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
      geometry: geometries[baseSeed % 3],
    });
  }

  return clouds;
};

const clouds = ref<Cloud[]>(generateClouds());

// Valeurs responsives
const planetScale = computed(() => {
  return windowWidth.value < 768 ? [3, 3, 3] : [5, 5, 5];
});

const hoverRadius = computed(() => {
  return windowWidth.value < 768 ? 400 : 500;
});

const startAnimation = () => {
  if (animationStarted.value || !gltf.value?.scene) return;
  animationStarted.value = true;

  const animate = () => {
    if (gltf.value?.scene) {
      gltf.value.scene.rotation.y += 0.0005;
      gltf.value.scene.rotation.y += rotationDelta.value.y;
      gltf.value.scene.rotation.x += rotationDelta.value.x;
      rotationDelta.value.x *= 0.95;
      rotationDelta.value.y *= 0.95;
    }
    animationId = requestAnimationFrame(animate);
  };
  animate();
};

const handleMouseDown = (e: MouseEvent) => {
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
        const touch = e.touches[0];
        handleMouseDown({
          clientX: touch.clientX,
          clientY: touch.clientY,
        } as MouseEvent);
      }
    });
    container.addEventListener("touchmove", (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMouseMove({
          clientX: touch.clientX,
          clientY: touch.clientY,
        } as MouseEvent);
      }
    });
    container.addEventListener("touchend", handleMouseUp);
  }

  // Écouter les changements de taille de la fenêtre
  window.addEventListener("resize", () => {
    windowWidth.value = window.innerWidth;
  });

  // Watch pour démarrer l'animation dès que le GLB se charge
  watch(
    () => gltf.value?.scene,
    (scene) => {
      console.log("GLB scene detected:", scene);
      if (scene && !animationStarted.value) {
        console.log("Starting animation...");
        startAnimation();
      }
    },
    { immediate: true, deep: true },
  );
});

watch(
  () => gltf.value,
  (newGltf) => {
    console.log("gltf.value changed:", newGltf);
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
  <div
    ref="canvasRef"
    style="
      width: 100%;
      height: 100vh;
      background-color: #f4f4f4;
      background-image:
        linear-gradient(rgba(180, 180, 180, 0.2) 1px, transparent 1px),
        linear-gradient(90deg, rgba(180, 180, 180, 0.2) 1px, transparent 1px);
      background-size: 60px 60px;
      user-select: none;
      z-index: 0;
      overflow: hidden;
    "
    :style="{ cursor: isHoveringPlanet ? 'grab' : 'auto' }"
  >
    <TresCanvas clear-color="white" :options="{ alpha: true, antialias: true }">
      <TresPerspectiveCamera :position="[0, 2, 10]" :fov="50" />
      <TresAmbientLight :intensity="2" />
      <TresDirectionalLight :position="[10, 10, 10]" :intensity="2" />

      <!-- Nuages générés procéduralement -->
      <template v-for="(cloud, index) in clouds" :key="index">
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

      <!-- Planète GLB positionnée en bas du viewport -->
      <Suspense v-if="gltf?.scene">
        <primitive
          :object="gltf?.scene"
          :scale="planetScale"
          :position="[0, -2, 0]"
        />
      </Suspense>
    </TresCanvas>
  </div>
</template>
