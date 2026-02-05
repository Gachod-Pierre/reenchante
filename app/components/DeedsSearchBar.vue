<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div
    class="flex relative mb-6 w-full backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
  >
    <input
      :value="modelValue"
      type="text"
      class="w-full px-4 py-3.5 pl-11 text-base border-2 rounded-xl transition-all duration-300 bg-white bg-opacity-95 font-inherit placeholder-[#999] outline-none focus:bg-gray-100 focus:shadow-[0_0_0_3px_rgba(255,105,180,0.2)]"
      placeholder="Rechercher par titre, description ou date..."
      :style="{
        borderColor: '#FF69B4',
      }"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    >
    <svg
      v-if="!modelValue"
      class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
      :style="{ color: '#FF69B4' }"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  </div>
</template>
