<template>
    <v-form ref="form" @submit.prevent="onSearch">
    <v-text-field class="pt-2"
      label="Quick Cone Search"
      v-model="searchQuery"
      placeholder="315.014, 35.299, 0.1d"
      hint="Enter an RA, Dec, and optional radius"
      :rules="validationRules"
      @input="validate"
      clearable
      validate-on-blur="true"
      @click:clear="onClear"
      >
      <template v-slot:prepend>
        <v-icon icon='mdi-help' size='small'
        v-tippy="{content:'Enter a RA, Dec coordinate (degrees), and optional radius, in format: [ra],[dec],[number][d/m/s]. Default radius is 0.1 degree.',
        placement:'left'}"></v-icon>
      </template>
      <template v-slot:append-inner>
        <v-btn
        :color="isValid ? 'primary' : 'red'"
        :disabled="!isValid"
        @click="onSearch">Go
        <progress-circle :loading="loading"></progress-circle>
        </v-btn>
      </template>
    </v-text-field>
    </v-form>
</template>

<script lang="ts" setup>

import { ref, Ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'
import ProgressCircle from '@/components/ProgressCircle.vue'

// get the application state store and router
const store = useAppStore()
const router = useRouter()

const searchQuery: Ref<string> = ref('')

const validationRules = [
    (v: string) => validateInput(v) || 'Input format is incorrect'
];

// parameters
let form = ref(null)
let isValid = ref(false)
let loading = ref(false)
let regex = /^(\d+(?:\.\d+)?|\d{1,2}d\s\d{1,2}m\s\d{1,2}(?:\.\d+)?s)(,|\s)+([+-]?\d+(?:\.\d+)?|[+-]?\d{1,2}h\s\d{1,2}m\s\d{1,2}(?:\.\d+)?s)(?:(,|\s)+(\d+(?:\.\d+)?[dms]))?$/


function validate() {
    // check the validation rules
    isValid.value = validationRules.every(rule => rule(searchQuery.value) === true)
}

function validateInput(value: string): boolean {
    // validate the input string
    return regex.test(value);
}

function onClear() {
    // clear the search query
    searchQuery.value = '';
    isValid.value = false;
    form.value.reset();
}


async function onSearch(): Promise<void> {
    // perform the search
    if (isValid.value) {
        const [ra, dec, radius] = parseInput(searchQuery.value);
        if (ra && dec && radius) {
        await callApi(ra, dec, radius);
        }
    }
}


function parseInput(input: string): [string, string, { radius: number, units: string }] | [] {
    // parse the input string into RA, Dec, and radius
    const match = input.match(regex);
    if (!match) return [];

    let [ra, gap1, dec, gap2, radiusStr = "0.1d"] = match.slice(1);
    let units = 'degree';
    if (radiusStr.endsWith('m')) {
        units = 'arcmin';
    } else if (radiusStr.endsWith('s')) {
        units = 'arcsec';
    }
    const radius = parseFloat(radiusStr);

    return [ra, dec, { radius, units }];
}

async function callApi(ra: string, dec: string, { radius, units }: { radius: number, units: string }): Promise<void> {
    // perform the cone search API call

    // turn on loading flag
    loading.value = true;
    const endpoint = import.meta.env.VITE_API_URL + `/query/cone?ra=${ra}&dec=${dec}&radius=${radius}&units=${units}&release=${store.release}`;
    await axios.get(endpoint, {headers: store.get_auth_hdr()})
        .then(response => {
        // Handle the response data

        // store the search results
        store.save_search_results(response.data);

        // call done; turn off loading flag
        loading.value = false;

        // Use Vue Router to navigate to the "results" page and pass the data as a route parameter
        router.push({ name: 'Results' });
        })
        .catch(error => {
        // Handle the error
        console.error('API call error:', error)
        });
}
</script>
