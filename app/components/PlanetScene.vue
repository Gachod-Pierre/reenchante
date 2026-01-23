<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useGLTF } from "@tresjs/cientos";

const { state: gltf } = useGLTF("/models/earth-cartoon.glb");
const sphereMesh = ref();
const canvasRef = ref();
let animationId: number;

const isDragging = ref(false);
const previousMousePosition = ref({ x: 0, y: 0 });
const rotationDelta = ref({ x: 0, y: 0 });

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  previousMousePosition.value = { x: e.clientX, y: e.clientY };
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;

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
  const canvas = canvasRef.value?.querySelector("canvas");
  if (canvas) {
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
  }

  const animate = () => {
    if (sphereMesh.value) {
      // Rotation automatique lente (0.0005 au lieu de 0.003)
      sphereMesh.value.rotation.y += 0.0005;
      // Rotation par la souris
      sphereMesh.value.rotation.y += rotationDelta.value.y;
      sphereMesh.value.rotation.x += rotationDelta.value.x;
      // Réinitialiser les deltas pour la prochaine frame
      rotationDelta.value.x *= 0.95;
      rotationDelta.value.y *= 0.95;
    }
    animationId = requestAnimationFrame(animate);
  };
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  const canvas = canvasRef.value?.querySelector("canvas");
  if (canvas) {
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseup", handleMouseUp);
    canvas.removeEventListener("mouseleave", handleMouseUp);
  }
});
</script>

<template>
  <div
    ref="canvasRef"
    style="
      width: 100%;
      height: 100vh;
      background: white;
      cursor: grab;
      user-select: none;
    "
  >
    <TresCanvas clear-color="white">
      <TresPerspectiveCamera :position="[0, 0, 10]" :fov="50" />
      <TresAmbientLight :intensity="2" />
      <TresDirectionalLight :position="[10, 10, 10]" :intensity="2" />

      <!-- Planète GLB -->
      <Suspense>
        <primitive
          v-if="gltf"
          ref="sphereMesh"
          :object="gltf.scene"
          :scale="[3, 3, 3]"
        />
      </Suspense>
    </TresCanvas>
  </div>
</template>
