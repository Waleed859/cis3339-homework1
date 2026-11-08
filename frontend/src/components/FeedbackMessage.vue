<script setup>
defineProps({ message: String, kind: { type: String, default: 'info' } });
</script>
<template>
  <p v-if="message" class="feedback" :class="kind" role="status">{{ message }}</p>
</template>
