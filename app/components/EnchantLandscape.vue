<template>
  <!-- SVG low-poly landscape, fixed fullscreen background -->
  <svg
    :viewBox="`0 0 1440 900`"
    :width="1440"
    :height="900"
    preserveAspectRatio="xMidYMid slice"
    class="w-full h-full object-cover"
  >
    <!-- SKY -->
    <rect width="1440" height="450" :fill="palette.sky" />

    <!-- CLOUDS (low-poly) -->
    <!-- Cloud 1 (left) -->
    <g opacity="0.8">
      <polygon
        points="100,120 160,80 220,100 240,140 180,160 120,150"
        :fill="palette.clouds"
      />
      <polygon
        points="220,100 280,60 340,90 320,160 240,140"
        :fill="palette.clouds"
      />
    </g>

    <!-- Cloud 2 (center-top) -->
    <g opacity="0.7">
      <polygon
        points="600,100 680,60 760,80 780,150 700,170 620,150"
        :fill="palette.clouds"
      />
      <polygon
        points="760,80 840,50 900,90 860,170 780,150"
        :fill="palette.clouds"
      />
    </g>

    <!-- Cloud 3 (right) -->
    <g opacity="0.75">
      <polygon
        points="1100,130 1180,90 1260,110 1280,170 1200,180 1120,160"
        :fill="palette.clouds"
      />
      <polygon
        points="1260,110 1340,70 1400,120 1360,180 1280,170"
        :fill="palette.clouds"
      />
    </g>

    <!-- SUN -->
    <g>
      <!-- Sun glow (subtle) -->
      <circle cx="1200" cy="150" r="80" :fill="palette.sun" opacity="0.4" />
      <!-- Sun core -->
      <circle cx="1200" cy="150" r="50" :fill="palette.sun" />
      <!-- Sun facets (low-poly effect) -->
      <polygon
        points="1200,100 1240,120 1220,150 1200,140"
        :fill="palette.sun"
        opacity="0.6"
      />
      <polygon
        points="1200,100 1180,130 1200,140 1220,120"
        :fill="palette.sun"
        opacity="0.6"
      />
      <polygon
        points="1240,150 1260,170 1230,180 1220,150"
        :fill="palette.sun"
        opacity="0.6"
      />
      <polygon
        points="1160,150 1180,170 1200,180 1200,150"
        :fill="palette.sun"
        opacity="0.6"
      />
    </g>

    <!-- SOIL / GROUND (base) -->
    <polygon points="0,450 1440,450 1440,900 0,900" :fill="palette.soil" />

    <!-- SMALL HILLS / COLLINES (avant l'herbe) -->
    <g opacity="0.5">
      <polygon points="0,500 250,480 400,500 0,600" :fill="palette.grass" />
      <polygon
        points="1000,500 1200,470 1440,500 1440,600 1000,600"
        :fill="palette.grass"
      />
    </g>

    <!-- GRASS / HERBE (scattered patches, low-poly) - AVANT les arbres au premier plan -->
    <!-- Grass patch 1 -->
    <g opacity="0.9">
      <polygon points="80,450 180,450 170,480 90,470" :fill="palette.grass" />
      <polygon points="180,450 280,455 270,490 170,480" :fill="palette.grass" />
    </g>

    <!-- Grass patch 2 (center) -->
    <g opacity="0.85">
      <polygon points="500,460 620,450 630,500 510,495" :fill="palette.grass" />
      <polygon points="620,450 750,455 740,510 630,500" :fill="palette.grass" />
      <polygon points="750,455 880,450 870,505 740,510" :fill="palette.grass" />
    </g>

    <!-- Grass patch 2.5 (center-middle, filling the gap) -->
    <g opacity="0.8">
      <polygon
        points="880,460 1000,455 1010,510 870,505"
        :fill="palette.grass"
      />
    </g>

    <!-- Grass patch 3 (right) -->
    <g opacity="0.8">
      <polygon
        points="1100,455 1200,450 1210,500 1110,490"
        :fill="palette.grass"
      />
      <polygon
        points="1200,450 1340,460 1330,510 1210,500"
        :fill="palette.grass"
      />
    </g>

    <!-- Grass patch 4 (bottom center - organic shape) -->
    <g opacity="0.75">
      <polygon
        points="300,700 550,680 650,770 450,790 350,730"
        :fill="palette.grass"
      />
      <polygon points="550,680 800,670 850,765 650,770" :fill="palette.grass" />
      <polygon
        points="800,670 1100,690 1050,780 850,765"
        :fill="palette.grass"
      />
    </g>

    <!-- DISTANT TREES LAYER (small trees far away - APRÈS herbe pour être par-dessus) -->
    <g opacity="0.8">
      <!-- Distant tree 1 (left) -->
      <g>
        <!-- Foliage (petit triangle) -->
        <polygon points="120,450 160,450 140,380" :fill="palette.foliage" />
        <!-- Trunk (petit) -->
        <polygon
          points="135,450 145,450 143,490 137,490"
          :fill="palette.trees"
        />
      </g>

      <!-- Distant tree 2 (center-left) -->
      <g>
        <!-- Foliage -->
        <polygon points="350,450 400,450 375,380" :fill="palette.foliage" />
        <!-- Trunk -->
        <polygon
          points="368,450 382,450 380,490 370,490"
          :fill="palette.trees"
        />
      </g>

      <!-- Distant tree 3 (center) -->
      <g>
        <!-- Foliage -->
        <polygon points="680,450 740,450 710,370" :fill="palette.foliage" />
        <!-- Trunk -->
        <polygon
          points="703,450 717,450 715,490 705,490"
          :fill="palette.trees"
        />
      </g>

      <!-- Distant tree 4 (center-right) -->
      <g>
        <!-- Foliage -->
        <polygon points="950,450 1000,450 975,380" :fill="palette.foliage" />
        <!-- Trunk -->
        <polygon
          points="968,450 982,450 980,490 970,490"
          :fill="palette.trees"
        />
      </g>

      <!-- Distant tree 5 (right) -->
      <g>
        <!-- Foliage -->
        <polygon points="1280,450 1340,450 1310,370" :fill="palette.foliage" />
        <!-- Trunk -->
        <polygon
          points="1303,450 1317,450 1315,490 1305,490"
          :fill="palette.trees"
        />
      </g>
    </g>

    <!-- TREES (simple low-poly) - APRÈS l'herbe pour être par-dessus -->
    <!-- Tree 1 (left) -->
    <g>
      <!-- Foliage (triangle) -->
      <polygon points="150,500 290,500 220,350" :fill="palette.foliage" />
      <!-- Foliage facets -->
      <polygon
        points="220,350 180,420 200,400"
        :fill="palette.foliage"
        opacity="0.8"
      />
      <polygon
        points="220,350 250,420 240,400"
        :fill="palette.foliage"
        opacity="0.8"
      />
      <!-- Trunk -->
      <polygon points="200,500 240,500 235,650 205,650" :fill="palette.trees" />
    </g>

    <!-- Tree 2 (center) -->
    <g>
      <!-- Foliage (triangle) -->
      <polygon points="600,520 780,520 690,340" :fill="palette.foliage" />
      <!-- Foliage facets -->
      <polygon
        points="690,340 640,430 660,410"
        :fill="palette.foliage"
        opacity="0.8"
      />
      <polygon
        points="690,340 740,430 720,410"
        :fill="palette.foliage"
        opacity="0.8"
      />
      <!-- Trunk - CORRIGÉ pour être centré sous le feuillage (x=690) -->
      <polygon points="670,520 710,520 705,680 675,680" :fill="palette.trees" />
    </g>

    <!-- Tree 3 (right) -->
    <g>
      <!-- Foliage (triangle) -->
      <polygon points="1030,510 1170,510 1100,330" :fill="palette.foliage" />
      <!-- Foliage facets -->
      <polygon
        points="1100,330 1050,420 1070,400"
        :fill="palette.foliage"
        opacity="0.8"
      />
      <polygon
        points="1100,330 1150,420 1130,400"
        :fill="palette.foliage"
        opacity="0.8"
      />
      <!-- Trunk -->
      <polygon
        points="1080,510 1120,510 1115,650 1085,650"
        :fill="palette.trees"
      />
    </g>

    <!-- BIRDS (very small, discrete, V shapes) -->
    <g opacity="0.6">
      <!-- Bird 1 (left) -->
      <polyline
        points="50,150 60,160 70,150"
        stroke="currentColor"
        stroke-width="3"
        fill="none"
      />
      <!-- Bird 2 (center-left) -->
      <polyline
        points="300,200 310,210 320,200"
        stroke="currentColor"
        stroke-width="3"
        fill="none"
      />
      <!-- Bird 3 (center) -->
      <polyline
        points="900,180 910,190 920,180"
        stroke="currentColor"
        stroke-width="3"
        fill="none"
      />
      <!-- Bird 4 (center-right) -->
      <polyline
        points="1100,220 1110,230 1120,220"
        stroke="currentColor"
        stroke-width="3"
        fill="none"
      />
      <!-- Bird 5 (right) -->
      <polyline
        points="1370,170 1380,180 1390,170"
        stroke="currentColor"
        stroke-width="3"
        fill="none"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { computePalette } from "~/composables/useEnchantTiers";

interface Props {
  points?: number;
}

const props = withDefaults(defineProps<Props>(), {
  points: 0,
});

// Watch pour debug
watch(
  () => props.points,
  (newVal, oldVal) => {
    console.log(
      `[EnchantLandscape] points changed from ${oldVal} to ${newVal}`,
    );
  },
);

// Compute palette based on current points
const palette = computed(() => {
  const pal = computePalette(props.points);
  console.log(
    `[EnchantLandscape-computed] points=${props.points}, sky=${pal.sky}`,
  );
  return pal;
});
</script>

<style scoped>
/* Transition progressive des couleurs SVG */
rect,
polygon,
circle {
  transition:
    fill 0.8s ease-in-out,
    stroke 0.8s ease-in-out;
}
</style>
