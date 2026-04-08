<template>
    <!-- astra pipelines table -->
    <v-data-table-virtual
        :headers="headers"
        :items="pipelineItems"
        density="compact"
        fixed-header
    >
        <!-- Pipeline name with link -->
        <template v-slot:item.name="{ item }">
            <a :href="getPipelineUrl(item.name)" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
        </template>
        <!-- Show button column -->
        <template v-slot:item.actions="{ item }">
            <v-btn
                size="small"
                color="success"
                rounded="0"
                variant="tonal"
                @click="openDialog(item.name)"
            >
                Show
            </v-btn>
        </template>
    </v-data-table-virtual>

    <!-- astra pipeline details popup window -->
    <v-dialog v-model="dialog" max-width="600px" max-height="500px">
        <v-card class="d-flex flex-column">
            <v-card-title class="text-h6">
                <v-row no-gutters align="center">
                    <v-col>Pipeline: <a :href="getPipelineUrl(selected_pipeline)" target="_blank" rel="noopener noreferrer">{{ selected_pipeline }}</a></v-col>
                    <v-col text-end cols="auto">
                        <v-btn
                            density="compact"
                            color="secondary"
                            size="small"
                            icon="mdi-close"
                            @click="dialog = false"
                        ></v-btn>
                    </v-col>
                </v-row>
            </v-card-title>
            <v-card-subtitle class="d-flex align-center justify-space-between">
            <span>Target: {{ sdssid }}</span>
            <span>(Null values excluded from display)</span>
            </v-card-subtitle>
            <v-divider class="mb-0 mt-2"></v-divider>

            <v-card-text class="pa-0 ma-0" style="height: 500px; overflow: hidden;">
                <v-row no-gutters class="fill-height">
                    <v-col class="data-table-container">
                        <!-- Data Table -->
                        <v-data-table-virtual
                            :headers="contentHeaders"
                            :items="tableData"
                            height="500"
                            fixed-header
                        ></v-data-table-virtual>
                    </v-col>

                    <v-col cols="4" class="item-list-container">
                        <!-- List of Pipelines -->
                        <v-list
                            lines="one"
                            density="compact"
                            style="height: 100%; overflow-y: auto; padding-left: 0;"
                            border="sm"
                        >
                            <v-list-item
                                :border="index !== pipelines.length - 1 ? 'b' : ''"
                                v-for="(pipeline, index) in pipelines"
                                :key="index"
                                style="padding: 0;"
                            >
                                <v-list-item-title class="text-left">
                                    <v-btn
                                        color="primary"
                                        variant="plain"
                                        class="text-left"
                                        style="justify-content: flex-start; text-align: left;"
                                        @click="updateTable(pipeline)"
                                    >
                                        {{ pipeline }}
                                    </v-btn>
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axiosInstance from '@/axios'
import { useAppStore } from '@/store/app'

// get the application state store
const store = useAppStore()

// define which properties are passed in from the parent
const props = defineProps<{
    sdssid: string
    pipelines: string[]
}>()

let dialog = ref(false)
let selected_pipeline = ref('')
let local_cache = ref({})

const tableData = ref([])

const headers = [
    { title: 'Pipeline', key: 'name', width: '80%' },
    { title: 'Parameters', key: 'actions', sortable: false, width: '20%' }
]

const contentHeaders = [
    { title: 'Parameter', key: 'parameter' },
    { title: 'Value', key: 'value' }
]

const pipelineItems = computed(() => {
    return props.pipelines.map((pipeline) => ({ name: pipeline }))
})

// Custom pipeline name mappings for URL generation
const pipelineUrlMappings: Record<string, string> = {
    'the_payne': 'the-payne',
    'mwm_best': 'bestparams'
}

// Get base URL and path based on release
const baseUrlInfo = computed(() => {
    const release = store.release.toLowerCase()

    if (release === 'ipl4') {
        return {
            baseUrl: 'https://ipl4-sdssorg.pantheonsite.io/ipl4',
            path: 'mwm/astra/pipelines-in-astra'
        }
    } else {
        // Determine DR version for standard SDSS.org URLs
        let dr = 'dr19' // default
        if (release === 'ipl3' || release === 'work') {
            dr = 'dr19'
        } else if (release.startsWith('dr')) {
            dr = release
        }
        return {
            baseUrl: `https://www.sdss.org/${dr}`,
            path: 'mwm/astra/pipelines-in-astra'
        }
    }
})

// Transform pipeline name for URL
function transformPipelineName(pipeline: string): string {
    // Check for custom mappings first
    if (pipelineUrlMappings[pipeline]) {
        return pipelineUrlMappings[pipeline]
    }
    // Default: lowercase and remove hyphens/underscores
    return pipeline.toLowerCase().replace(/[-_]/g, '')
}

// Get full pipeline documentation URL
function getPipelineUrl(pipeline: string): string {
    const { baseUrl, path } = baseUrlInfo.value

    // Pipelines starting with "ferre" use the aspcap page
    if (pipeline.toLowerCase().startsWith('ferre')) {
        return `${baseUrl}/${path}/aspcap/`
    }

    if (pipeline.toLowerCase().startsWith('nmf_rect')) {
        return `${baseUrl}/mwm/astra/output-files/#spectrum_product`
    }

    const transformedName = transformPipelineName(pipeline)
    return `${baseUrl}/${path}/${transformedName}/`
}

// // Get base Astra pipelines URL
// const basePipelinesUrl = computed(() => {
//     const { baseUrl, path } = baseUrlInfo.value
//     return `${baseUrl}/${path}/`
// })

function openDialog(pipeline: string) {
    // open the pipeline dialog window on button click
    selected_pipeline.value = pipeline
    dialog.value = true
    getAstraPipelineData()
}

function updateTable(pipeline: string) {
    // update the table on pipeline selection
    selected_pipeline.value = pipeline
    getAstraPipelineData()
}

async function getAstraPipelineData() {
    // Populate table data with astra pipeline info for the given sdssid and pipeline name

    const url = `/target/astra/${selected_pipeline.value}/${props.sdssid}?release=${store.release}`

    // use local cache if available
    let data = get_or_update_cache(null)
    if (data) {
        tableData.value = data
        return
    }

    // fetch the astra pipeline data
    await axiosInstance.get(url, { headers: store.get_auth_hdr() })
        .then((response) => {
            // convert response data to an array of objects for the data table
            let data = Object.entries(response.data).map((item) => ({
                parameter: item[0],
                value: item[1]
            }))
            tableData.value = get_or_update_cache(data)
        })
        .catch((error) => {
            console.error('Axios fetch error: ', error)
            tableData.value = []
        })
}

function get_or_update_cache(data: any) {
    // get or update the local cache
    // add initial pipeline name
    if (!(selected_pipeline.value in local_cache.value)) {
        local_cache.value[selected_pipeline.value] = data
        return data
    } else {
        // get or update the cached data
        let cache = local_cache.value[selected_pipeline.value]
        if (cache === null) {
            local_cache.value[selected_pipeline.value] = data
            return data
        } else {
            return cache
        }
    }
}
</script>

<style>
.data-table-container {
    overflow-y: hidden;
    max-height: 100%;
}

.item-list-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}
</style>
