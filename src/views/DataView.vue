<template>
  <v-row class="fill-height">
    <v-col md="12" class="d-flex flex-column">
      <!-- Banner -->
      <v-banner
        v-if="store.release !== 'IPL3'"
        class="ma-4"
        color="error"
        lines="one"
        icon="mdi-emoticon-sad"
      >
        <v-banner-text>
          The DataView dashboard is only available for IPL-3.
        </v-banner-text>
      </v-banner>

      <!-- Content -->
      <div v-else id="solara-dataview" class="flex-grow-1">
        <iframe
          id="iframe"
          :src="url"
          width="100%"
          height="100%"
          style="border: none;"
          title="Solara app running Explorer Dashboard"
          frameborder="0"
          ref="iframe"
        ></iframe>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">

import { ref, watch } from 'vue'
import { useAppStore } from '@/store/app'
import useStoredTheme from '@/composables/useTheme'

// mount the stored theme
useStoredTheme()

// get the application state store and router
const store = useAppStore()

let iframe = ref(null)
let url = ref(import.meta.env.VITE_API_URL + `/solara/dashboard?theme=${store.theme}`)

// create watcher for the theme
watch(() => store.theme, (newVal) => {
    // watch for theme changes and send request
    if (iframe.value && iframe.value.contentWindow) {
        iframe.value.contentWindow.postMessage({type: 'themeChange', theme: newVal}, '*')
    }
})

</script>