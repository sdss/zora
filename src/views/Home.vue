<template>
  <HelloWorld />
</template>

<script lang="ts" setup>
import HelloWorld from '@/components/HelloWorld.vue'

console.log('mode', import.meta.env.MODE)
console.log('base url', import.meta.env.VITE_BASE_URL)
</script>
