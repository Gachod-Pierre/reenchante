import { ref } from "vue";

export function useInteractionHandlers(
  onMouseMove: (deltaX: number, deltaY: number) => void,
  onHoveringChange: (isHovering: boolean) => void,
) {
  const isDragging = ref(false);
  const isHoveringPlanet = ref(false);

  // ✅ NON-réactive pour éviter re-renders à chaque mousemove
  let previousMousePosition = { x: 0, y: 0 };
  let cachedCanvasRect: DOMRect | null = null;
  let lastMouseMoveTime = 0;
  const MOUSE_THROTTLE_MS = 16; // ~60fps

  let lastHoveringPlanetState = false;
  let hoverRadius = 500; // Valeur par défaut, à mettre à jour

  const setHoverRadius = (radius: number) => {
    hoverRadius = radius;
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!isHoveringPlanet.value) return;
    isDragging.value = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: MouseEvent, canvasRef: HTMLElement | null) => {
    // THROTTLE: Limiter à ~60fps
    const now = Date.now();
    if (now - lastMouseMoveTime < MOUSE_THROTTLE_MS) {
      return;
    }
    lastMouseMoveTime = now;

    const pointerEvent = e as
      | PointerEvent
      | (MouseEvent & { offsetX?: number; offsetY?: number });
    const mouseX = pointerEvent.offsetX ?? e.clientX;
    const mouseY = pointerEvent.offsetY ?? e.clientY;

    if (!cachedCanvasRect && !pointerEvent.offsetX && canvasRef) {
      const rect = canvasRef.getBoundingClientRect();
      if (rect) {
        cachedCanvasRect = rect;
      }
    }

    if (!cachedCanvasRect && !pointerEvent.offsetX) return;

    // Calcul de la distance depuis le centre du canvas
    const centerX = cachedCanvasRect
      ? cachedCanvasRect.width / 2
      : typeof window !== "undefined"
        ? window.innerWidth / 2
        : 512;
    const centerY = cachedCanvasRect
      ? cachedCanvasRect.height * 0.95
      : typeof window !== "undefined"
        ? window.innerHeight * 0.95
        : 512;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distanceSquared = dx * dx + dy * dy;
    const hoverRadiusSquared = hoverRadius * hoverRadius;

    // ✅ NE mettre à jour Vue reactivity que si l'état CHANGE
    const newHoveringState = distanceSquared < hoverRadiusSquared;
    if (newHoveringState !== lastHoveringPlanetState) {
      isHoveringPlanet.value = newHoveringState;
      lastHoveringPlanetState = newHoveringState;
      onHoveringChange(newHoveringState);
    }

    // ✅ IMPORTANT: Si on n'est pas en train de drag, ne rien faire
    if (!isDragging.value) return;

    // Calculs pour la rotation
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    // ✅ Appeler la callback avec les deltas
    onMouseMove(deltaX, deltaY);

    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.value = false;
  };

  const cleanup = () => {
    cachedCanvasRect = null;
  };

  return {
    isDragging,
    isHoveringPlanet,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    setHoverRadius,
    cleanup,
  };
}
