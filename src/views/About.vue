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
        <v-col cols="12" sm="4">
          <v-card color="indigo-lighten-1">
            <v-card-title>Data Access</v-card-title>
            <v-card-text>
              Description and link to data access.
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card variant="tonal" class="custom-card-hover">
            <v-card-title>Python Package Documentation</v-card-title>
            <v-card-text>
              Overview and link to Python documentation.
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="custom-card-hover">
            <v-card-title>FastAPI Documentation</v-card-title>
            <v-card-text>
              Details and link to FastAPI documentation.
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
      <v-col cols="12">
        <h2>Resources</h2>
      </v-col>
      <v-col cols="12" sm="4" v-for="(resource, index) in resources" :key="index">
        <v-card color='secondary-darken-1' class="custom-card-hover">
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

import { ref } from 'vue'

const resources = ref([
  {
    title: 'Data Access',
    description: 'Description and link to data access.',
    link: 'http://example.com/data-access'
  },
  {
    title: 'Python Package Documentation',
    description: 'Overview and link to Python documentation.',
    link: 'http://example.com/python-docs'
  },
  {
    title: 'FastAPI Documentation',
    description: 'Details and link to FastAPI documentation.',
    link: 'http://example.com/fastapi-docs'
  },
  // Add more resources as needed
]);

  // Your existing script
  </script>

  <style>
  /* Add any additional styling here if needed */
  .custom-card-hover:hover {
  background-color: rgba(255, 255, 255, 0.1); /* Lighter shade on hover */
  /* Optionally, add a shadow or border for more emphasis */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
  </style>
