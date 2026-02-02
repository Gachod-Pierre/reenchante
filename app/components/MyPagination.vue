<script setup lang="ts">
defineProps<{
  modelValue: number;
  totalPages: number;
}>();

defineEmits<{
  "update:modelValue": [value: number];
}>();
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="text-sm font-medium text-gray-600">
      Page {{ modelValue }} / {{ totalPages }}
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="n in totalPages"
        :key="n"
        :class="[
          'px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300',
          modelValue === n
            ? 'bg-[#FF1493] text-white border-2 border-[#FF1493]'
            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#FF1493] hover:text-[#FF1493]',
        ]"
        @click="$emit('update:modelValue', n)"
      >
        {{ n }}
      </button>
    </div>
  </div>
</template>
