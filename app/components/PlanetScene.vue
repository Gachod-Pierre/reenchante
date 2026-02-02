<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useGLTF } from "@tresjs/cientos";
import * as THREE from "three";
import { useSceneAnimation } from "../composables/useSceneAnimation";
import { usePlanetRotation } from "../composables/usePlanetRotation";
import { useRainbowArcs } from "../composables/useRainbowArcs";
import { usePingGenerator } from "../composables/usePingGenerator";
import { useInteractionHandlers } from "../composables/useInteractionHandlers";
import { useCloudGenerator } from "../composables/useCloudGenerator";
import { useCloudInstancedMesh } from "../composables/useCloudInstancedMesh";
import { useUserDeedsByContinent } from "../composables/useUserDeedsByContinent";
import ContinentOverlay from "./ContinentOverlay.vue";

const { state: gltf } = useGLTF("/models/earth-cartoon.glb");
const canvasRef = ref();
const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1024,
);

// ✅ Animation composable
const {
  sunOpacity,
  rainbowOpacity,
  cloudsOpacity,
  pingsOpacity,
  oscillationTime,
  startAnimation: startSceneAnimation,
  stopAnimation: stopSceneAnimation,
  getRenderLoopCallback,
  setAnimationFrameId,
  getSunOscillationY,
  getCloudOscillationY,
  getPlanetEntranceSlideY,
} = useSceneAnimation();

// ✅ Rotation composable
const { setPlanetGroup, updateRotation, applyDelta } = usePlanetRotation();

// ✅ Rainbow arcs composable
const {
  rainbowArcs,
  updateRainbowArcs,
  dispose: disposeRainbowArcs,
} = useRainbowArcs();

// ✅ Pings composable
const { pings, updatePings } = usePingGenerator();

// ✅ User deeds composable pour l'overlay
const {
  userDeeds,
  loading: deedsLoading,
  fetchUserDeedsForContinent,
} = useUserDeedsByContinent();
const selectedContinentId = ref<string | null>(null);
const isOverlayOpen = ref(false);
const hoveredPingId = ref<string | null>(null);
const mouseX = ref(0);
const mouseY = ref(0);
let isLoadingDeeds = false;

// Mapping des IDs de continents aux noms
const continentNames: Record<string, string> = {
  africa: "Afrique",
  antarctica: "Antarctique",
  asia: "Asie",
  europe: "Europe",
  "north-america": "Amérique du Nord",
  oceania: "Océanie",
  "south-america": "Amérique du Sud",
};

// ✅ Interaction handlers composable
const {
  isHoveringPlanet,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  setHoverRadius,
} = useInteractionHandlers(
  (deltaX, deltaY) => applyDelta(deltaX, deltaY),
  () => {}, // callback pour hover changes
);

// ✅ Cloud generation composable
const { clouds, initializeClouds } = useCloudGenerator();
initializeClouds();

// ✅ Cloud InstancedMesh composable
const { initialize: initCloudInstancedMesh } = useCloudInstancedMesh();
const cloudInstancedMesh = ref<THREE.InstancedMesh | null>(null);
const canvasThreeRef = ref<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

// ✅ Planet group ref
const planetGroupRef = ref<THREE.Group | null>(null);

// ✅ Style statique
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

// Valeurs responsives
const planetScale = computed((): [number, number, number] => {
  return windowWidth.value < 768 ? [3, 3, 3] : [5, 5, 5];
});

const sunPosition = computed((): [number, number, number] => {
  // Sur mobile: descendre le soleil (Y=1), sur desktop: le garder plus haut (Y=3)
  return windowWidth.value < 768 ? [5, 1, -15] : [5, 3, -15];
});

// Hover radius is set dynamically in the interaction handler

// ✅ Autres variables nécessaires pour le rendering
let camera: THREE.PerspectiveCamera | THREE.Camera | null = null;
let _raycaster: THREE.Raycaster | null = null;
const pingMeshRefs = new Map<string, THREE.Mesh>();

// Références aux handlers pour pouvoir les supprimer correctement
let resizeHandler: (() => void) | null = null;
let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;

// Mettre à jour les pings quand la planète change de scale
watch(windowWidth, (newWidth) => {
  const newScale = newWidth < 768 ? 3 : 5;
  updatePings(newScale);
  updateRainbowArcs(newWidth);
  setHoverRadius(newWidth < 768 ? 400 : 500);
});

onMounted(async () => {
  // Initialiser les pings avec le scale initial
  const initialScale = windowWidth.value < 768 ? 3 : 5;
  updatePings(initialScale);

  // Initialiser les arcs en ciel
  updateRainbowArcs(windowWidth.value);

  // Attacher les listeners au div conteneur
  const container = canvasRef.value;
  if (container) {
    container.addEventListener("mousedown", handleMouseDown, { passive: true });
    container.addEventListener(
      "mousemove",
      (e: MouseEvent) => handleMouseMove(e, container),
      { passive: true },
    );
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
            handleMouseMove(
              {
                clientX: touch.clientX,
                clientY: touch.clientY,
              } as MouseEvent,
              container,
            );
          }
        }
      },
      { passive: true },
    );
    container.addEventListener("touchend", handleMouseUp, { passive: true });
  }

  // Initialiser le raycaster et la caméra
  _raycaster = new THREE.Raycaster();

  const canvas = canvasRef.value?.querySelector("canvas");
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
  resizeHandler = () => {
    windowWidth.value = window.innerWidth;
  };

  mouseMoveHandler = (e: MouseEvent) => {
    mouseX.value = e.clientX;
    mouseY.value = e.clientY;
  };

  window.addEventListener("resize", resizeHandler);
  window.addEventListener("mousemove", mouseMoveHandler);

  // Initialiser le cloud mesh
  cloudInstancedMesh.value = initCloudInstancedMesh(clouds.value);

  // ✅ Ajouter le InstancedMesh à la scène
  // ✅ Watch pour capturer la référence Three.js du planetGroup et initialiser la rotation
  watch(
    () => planetGroupRef.value,
    (group) => {
      if (group) {
        setPlanetGroup(group);
      }
    },
    { immediate: true },
  );

  // Watch pour démarrer l'animation dès que le GLB se charge
  watch(
    () => gltf.value?.scene,
    (scene) => {
      if (scene) {
        // Démarrer l'animation de fade-in + boucle de rotation
        startSceneAnimation(gltf.value, () => {
          updateRotation();
        });

        // Lancer la boucle d'animation
        const animate = () => {
          const callback = getRenderLoopCallback();
          callback?.();
          setAnimationFrameId(requestAnimationFrame(animate));
        };

        setAnimationFrameId(requestAnimationFrame(animate));
      }
    },
    { immediate: true, deep: true },
  );

  // Cleanup au démount
  return () => {
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    if (mouseMoveHandler)
      window.removeEventListener("mousemove", mouseMoveHandler);
  };
});

const handlePingHover = (pingId: string, isHovering: boolean) => {
  // Mettre à jour DIRECTEMENT le Three.js material
  const mesh = pingMeshRefs.get(pingId);
  if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.emissiveIntensity = isHovering ? 1.2 : 0.4;
  }
  // Mettre à jour l'état du hover pour afficher la card
  hoveredPingId.value = isHovering ? pingId : null;
};

const handlePingClick = (pingId: string) => {
  // Éviter les clics multiples pendant le chargement
  if (isLoadingDeeds) return;

  const ping = pings.value.find((p) => p.id === pingId);
  if (ping) {
    // Ouvrir l'overlay
    selectedContinentId.value = pingId;
    isOverlayOpen.value = true;
    isLoadingDeeds = true;

    // Récupérer les données
    fetchUserDeedsForContinent(pingId).finally(() => {
      isLoadingDeeds = false;
    });
  }
};

onUnmounted(() => {
  // Arrêter l'animation
  stopSceneAnimation();

  // Disposer les ressources
  disposeRainbowArcs();

  const container = canvasRef.value;
  if (container) {
    container.removeEventListener("mousedown", handleMouseDown);
    container.removeEventListener("mouseup", handleMouseUp);
    container.removeEventListener("mouseleave", handleMouseUp);
    container.removeEventListener("touchend", handleMouseUp);
  }

  // Nettoyer les event listeners globaux
  if (resizeHandler) window.removeEventListener("resize", resizeHandler);
  if (mouseMoveHandler)
    window.removeEventListener("mousemove", mouseMoveHandler);

  // Nettoyer les refs
  pingMeshRefs.clear();
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
          (c) => {
            if (c instanceof THREE.PerspectiveCamera) {
              camera = c;
            }
          }
        "
      />
      <TresAmbientLight :intensity="2" />
      <TresDirectionalLight :position="[10, 10, 10]" :intensity="2" />

      <!-- Soleil en arrière-plan -->
      <TresMesh
        :position="[
          sunPosition[0],
          sunPosition[1] + getSunOscillationY(),
          sunPosition[2],
        ]"
        :scale="[4, 4, 4]"
      >
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
        :position="[
          sunPosition[0],
          sunPosition[1] + getSunOscillationY(),
          sunPosition[2],
        ]"
        :scale="[4.5, 4.5, 4.5]"
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

      <!-- ✅ Nuages générés procéduralement -->
      <template v-for="(cloud, index) in clouds" :key="`cloud-${index}`">
        <TresMesh
          :position="[
            cloud.position[0],
            cloud.position[1] + getCloudOscillationY(index),
            cloud.position[2],
          ]"
          :rotation="cloud.rotation"
        >
          <TresIcosahedronGeometry :args="[cloud.scale, 0]" />
          <TresMeshStandardMaterial
            :color="cloud.color || '#ffffff'"
            transparent
            :opacity="cloud.opacity * cloudsOpacity"
          />
        </TresMesh>
      </template>

      <!-- Groupe contenant la planète et les pings (pour la rotation commune) -->
      <TresGroup
        ref="planetGroupRef"
        :position="[0, -2 + getPlanetEntranceSlideY(), 0]"
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

    <!-- Overlay des soumissions par continent -->
    <ContinentOverlay
      :is-open="isOverlayOpen"
      :continent-id="selectedContinentId"
      :user-deeds="userDeeds"
      :loading="deedsLoading"
      @close="isOverlayOpen = false"
    />

    <!-- Card hover pour afficher le nom du continent -->
    <transition name="fade">
      <div
        v-if="hoveredPingId"
        class="fixed bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-sm font-semibold text-gray-800 pointer-events-none z-40 whitespace-nowrap"
        :style="{
          left: mouseX + 12 + 'px',
          top: mouseY + 12 + 'px',
        }"
      >
        {{ continentNames[hoveredPingId] || hoveredPingId }}
      </div>
    </transition>
  </div>
</template>
