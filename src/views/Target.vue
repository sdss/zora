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
                <p v-if="!loading">
                    <span class="font-weight-bold">RA, Dec:</span>
                    {{ formatNumber(metadata.ra_sdss_id, 5) }}, {{ formatNumber(metadata.dec_sdss_id, 5) }}
                </p>
                <v-img :width="300" cover class="bg-grey-lighten-2" src="https://picsum.photos/200"></v-img>
            </v-col>
            <v-col md="9">
                <v-card>
                    <v-tabs v-model="tab" color="secondary">
                        <v-tab value="meta">Metadata</v-tab>
                        <v-tab value="sources">Sources</v-tab>
                        <v-tab value="cartons">Cartons</v-tab>
                    </v-tabs>

                    <v-card-text>

                        <v-window v-model="tab">
                        <v-window-item key="meta" value="meta">
                            <v-progress-linear v-if="loading" indeterminate color="blue-lighten-3" ></v-progress-linear>
                            <v-card v-else>
                                <v-banner v-if="nodata" type="warning" class='ma-4' color="warning" lines="one" icon="mdi-emoticon-confused"><v-banner-text>No target information for release {{ store.release }}</v-banner-text></v-banner>

                                <v-expansion-panels v-else, v-model="panels">

                                    <v-expansion-panel title="Basic Info">
                                        <v-expansion-panel-text>
                                            <v-data-table-virtual :headers="headmeta" :items="convert_to_table(metadata, 'vizdb')" density="compact">
                                                <template v-slot:item.display_name="{ item }">
                                                    <p v-tippy="item.description">{{ item.display_name }}</p>
                                                </template>
                                            </v-data-table-virtual>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>

                                    <v-expansion-panel title="Boss Pipeline Info">
                                        <v-expansion-panel-text>
                                            <v-data-table-virtual :items="convert_object(pipelines.boss)" density="compact"></v-data-table-virtual>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                    <v-expansion-panel title="Apogee Pipeline Info">
                                        <v-expansion-panel-text>
                                            <v-data-table-virtual :items="convert_object(pipelines.apogee)" density="compact"></v-data-table-virtual>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                    <v-expansion-panel title="Astra Pipeline Info">
                                        <v-expansion-panel-text>
                                            <v-data-table-virtual :items="convert_object(pipelines.astra)" density="compact"></v-data-table-virtual>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                </v-expansion-panels>

                            </v-card>
                        </v-window-item>

                        <v-window-item key="sources" value="sources">
                            <v-data-table :items="sources" :headers="head" density="compact"></v-data-table>
                        </v-window-item>

                        <v-window-item key="cartons" value="cartons">
                            <v-data-table :items="carts" :headers="headcart" density="compact" :sort-by="cartSort"></v-data-table>
                        </v-window-item>
                    </v-window>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col md="12">
                <v-skeleton-loader type="card"></v-skeleton-loader>
            </v-col>
        </v-row>

    </v-container>
</template>

<script setup lang="ts">

import axios from 'axios'
import { useAppStore } from '@/store/app'
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import JSONbig from 'json-big'

// get the application state store and router
const store = useAppStore()
const route = useRoute()

const sdss_id = route.params.sdss_id
const missingId = !sdss_id
const tab = ref(null)
let nodata = ref(false)
let loading = ref(true)
let metadata = ref({})
let sources = ref([])
let carts = ref([])
let pipelines = ref({})
let cartSort = [{ key: 'run_on', order: 'desc' }]
let panels = ref([0])

let head = [
    {key: 'catalogid', title: 'CatalogID'},
    {key: 'version', title: 'Version'},
    {key: 'lead', title: 'Lead'},
    {key: 'ra_catalogid', title: 'RA'},
    {key: 'dec_catalogid', title: 'Dec'},
    {key: 'n_associated', title: 'N_Associated'}
]

function formatNumber (num, digit) {
    if (num == null) {
        return num
    }
    return parseFloat(num).toFixed(digit)
}

let headcart = [
    {key: 'catalogid', title: 'Catalog ID'},
    {key: 'carton', title: 'Carton'},
    {key: 'epoch', title: 'Epoch'},
    {key: 'program', title: 'Program'},
    {key: 'category', title: 'Category'},
    {key: 'run_on', title: 'Date Run On'},
]

let headmeta = [
    {key: 'display_name', title: 'Display Name'},
    {key: 'column_name', title: 'Column Name'},
    {key: 'value', title: 'Value'},
]

async function get_target_info() {
    console.time('Info Time');

    //let sdss_id = 23326
    let rel = "IPL3"

    // set up API call endpoints
    let endpoints = [
        import.meta.env.VITE_API_URL + `/target/ids/${sdss_id}?release=${rel}`,
        import.meta.env.VITE_API_URL + `/target/cartons/${sdss_id}?release=${rel}`,
        import.meta.env.VITE_API_URL + `/target/catalogs/${sdss_id}?release=${rel}`,
        import.meta.env.VITE_API_URL + `/target/pipelines/${sdss_id}?release=${rel}`
        ]

    // axios config
    // see https://axios-http.com/docs/req_config
    const config = {
        transformResponse: [function transform(data) {
            // Replacing the default transformResponse in axios because this uses JSON.parse and causes problems
            // with precision of big numbers.
            if (typeof data === 'string') {
                try {
                    data = JSONbig.parse(data);
                } catch (e) { /* Ignore */ }
            }
            return data
        }],
    }

    // await the promises
    await Promise.all(endpoints.map((endpoint) => axios.get(endpoint, config)))
    .then(([{data: target}, {data: cartons}, {data: catalogs}, {data: pipes}] )=> {
      console.log({ target, cartons, catalogs, pipes });
      loading.value = false
      nodata.value = Object.keys(target).length === 0
      metadata.value = target
      carts.value = cartons
      sources.value = catalogs
      pipelines.value = pipes
      console.timeEnd('Info Time');
    })
    .catch((error) => {
        console.error(error.toJSON().message)
    })
}

async function get_db_info() {

    if (Object.keys(store.db_info).length !== 0) {
        console.log('db info already loaded')
        return
    }

    await axios.get(import.meta.env.VITE_API_URL + '/info/database')
        .then((response) => {
            console.log('db info', response.data)
            // store the db metadata
            store.db_info = response.data
        })
        .catch((error) => {
            console.error(error.toJSON())
        })
}

function convert_object( metadata) {
    // temp function for converting to table
    return Object.entries(metadata).map(([key, value]) => ({ key, value }))
}

function convert_to_table(dataObject, name) {
    // convert target data to v-data-table items with db metadata
    let mappingObject = store.db_info[name]
    return Object.entries(dataObject).map(([key, value]) => {
        //const mapping = Object.values(mappingObject).find(db => db[key])?.[key];
        const mapping = mappingObject[key]
        return {
            display_name: mapping?.display_name || '',
            column_name: mapping?.column_name || key,
            value: value,
            description: mapping?.description || ''

        }
    })
}

onMounted(() => {
    // get database info
    get_db_info()

    // get the available target info
    get_target_info()
})
</script>