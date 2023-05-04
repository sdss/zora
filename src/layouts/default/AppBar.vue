<template>
  <v-app-bar app flat>
      <v-app-bar-title>
          <v-icon icon="mdi-orbit" />
          SDSS
      </v-app-bar-title>

      <v-btn><RouterLink to="/">Home</RouterLink></v-btn>
      <v-btn theme="dark"><RouterLink to="/about">About</RouterLink></v-btn>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router"
</script>
