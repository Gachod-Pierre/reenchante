<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useGLTF } from "@tresjs/cientos";

const { state: gltf } = useGLTF("/models/earth-cartoon.glb");
const canvasRef = ref();
let animationId: number;
const animationStarted = ref(false);

const isDragging = ref(false);
const isHoveringPlanet = ref(false);
const previousMousePosition = ref({ x: 0, y: 0 });
const rotationDelta = ref({ x: 0, y: 0 });

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
  // Vérifie si la souris est sur la zone centrale (approximation pour la planète)
  const rect = canvasRef.value?.getBoundingClientRect();
  if (rect) {
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const distanceFromCenter = Math.sqrt(
      Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2),
    );
    // Si à moins de 200px du centre, on considère que c'est sur la planète
    isHoveringPlanet.value = distanceFromCenter < 250;
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
  }

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
    style="width: 100%; height: 100vh; background: transparent; user-select: none"
    :style="{ cursor: isHoveringPlanet ? 'grab' : 'auto' }"
  >
    <TresCanvas clear-color="white">
      <TresPerspectiveCamera :position="[0, 0, 10]" :fov="50" />
      <TresAmbientLight :intensity="2" />
      <TresDirectionalLight :position="[10, 10, 10]" :intensity="2" />

      <!-- Planète GLB -->
      <Suspense v-if="gltf?.scene">
        <primitive :object="gltf?.scene" :scale="[3, 3, 3]" />
      </Suspense>
    </TresCanvas>
  </div>
</template>
