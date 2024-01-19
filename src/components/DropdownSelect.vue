<template>
    <v-autocomplete
      :id="id"
      v-model="internalValue"
      :label="label"
      :items="items"
      density="compact"
      hide-details="auto"
      clearable
    ></v-autocomplete>
  </template>

<script lang="ts" setup>

import { computed } from 'vue';

const emit = defineEmits(['update:modelValue'])

// v-model cannot be used on a local property, local props are not writable.
const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val || "")
});

// define which properties are passed in from the parent, i.e. ":xxx"
const props = defineProps<{
    modelValue: string,
    label: string,
    id: string,
    items: Array<string>,
}>()

</script>