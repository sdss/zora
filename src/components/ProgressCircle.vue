<!-- ProgressIndicator.vue -->
<template>
    <v-progress-circular
      v-if="props.loading"
      indeterminate
      :size="props.size"
      :width="props.width"
      :color="props.color"
      class="ml-2"
    ></v-progress-circular>
  </template>

  <script setup lang="ts">
  import { defineProps } from 'vue';

  const props = defineProps({
    loading: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number,
      default: 24
    },
    width: {
      type: Number,
      default: 2
    },
    color: {
      type: String,
      default: 'purple'
    }
  });
  </script>
