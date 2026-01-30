import { ref } from "vue";

export interface Ping {
  id: string;
  continent: string;
  position: [number, number, number];
  scale: number;
  hovered: boolean;
  actionCount: number;
}

export function usePingGenerator() {
  const pings = ref<Ping[]>([]);

  const generatePings = (scale: number = 5): Ping[] => {
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

    return pingData.map((data) => {
      const radius = 5.2 * (scale / 5);
      const latRad = (data.lat * Math.PI) / 180;
      const lngRad = (data.lng * Math.PI) / 180;

      const x = radius * Math.cos(latRad) * Math.cos(lngRad);
      const y = radius * Math.sin(latRad);
      const z = radius * Math.cos(latRad) * Math.sin(lngRad);

      return {
        id: data.id,
        continent: data.continent,
        position: [x, y, z] as [number, number, number],
        scale: 0.6,
        hovered: false,
        actionCount: data.actions,
      };
    });
  };

  const updatePings = (scale: number) => {
    pings.value = generatePings(scale);
  };

  return {
    pings,
    updatePings,
  };
}
