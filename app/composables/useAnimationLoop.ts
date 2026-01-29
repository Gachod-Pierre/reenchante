import { useRenderLoop } from "@tresjs/cientos";

interface AnimationCallback {
  (deltaTime: number): void;
}

const callbacks: Set<AnimationCallback> = new Set();
let initialized = false;

export const useAnimationLoop = () => {
  if (!initialized) {
    const { onLoop } = useRenderLoop();

    onLoop(() => {
      callbacks.forEach((cb) => cb(0)); // deltaTime à 0 pour maintenant
    });

    initialized = true;
  }

  const register = (callback: AnimationCallback): (() => void) => {
    callbacks.add(callback);
    return () => callbacks.delete(callback);
  };

  return {
    register,
  };
};
