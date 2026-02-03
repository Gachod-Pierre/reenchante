<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  message: string;
  isSuccess: boolean;
}>();

defineEmits<{
  close: [];
}>();
</script>

<template>
  <Teleport v-if="isOpen" to="body">
    <div
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="$emit('close')"
    >
      <div
        class="bg-white rounded-3xl p-8 max-w-md w-full border-2 shadow-2xl animate-fadeIn"
        :style="{
          borderColor: isSuccess ? '#FF69B4' : '#EF4444',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }"
        @click.stop
      >
        <div class="text-center">
          <p
            class="text-2xl font-black mb-4"
            :style="{ color: isSuccess ? '#FF1493' : '#EF4444' }"
          >
            {{ isSuccess ? "✅ Succès!" : "⚠️ Attention" }}
          </p>
          <p class="text-gray-700 text-lg mb-6">
            {{ message }}
          </p>
          <button
            v-if="!isSuccess"
            class="px-6 py-2 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105"
            :style="{ backgroundColor: '#FF1493' }"
            @click="$emit('close')"
          >
            Fermer
          </button>
          <p v-else class="text-sm text-gray-500">Redirection en cours...</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
