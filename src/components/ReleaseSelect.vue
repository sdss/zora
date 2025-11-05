<template>
  <v-autocomplete
    id="release"
    v-model="store.release"
    :items="items"
    :rules="required"
    label="Data Release"
    density="compact"
    hide-details="auto"
    @update:modelValue="store.update_release"
  ></v-autocomplete>
</template>

<script lang="ts" setup>
// this is using the compositional api
// see https://vuejs.org/guide/introduction.html#api-styles
// and https://vuejs.org/api/sfc-script-setup.html

import { computed } from 'vue'
import axios from 'axios'
import { onMounted } from 'vue'
import { useAppStore } from '@/store/app'

// get the application state store
const store = useAppStore()

// mount data, "ref" marks the data as reactive
//const select = ref('select a data release')

// create release items as a computed ref
let items = computed(() => {
  return store.get_releases()
})

// set select rules
let required = [
    (value: string) => !!value || 'Release required.',
                ]

async function get_releases() {
    // commenting out this cache check to always get new releases
    // creates 2 calls
    // if (Object.keys(store.all_releases).length !== 0) {
    //       console.log('releases already stored')
    //       return
    //   }

    // function to get the data release from Valis
    // using public = false and a hard-coded public release to get all releases
    await axios.get(import.meta.env.VITE_API_URL + '/envs/releases?public=False&release=DR17')
        .then((response) => {
            console.log('resp data', response.data)
            // remove the MPLs and work release
            let rels = response.data.filter((rel: string) => !rel.startsWith("M") && !rel.startsWith("W")).reverse()
            // remove the older DRs for now;
            rels = rels.filter((rel: string) => rel.startsWith("DR") ? parseInt(rel.slice(2)) >= 19 : rel)
            // filter out all IPL except >= IPL3 from rels
            rels = rels.filter((rel: string) => rel.startsWith("IPL") ? parseInt(rel.slice(3)) >= 3 : rel)
            // store the releases and check for selection
            store.all_releases = rels
            store.check_release()
        })
        .catch((error) => {
            console.error(error.toJSON())
        })
}


// Vue mounted lifecyle hook, i.e. when the component is mounted to the DOM
// see https://vuejs.org/guide/essentials/lifecycle.html
onMounted(() => {
    // get the available data releases
    get_releases()
})

</script>

<style>

</style>
