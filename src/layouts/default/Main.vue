<template>
    <v-app>
        <!-- application bar layout -->
        <app-bar />

        <!-- main content layout -->
        <v-main>
            <RouterView />
        </v-main>
    </v-app>
</template>

<script lang="ts" setup>
import AppBar from './AppBar.vue'
import { RouterView } from "vue-router"
</script>