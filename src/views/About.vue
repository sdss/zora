<template>
    <v-container fluid>
      <!-- Introduction Section -->
      <v-row>
        <v-col cols="12">
          <h1>Welcome to Zora</h1>
          <p>This site provides exploration, access to the SDSS datasets, with a focus on new data from SDSS-V. Here's how you can make the most of it:</p>
        </v-col>
      </v-row>

      <!-- How to Use Section -->
      <v-row>
        <v-col cols="12">
            <v-expansion-panels>
            <v-expansion-panel
                title="Getting Started"
                text="Basic instructions on getting started with the website.">
            </v-expansion-panel>

            <v-expansion-panel
                title="Navigating the Data"
                text="Guidelines on how to navigate and access data.">
            </v-expansion-panel>

            <!-- Add more panels as needed -->
            </v-expansion-panels>
        </v-col>
      </v-row>

      <!-- Resource Links Section -->
      <v-row>
      <v-col cols="12">
        <h2>Resources</h2>
      </v-col>
      <v-col cols="12" sm="4" v-for="(resource, index) in resources" :key="index">
        <v-card color='primary-darken-1' class="custom-card-hover" link :href="resource.link" target="_blank">
          <v-card-title>{{ resource.title }}</v-card-title>
          <v-card-text>
            {{ resource.description }}
            <!-- <v-btn :href="resource.link" text>Learn More</v-btn> -->
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

      <!-- Contact Information -->
      <v-row>
        <v-col cols="12">
          <h2>Contact Us</h2>
          <p>For more information or assistance, contact the <a href="mailto:helpdesk@sdss.org">SDSS Helpdesk</a>.</p>
        </v-col>
      </v-row>
    </v-container>
  </template>

  <script lang="ts" setup>

import { ref, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import useStoredTheme from '@/composables/useTheme'

// mount the stored theme
useStoredTheme()

const theme = useTheme()

const resources = ref([
  {
    title: 'Data Access',
    description: 'Access SDSS data directly from the Science Archive Server',
    link: 'https://data.sdss.org/sas'
  },
  {
    title: 'Python Package Documentation',
    description: 'The POC sdss-brain package provides pythonic access to SDSS-V data products',
    link: 'https://sdss-brain.readthedocs.io/en/latest/'
  },
  {
    title: 'Valis Documentation',
    description: 'The FastAPI backend that powers this site.',
    link: import.meta.env.VITE_API_URL + '/docs'
  },
  // Add more resources as needed
])


const setBoxShadowColor = () => {
  const color = theme.current.value.dark ? 'var(--box-shadow-dark)' : 'var(--box-shadow-light)';
  document.documentElement.style.setProperty('--box-shadow-color', color);
}

onMounted(() => {
  setBoxShadowColor(); // Set the initial box-shadow color
})

watch(() => theme.current.value, () => {
  setBoxShadowColor(); // Update the box-shadow color when the theme changes
})

  // Your existing script
  </script>

  <style>
  /* Add any additional styling here if needed */
  :root {
  --box-shadow-light: 0px 4px 8px rgba(0, 0, 0, 0.6); /* Darker shadow for light theme */
  --box-shadow-dark: 0px 4px 8px rgba(255, 255, 255, 0.6); /* Lighter shadow for dark theme */
}

.custom-card-hover {
  transition: box-shadow 0.3s ease;
}

.custom-card-hover:hover {
  box-shadow: var(--box-shadow-color); /* Use the variable */
}
  </style>
