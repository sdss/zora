<template>
    <!-- see Vuetify text-field component for options -->
    <v-text-field
      :model-value="modelValue"
      :label="label"
      :placeholder="placeholder"
      :id="id"
      variant="outlined"
      clearable
      :hint="hint"
      :rules="rules"
      type="input"
      @input="$emit('update:modelValue', $event.target.value)"
    ></v-text-field>
</template>

<script lang="ts" setup>

defineEmits(['update:modelValue'])

// define which properties are passed in from the parent, i.e. ":xxx"
const props = defineProps<{
    modelValue: string,
    label: string,
    placeholder: string,
    hint: string,
    rules: [],
    id: string
}>()

</script>
