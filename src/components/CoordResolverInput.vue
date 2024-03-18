<template>
  <v-text-field
    ref="resolverInput"
    v-model="searchStore.resolverName"
    label="Target name"
    placeholder="NGC 4395"
    hint="Enter a name of target"
    variant="outlined"
    density="default"
    :error="isErrorStatus"
    clearable
    @keydown.enter="searchStore.resolveName"
    @update:modelValue="searchStore.resetResolver"
  >
    <template v-slot:append>
      
      <v-btn
        :loading="searchStore.resolverIsLoading"
        @click="searchStore.resolveName"
        variant="outlined"
        rounded="5"
        class="mr-3"
        prepend-icon="mdi-magnify"
      >
        Resolve
      </v-btn>
      <v-btn-toggle
        v-model="searchStore.resolverServer"
        shaped
        mandatory
        divided
        density="compact"
        rounded="5">
          <v-tooltip
            text="Resolve name in CDS Simbad database"
            location="bottom"
          >
            <template v-slot:activator="{ props }">
              <v-btn value="simbad" v-bind="props">Simbad</v-btn>
            </template>
          </v-tooltip>
          <v-tooltip
            text="Resolve name in NASA/IPAC Extragalactic Database (NED) using CDS Sesame"
            location="bottom"
          >
            <template v-slot:activator="{ props }">
              <v-btn value="ned" v-bind="props">NED</v-btn>
            </template>
          </v-tooltip>          
      </v-btn-toggle>          
    </template>
    <template v-slot:details>{{ searchStore.resolverMessage }}</template>
  </v-text-field>
</template>

<script setup lang="ts">

import { computed } from 'vue'
import { useSearchStore } from '@/store/app'

// get the application state store and router
const searchStore = useSearchStore()
const isErrorStatus = computed(() => searchStore.resolverStatus == 'error')

</script>