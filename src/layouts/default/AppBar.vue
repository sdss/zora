<template>
  <v-app-bar app flat>
    <v-row align="center">
      <!-- title area -->
      <v-col cols="auto">
        <v-app-bar-title class="ma-2">
          <v-icon icon="mdi-orbit" />
          SDSS
        </v-app-bar-title>
      </v-col>

      <!-- page links -->
      <v-col>
        <v-btn justify="start"><RouterLink to="/">Home</RouterLink></v-btn>
        <v-btn><RouterLink to="/about">About</RouterLink></v-btn>
      </v-col>

      <!-- release and login -->
      <v-col cols="2" class="ma-2">
        <release-select />
      </v-col>
    </v-row>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router"
import ReleaseSelect from '@/components/ReleaseSelect.vue'
</script>
