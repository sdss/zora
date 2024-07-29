<template>
    <!-- Add the Resolve Target Button below the AladinLite component -->
    <v-btn rounded="0" class='mt-2' color="primary-darken-1" @click="dialog = true" v-tippy="'Resolve target coordinates to within 3 arcmin using Simbad'">
        Resolve Target
    </v-btn>

    <!-- v-dialog for showing the resolution results -->
    <v-dialog v-model="dialog" scrollable width="auto">
        <v-card>
            <v-card-title>Resolved Targets <progress-circle :loading="loading"></progress-circle></v-card-title>
            <v-card-subtitle>within 3 arcmin</v-card-subtitle>
            <v-card-text>
                <v-banner v-if="err" class='ma-4' color="error" lines="one" icon="mdi-emoticon-sad">{{ err }}</v-banner>
                <v-data-table v-else :headers="header" :items="results" :items-per-page="50"
                >
                <!-- make the main id a simbad anchor -->
                <template v-slot:item.main_id="{ value }">
                    <a :href="`https://simbad.u-strasbg.fr/simbad/sim-id?Ident=${encodeURIComponent(value)}&submit=submit+id`" target="_blank">{{ value }}</a>
                </template>
                </v-data-table>
            </v-card-text>
            <v-card-actions>
                <v-btn prepend-icon='mdi-close' color="secondary" block @click="dialog = false">Close Dialog</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>

import { ref, defineProps, watch} from 'vue'
import axios from 'axios'
import ProgressCircle from '@/components/ProgressCircle.vue'

// define which properties are passed in from the parent, i.e. ":xxx"
const props = defineProps<{
    ra: Number,
    dec: Number
}>()

// parameters
let dialog = ref(false)
let header = ref([])
let results = ref([])
let err = ref(null)
let loading = ref(false)

header.value = [
    { title: "Main ID", key: "main_id" },
    { title: "RA", key: "ra" },
    { title: "Dec", key: "dec" },
    { title: "Distance [arcsec]", key: "distance_result.value" },
]

async function fetchResolutionResults() {
    // fetch the resolution results from Simbad via Valis
    err.value = null
    loading.value = true
    // resolve the target coordinates using the valis endpoint
    const url = import.meta.env.VITE_API_URL + `/target/resolve/coord?coord=${props.ra}&coord=${props.dec}&cunit=deg&radius=3&runit=arcmin`;

    await axios.get(url)
    .then((response) => {
        results.value = response.data
        loading.value = false
    })
    .catch((error) => {
        console.error("Axios fetch error: ", error);
        err.value = error.response.data.detail
        loading.value = false
    })
}

// create watcher for the dialog
watch(dialog, async (newVal) => {
    // watch for dialog changes and send request
    if (newVal) await fetchResolutionResults();
})


</script>