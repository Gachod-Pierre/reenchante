import type * as THREE from "three";

export function usePlanetRotation() {
  // ✅ Variables NON-réactives pour la rotation (perf critique)
  let planetGroupThreeObject: THREE.Group | null = null;
  let planetGroupRotationX = 0;
  let planetGroupRotationY = 0;
  let pendingDeltaX = 0;
  let pendingDeltaY = 0;

  // ✅ Debug timing NON-réactif
  const debugTimings = {
    rotationUpdate: 0,
    lastFrameTime: performance.now(),
  };

  const setPlanetGroup = (group: THREE.Group | null) => {
    planetGroupThreeObject = group;
  };

  const updateRotation = () => {
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
  };

  const applyDelta = (deltaX: number, deltaY: number) => {
    pendingDeltaX = deltaX;
    pendingDeltaY = deltaY;
  };

  return {
    setPlanetGroup,
    updateRotation,
    applyDelta,
    getDebugTimings: () => debugTimings,
  };
}
