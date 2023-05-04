<template>
  <v-select
    class="release-select"
    v-model="select"
    :items="items"
    label="Data Release"
    density="compact"
    hide-details="auto"
  ></v-select>
</template>

<script lang="ts" setup>
// this is using the compositional api
// see https://vuejs.org/guide/introduction.html#api-styles
// and https://vuejs.org/api/sfc-script-setup.html

import { ref } from 'vue'
import axios from 'axios'
import { onMounted } from 'vue'

const select = ref('select a data release')
let items = ref([])

async function get_releases() {
    // function to get the data release from VALIS
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

// Vue mounted lifecyle hook, i.e. when the component is mounted to the DOM
// see https://vuejs.org/guide/essentials/lifecycle.html
onMounted(() => {
    get_releases()
})

</script>

<style>
.release-select {
    width: 10px
}
</style>
