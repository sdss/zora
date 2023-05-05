<template>
  <v-autocomplete
    class="release-select"
    v-model="select"
    :items="items"
    label="Data Release"
    density="compact"
    hide-details="auto"
    @update:modelValue="update_release"
  ></v-autocomplete>
</template>

<script lang="ts" setup>
// this is using the compositional api
// see https://vuejs.org/guide/introduction.html#api-styles
// and https://vuejs.org/api/sfc-script-setup.html

import { ref } from 'vue'
import axios from 'axios'
import { onMounted } from 'vue'
import { useAppStore } from '@/store/app'

// get the application state store
const store = useAppStore()

// mount data, "ref" marks the data as reactive
const select = ref('select a data release')
let items = ref([])

async function get_releases() {
    // function to get the data release from VALIS
    // using public = false and a hard-coded public release to get all releases
    await axios.get('http://localhost:8000/envs/releases?public=False&release=DR17')
        .then((response) => {
            console.log(response)
            console.log(response.data)
            // remove the MPLs
            let rels = response.data.filter((rel: string) => !rel.startsWith("M")).reverse()
            items.value = rels
        })
        .catch((error) => {
            console.error(error.toJSON())
            items.value = []
        })
}

function update_release(release: string) {
    // update the app store with the selected data release
    store.release = release
    console.log('updating release', release)
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
