<template>
  <v-app-bar app flat>
      <v-app-bar-title>
          <v-icon icon="mdi-orbit" />
          SDSS
      </v-app-bar-title>

      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>

      <release-select />
      <v-btn><RouterLink to="/">Home</RouterLink></v-btn>
      <v-btn><RouterLink to="/about">About</RouterLink></v-btn>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router"
import ReleaseSelect from '@/components/ReleaseSelect.vue'
</script>
