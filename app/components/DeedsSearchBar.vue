<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div class="search-bar">
    <input
      :value="modelValue"
      type="text"
      class="search-bar__input"
      placeholder="Rechercher par titre, description ou date..."
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <svg
      v-if="!modelValue"
      class="search-bar__icon"
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

<style scoped>
.search-bar {
  display: flex;
  position: relative;
  margin-bottom: 1.5rem;
  width: 100%;
}

.search-bar__input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  font-size: 1rem;
  border: 2px solid #ff69b4;
  border-radius: 12px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.95);
  font-family: inherit;
}

.search-bar__input:focus {
  outline: none;
  border-color: #ff1493;
  box-shadow:
    0 0 0 3px rgba(255, 20, 147, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-bar__input::placeholder {
  color: #999;
}

.search-bar__icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #ff69b4;
  pointer-events: none;
}
</style>
