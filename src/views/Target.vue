<template>
    <v-container fluid>
        <v-row v-if="missingId">
            <v-col md='12'>
                <v-banner type="warning" class='ma-4' color="warning" lines="one" icon="mdi-emoticon-confused"><v-banner-text>No target ID specified in URL.</v-banner-text></v-banner>
            </v-col>
        </v-row>
        <!-- target information panel -->
        <v-row v-else>
            <v-col md="3">
                <h1> SDSS ID: {{ sdss_id }}</h1>
                <p v-if="!loading">
                    <span class="font-weight-bold">RA, Dec:</span>
                    {{ formatNumber(metadata.ra_sdss_id, 5) }}, {{ formatNumber(metadata.dec_sdss_id, 5) }}
                </p>
                <v-skeleton-loader v-if="loading" type="card"></v-skeleton-loader>
                <aladin-lite v-else :ra="metadata.ra_sdss_id" :dec="metadata.dec_sdss_id"></aladin-lite>

                <div class="d-flex flex-column">
                    <v-btn rounded="0" class='mt-2' color="orange-darken-1" v-tippy="'Go to target in the Sky View'" @click="gotoExplore">Explore on Sky</v-btn>
                    <target-resolver :ra="metadata.ra_sdss_id" :dec="metadata.dec_sdss_id"></target-resolver>
                    <data-download v-if="has_files" :files="files"></data-download>
                </div>
            </v-col>

            <!-- tabbed metadata panels -->
            <v-col md="9">
                <v-card>
                    <v-tabs v-model="tab" color="secondary">
                        <v-tab value="meta">Metadata</v-tab>
                        <v-tab value="sources">Sources</v-tab>
                        <v-tab value="cartons">Cartons</v-tab>
                    </v-tabs>

                    <v-card-text>

                        <v-window v-model="tab">
                        <!-- metadata tab -->
                        <v-window-item key="meta" value="meta">
                            <v-progress-linear v-if="loading && !iserror" indeterminate color="blue-lighten-3" ></v-progress-linear>
                            <v-card v-else>
                                <v-banner v-if="nodata" type="warning" class='ma-4' color="warning" lines="one" icon="mdi-emoticon-confused"><v-banner-text>No target information for release {{ store.release }}</v-banner-text></v-banner>
                                <v-banner v-else-if="iserror" type="error" class='ma-4' color="error" lines="one" icon="mdi-emoticon-confused"><v-banner-text>{{ iserror }}</v-banner-text></v-banner>
                                <v-expansion-panels v-else v-model="panels">

                                    <v-expansion-panel title="Basic Info">
                                        <v-expansion-panel-text>
                                            <v-data-table-virtual :headers="headmeta" :items="convert_to_table(metadata, 'vizdb')" density="compact">
                                                <template v-slot:item.display_name="{ item }">
                                                    <p v-tippy="item.description">{{ item.display_name }}</p>
                                                </template>
                                            </v-data-table-virtual>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>

                                    <!-- boss drp info -->
                                    <v-expansion-panel title="Boss Pipeline Info">
                                        <v-expansion-panel-text>
                                            <v-data-table-virtual :items="convert_to_table(pipelines.boss, 'boss_drp')" density="compact">
                                                <template v-slot:item.display_name="{ item }">
                                                    <p v-tippy="item.description">{{ item.display_name }}</p>
                                                </template>
                                            </v-data-table-virtual>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                    <!-- apogee drp info -->
                                    <v-expansion-panel title="Apogee Pipeline Info">
                                        <v-expansion-panel-text>
                                            <v-data-table-virtual :items="convert_object(pipelines.apogee)" density="compact"></v-data-table-virtual>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                    <!-- astra drp info -->
                                    <v-expansion-panel title="Astra Pipeline Info">
                                        <v-expansion-panel-text>
                                            <v-data-table-virtual :items="convert_object(pipelines.astra)" density="compact"></v-data-table-virtual>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                </v-expansion-panels>

                            </v-card>
                        </v-window-item>

                        <!-- sources tab -->
                        <v-window-item key="sources" value="sources">
                            <v-data-table :items="sources" :headers="head" density="compact" :row-props="highlightRow">
                                <!-- parent catalog menu item -->
                                <template v-slot:item.parent_catalogs="{ item }">
                                    <parent-catalog :sdssid="sdss_id" :catalogid="item.catalogid" :catalogs="item.parent_catalogs"></parent-catalog>
                                </template>
                                <!-- icon for observed catalogids -->
                                <template  v-slot:item.icon="{ item }">
                                    <v-icon v-if="isHighlighted(item)" color="primary" v-tippy="'This catalogid has been observed.'">
                                        mdi-check
                                    </v-icon>
                                </template>

                            </v-data-table>
                        </v-window-item>

                        <!-- cartons tab -->
                        <v-window-item key="cartons" value="cartons">
                            <v-data-table :items="carts" :headers="headcart" density="compact" :sort-by="cartSort"></v-data-table>
                        </v-window-item>
                    </v-window>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- spectral display -->
        <v-row>
            <v-col md="12" class="solara-con">
                <v-skeleton-loader v-if="loading" type="card"></v-skeleton-loader>
                <v-banner v-else-if="!store.is_allowed()" type="warning" class='ma-4' color="warning" lines="one" icon="mdi-emoticon-confused"><v-banner-text>User not allowed to access spectra data.</v-banner-text></v-banner>
                <v-banner v-else-if="!has_files" type="warning" class='ma-4' color="warning" lines="one" icon="mdi-emoticon-cry"><v-banner-text>No spectral data available to load.</v-banner-text></v-banner>
                <Solara v-else :sdssid="sdss_id" :files="files"></Solara>
            </v-col>
        </v-row>

    </v-container>
</template>

<script setup lang="ts">

import { useAppStore } from '@/store/app'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

import Solara from '@/components/Solara.vue'
import AladinLite from '@/components/AladinLite.vue'
import TargetResolver from '@/components/TargetResolver.vue'
import DataDownload from '@/components/DataDownload.vue'
import useStoredTheme from '@/composables/useTheme'
import ParentCatalog from '@/components/ParentCatalog.vue'

import axiosInstance from '@/axios'

// get the application state store and router
const store = useAppStore()
const route = useRoute()
const router = useRouter()

// mount the stored theme
useStoredTheme()

const sdss_id = route.params.sdss_id
const missingId = !sdss_id
const tab = ref(null)
let nodata = ref(false)
let iserror = ref(false)
let loading = ref(true)
let metadata = ref({})
let sources = ref([])
let carts = ref([])
let pipelines = ref({})
let cartSort = [{ key: 'run_on', order: 'desc' }]
let panels = ref([0])
let files = ref([])
let has_files = ref(false)

let head = [
    { title: '', key:'icon', value: 'icon', sortable: false },
    {key: 'catalogid', title: 'CatalogID'},
    {key: 'version', title: 'Version'},
    {key: 'lead', title: 'Lead'},
    {key: 'ra_catalogid', title: 'RA'},
    {key: 'dec_catalogid', title: 'Dec'},
    {key: 'n_associated', title: 'N_Associated'},
    {key: 'parent_catalogs', title: 'Parent Catalogs'},
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

    let rel = "IPL3"

    // set up API call endpoints
    let endpoints = [
        `/target/ids/${sdss_id}?release=${rel}`,
        `/target/cartons/${sdss_id}?release=${rel}`,
        `/target/catalogs/${sdss_id}?release=${rel}`,
        `/target/pipelines/${sdss_id}?release=${rel}`
        ]

    // await the promises
    await Promise.all(endpoints.map((endpoint) => axiosInstance.get(endpoint)))
    .then(([{data: target}, {data: cartons}, {data: catalogs}, {data: pipes}] )=> {
      console.log({ target, cartons, catalogs, pipes })
      loading.value = false
      nodata.value = Object.keys(target).length === 0
      metadata.value = target
      carts.value = cartons
      sources.value = catalogs
      pipelines.value = pipes
      files.value = Object.values(pipes.files)
        .flatMap(value => Array.isArray(value) ? value : [value])
        .filter(filePath => filePath && filePath.trim() !== '');
      console.log('files', files.value, files.value.length)
      has_files.value = check_files(files.value)
      console.log('has_files', has_files.value)
      console.timeEnd('Info Time')
    })
    .catch((error) => {
        console.error(error.toJSON().message)
        let msg = error.toJSON().message
        if (msg == 'Network Error') {
            msg = 'Network Error: error connecting to backend server.'
        }
        iserror.value = msg
    })
}

function check_files(data) {
    // check if the files array is empty or not
    let empty = data.length == 0 || (data.length == 1 && data.includes(''))
    return empty ? false : true
}

function convert_object( metadata) {
    // temp function for converting to table
    return Object.entries(metadata).map(([key, value]) => ({ key, value }))
}

function convert_to_table(dataObject, name) {
    // convert target data to v-data-table items with db metadata
    return Object.entries(dataObject).map(([key, value]) => {
        const mapping = store.get_obj_from_db(key, {'schema': name})
        return {
            display_name: mapping?.display_name || '',
            column_name: mapping?.column_name || key,
            value: value,
            description: mapping?.description || ''
        }
    })
}

function gotoExplore() {
    // navigate to the explore page, open in a new tab
    const routeData = router.resolve({ name: 'explore', query: { ra: metadata.value.ra_sdss_id, dec: metadata.value.dec_sdss_id }})
    window.open(routeData.href, '_blank')
}

function highlightRow(item) {
    // highlight rows in the source catalog table for observed catalogids
    let catids = Object.values(pipelines.value)
        .map(ii => ii.catalogid)
        .filter(catalogid => catalogid !== undefined).map(id => id.c.join(''))

    if (catids.includes(item.item.catalogid.toString())) {
        return {'class': 'highlighted-row'}
    }
}

function isHighlighted(item) {
    // add a checkbox to an observed catalogid in the source catalog table
    let catids = Object.values(pipelines.value)
        .map(ii => ii.catalogid)
        .filter(catalogid => catalogid !== undefined).map(id => id.c.join(''))
    return catids.includes(item.catalogid.toString()) // === 4295574590
}



onMounted(() => {
    // get database info
    store.get_db_info()

    // get the available target info
    get_target_info()
})
</script>


<style>
.v-theme--light .highlighted-row {
  background-color: rgba(0, 0, 0, 0.05) !important; /* Darker shade in light theme */
}

.v-theme--dark .highlighted-row {
  background-color: rgba(255, 255, 255, 0.1) !important; /* Lighter shade in dark theme */
}
</style>