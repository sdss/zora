<template>
    <v-container fluid>
        <v-row v-if="missingId">
            <v-col md='12'>
                <v-banner type="warning" class='ma-4' color="warning" lines="one" icon="mdi-emoticon-confused"><v-banner-text>No target ID specified in URL.</v-banner-text></v-banner>
            </v-col>
        </v-row>
        <v-row v-else>
            <v-col md="3">
                <h1> SDSS ID: {{ sdss_id }}</h1>
                <v-img :width="300" cover class="bg-grey-lighten-2" src="https://picsum.photos/200"></v-img>
            </v-col>
            <v-col md="9">
                <v-card>
                    <v-tabs v-model="tab" color="secondary">
                        <v-tab value="meta">Metadata</v-tab>
                        <v-tab value="sources">Sources</v-tab>
                    </v-tabs>

                    <v-card-text>
                    <v-window v-model="tab">
                        <v-window-item key="meta" value="meta">
                            <v-progress-linear v-if="loading" indeterminate color="blue-lighten-3" ></v-progress-linear>
                            <v-card v-else>
                                <v-banner v-if="nodata" type="warning" class='ma-4' color="warning" lines="one" icon="mdi-emoticon-confused"><v-banner-text>No target information for release {{ store.release }}</v-banner-text></v-banner>
                                <v-table v-else density="compact">
                                    <thead>
                                    <tr>
                                        <th class="text-left">Parameter</th>
                                        <th class="text-left">Value</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr
                                        v-for="item, key in metadata"
                                        :key="key">
                                        <td>{{ key }}</td>
                                        <td>{{ item }}</td>
                                    </tr>
                                    </tbody>
                                </v-table>
                            </v-card>
                        </v-window-item>
                        <v-window-item key="sources" value="sources">Two</v-window-item>
                    </v-window>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

    </v-container>
</template>

<script setup lang="ts">

import axios from 'axios'
import { useAppStore } from '@/store/app'
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

// get the application state store and router
const store = useAppStore()
const route = useRoute()

const sdss_id = route.params.sdss_id
const missingId = !sdss_id
const tab = ref(null)
let nodata = ref(false)
let loading = ref(true)
let metadata = ref({})

async function get_target() {
    // get the target pipeline info from valis
    let rel = "IPL3"
    await axios.get(import.meta.env.VITE_API_URL + `/target/ids/23326?release=${rel}`, )
        .then((response) => {
            console.log('target data', response.data)
            nodata.value = Object.keys(response.data).length === 0
            loading.value = false
            console.log("nodata", nodata.value)
            metadata.value = response.data
        })
        .catch((error) => {
            console.error(error.toJSON())
        })
}

onMounted(() => {
    // get the available target info
    get_target()
})
</script>