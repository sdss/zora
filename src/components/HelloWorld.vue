<template>
  <v-container class="fill-height" fluid>
    <v-responsive class="d-flex align-center text-center fill-height">
      <v-img height="300" src="@/assets/sdssv_logo.png" />

      <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>
      <h1 class="text-h2 font-weight-bold">SDSS</h1>

      <div class="py-14" />

      <v-row justify="center" class="d-flex align-stretch">
        <!-- Search Page Card -->
        <v-col cols="12" sm="6" md="4">
          <v-card class="pa-5 d-flex flex-column" hover>
            <v-card-title>Search</v-card-title>
            <v-card-text>
              Perform a quick cone search or go to the full search.
              <ConeSearch></ConeSearch>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" to="/search">Go to Full Search</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Target Investigation Card -->
        <v-col cols="12" sm="6" md="4">
          <v-card class="pa-5 d-flex flex-column align-stretch" hover style='height:100%'>
            <v-card-title>Know a SDSS target ID?</v-card-title>
            <v-card-text>
              Input the SDSS ID of your target to go directly there
              <v-select
                v-model="searchType"
                label="Search Type"
                :items="['id', 'altid']"
              ></v-select>
              <v-text-field class="pt-2"
                v-if="searchType === 'id'"
                label="Enter SDSS ID"
                outlined
                dense
                clearable
                v-model="targetId"
                placeholder="54459273"
                hint="Enter an sdss_id value"
                @keyup.enter="navigateToTarget"
              >
                <template v-slot:prepend>
                  <v-icon icon='mdi-help' size='small'
                  v-tippy="{content:'The SDSS ID is a unique identifier for a SDSS target matched across all observations and source catalogs',
                  placement:'left'}"></v-icon>
                </template>
                <template v-slot:append-inner>
                  <v-btn color="primary" @click="navigateToTarget">Go</v-btn>
                </template>
              </v-text-field>
              <v-text-field class="pt-2"
                v-if="searchType === 'altid'"
                label="Enter Alternative ID"
                outlined
                dense
                clearable
                v-model="altId"
                placeholder="apogee_id"
                hint="Enter an alternative identifier"
                :rules="altidRules"
                @keyup.enter="navigateToTarget"
              >
                <template v-slot:prepend>
                  <v-icon icon='mdi-help' size='small'
                  v-tippy="{content:'The alternative ID is a unique identifier for a target in an alternative catalog',
                  placement:'left'}"></v-icon>
                </template>
                <template v-slot:append-inner>
                  <v-btn color="primary" @click="navigateToTarget">Go</v-btn>
                </template>
              </v-text-field>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script lang="ts" setup>
// Script content

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ConeSearch from '@/components/ConeSearch.vue'
import useStoredTheme from '@/composables/useTheme'

// mount the stored theme
useStoredTheme()

const router = useRouter();
const targetId = ref('');
const altId = ref('');
const searchType = ref('id');

const altidRules = [
  (value: string) => !!value || 'Required field.',
  (value: string) => /^[a-zA-Z0-9-]+$/.test(value) || 'Only alphanumeric characters and hyphens are allowed.',
  (value: string) => /^[a-zA-Z0-9-]{1,50}$/.test(value) || 'Maximum length is 50 characters.',
];

const navigateToTarget = () => {
  if (searchType.value === 'id' && targetId.value) {
    router.push(`/target/${targetId.value}`);
  } else if (searchType.value === 'altid' && altId.value) {
    router.push(`/target/${altId.value}`);
  }
};

</script>
