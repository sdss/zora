<template>
    <v-container fluid>
        <v-row justify="center">
            <v-col cols="4">
                <h1>This is an about page</h1>
                <h2>using data release {{ store.release }}</h2>
            </v-col>
        </v-row>
    </v-container>
</template>

<style>
</style>

<script lang="ts" setup>

import { useAppStore } from '@/store/app'

// get the application state store
const store = useAppStore()

</script>