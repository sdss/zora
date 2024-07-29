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
            <v-expansion-panels :value="0">
            <v-expansion-panel
                title="Getting Started"
                text="Basic instructions on getting started with the website.">
                <template v-slot:text>
                  <v-card flat>
                    <v-card-text>
                      <p class="mb-4">This guide will help you get started with the main features and functionalities.</p>

                      <h3 class="text-h6 mb-2">Key Features</h3>
                      <ul class="mb-4">
                        <li>Home: Quick access to sky cone search and specific SDSS target id searches</li>
                        <li>Search: A more advanced form search of targets in SDSS-V.</li>
                        <li>Investigate a Target: See detailed target information and explore its spectra with Jdaviz, a quicklook visualization and analysis tool</li>
                        <li>Sky Explorer: Explore SDSS targets on the sky using Aladin-Lite, and overlay with other surveys</li>
                        <li>Parameter Exploration: Drill down into SDSS output pipeline parameters with the DataView dashboard</li>
                      </ul>

                      <p class="mb-4">Many elements will display contextual information upon hovering to
                        help guide you. Additionally, wherever you see the <v-icon size="x-small">mdi-help</v-icon> icon, hover over it to display extra help.</p>

                    </v-card-text>
                  </v-card>
                </template>
              </v-expansion-panel>

            <v-expansion-panel
                title="Navigating the Data"
                text="Guidelines on how to navigate and access data.">
                <template v-slot:text>
                  <v-card flat>
                    <v-card-text>
                      <h3 class="text-h6 mb-2">Selecting a Data Release</h3>
                      <p class="mb-4">Use the Data Release dropdown in the appbar (top right) to select a public SDSS data release.
                        To select an internal public launch (IPL) for proprietary data, you must first login with your SDSS user credentials.</p>

                      <h3 class="text-h6 mb-2">Downloading Data</h3>
                      <p class="mb-4">You can download individual spectra for SDSS targets using the Download Data dropdown from a target page.
                        Download options are available for wget, rsync, and sdss_access.  For bulk data downloads, use sdss_access directly.</p>

                      <h3 class="text-h6 mb-2">Search for data</h3>
                      <p class="mb-4">Use the advanced search form page to look for data.  From there,
                        download the table of results, or click on each target for detailed investigation.</p>

                      <h3 class="text-h6 mb-2">Visualizing Data</h3>
                      <p class="mb-4">To explore and visualize data, you can</p>
                      <ul>
                        <li>Perform spectral quicklook and analysis with Jdaviz from the target page</li>
                        <li>Investigate SDSS pipeline parameters, on the whole dataset, from the DataView page</li>
                        <li>Explore SDSS targets on sky, along with other surveys, from the Sky Explorer page</li>
                      </ul>

                    </v-card-text>
                  </v-card>
                </template>
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
    description: 'The proof-of-concept sdss-brain package provides pythonic access to SDSS-V data products',
    link: 'https://sdss-brain.readthedocs.io/en/latest/'
  },
  {
    title: 'Valis Documentation',
    description: 'The FastAPI backend that powers this site. Use Valis for programmatic access to SDSS data.',
    link: import.meta.env.VITE_API_URL + '/docs'
  },
  {
    title: 'SDSS Website',
    description: 'The official SDSS public home',
    link: 'https://sdss.org/'
  },
  {
    title: 'SDSS SkyServer',
    description: 'Access SDSS catalog data through web services',
    link: 'https://skyserver.sdss.org/'
  },
  {
    title: 'SciServer',
    description: 'Access SDSS data in the SciServer science platform',
    link: 'https://www.sciserver.org/'
  }
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
