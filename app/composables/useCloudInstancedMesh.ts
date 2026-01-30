import * as THREE from "three";
import type { Cloud } from "./useCloudGenerator";

/**
 * Composable pour créer et mettre à jour l'InstancedMesh des nuages
 * ✅ OPTIMISATION: Convertit 200+ meshes en 1 seul InstancedMesh
 */
export const useCloudInstancedMesh = () => {
  let instancedMesh: THREE.InstancedMesh | null = null;

  /**
   * Crée UN InstancedMesh pour tous les nuages (au lieu de 200 TresMesh)
   */
  const createCloudInstancedMesh = (clouds: Cloud[]): THREE.InstancedMesh => {
    // Créer une géométrie icosahedron LOW POLY réutilisée
    const baseGeometry = new THREE.IcosahedronGeometry(1, 0);

    // Matériel unique pour toutes les instances
    const material = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      transparent: true,
    });

    // Créer l'InstancedMesh avec assez de capacité pour tous les nuages
    const mesh = new THREE.InstancedMesh(baseGeometry, material, clouds.length);

    // Mettre à jour chaque instance
    const dummy = new THREE.Object3D();
    clouds.forEach((cloud, index) => {
      dummy.position.set(...cloud.position);
      dummy.rotation.set(...cloud.rotation);
      dummy.scale.set(cloud.scale, cloud.scale, cloud.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);

      // Stocker l'opacité dans les couleurs (hack pour passer opacity à chaque instance)
      const color = new THREE.Color(1, 1, 1);
      mesh.setColorAt(index, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor!.needsUpdate = true;

    return mesh;
  };

  /**
   * Initialise l'InstancedMesh
   */
  const initialize = (clouds: Cloud[]): THREE.InstancedMesh => {
    // Disposer l'ancien mesh s'il existe
    if (instancedMesh) {
      instancedMesh.geometry.dispose();
      const material = instancedMesh.material;
      if (material instanceof THREE.Material) {
        material.dispose();
      } else if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      }
    }

    instancedMesh = createCloudInstancedMesh(clouds);
    return instancedMesh;
  };

  /**
   * Retourne l'InstancedMesh courant
   */
  const getMesh = (): THREE.InstancedMesh | null => {
    return instancedMesh;
  };

  /**
   * Nettoie les ressources
   */
  const dispose = () => {
    if (instancedMesh) {
      instancedMesh.geometry.dispose();
      const material = instancedMesh.material;
      if (material instanceof THREE.Material) {
        material.dispose();
      } else if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      }
      instancedMesh = null;
    }
  };

  return {
    initialize,
    getMesh,
    dispose,
  };
};
