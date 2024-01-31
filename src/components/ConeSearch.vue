<template>
    <v-text-field class="pt-2"
      label="Quick Cone Search"
      v-model="searchQuery"
      placeholder="315.014, 35.299, 0.1d"
      hint="Enter a RA, Dec, radius"
      :rules="validationRules"
      @input="validate"
      clearable
      validate-on-blur="true"
      @keyup.enter="onSearch"
      >
      <template v-slot:prepend>
        <v-icon icon='mdi-help' size='small'
        v-tippy="{content:'Enter a RA, Dec coordinate and optional radius, in format: [number][d/m/s]',
        placement:'left'}"></v-icon>
      </template>
      <template v-slot:append-inner>
        <v-btn
        :color="isValid ? 'primary' : 'red'"
        :disabled="!isValid"
        @click="onSearch">Go</v-btn>
      </template>
    </v-text-field>
</template>

<script lang="ts" setup>

import { ref, Ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'

// get the application state store and router
const store = useAppStore()
const router = useRouter()

const searchQuery: Ref<string> = ref('')

const validationRules = [
    (v: string) => validateInput(v) || 'Input format is incorrect'
];

let isValid = ref(false)


function validate() {
    isValid.value = validationRules.every(rule => rule(searchQuery.value) === true)
}

function validateInput(value: string): boolean {
    const regex = /^(\d+(?:\.\d+)?|\d{1,2}d\s\d{1,2}m\s\d{1,2}(?:\.\d+)?s),\s*([+-]?\d+(?:\.\d+)?|[+-]?\d{1,2}h\s\d{1,2}m\s\d{1,2}(?:\.\d+)?s)(?:,\s*(\d+(?:\.\d+)?[dms]))?$/;
    return regex.test(value);
}


async function onSearch(): Promise<void> {
    if (isValid.value) {
        const [ra, dec, radius] = parseInput(searchQuery.value);
        if (ra && dec && radius) {
        await callApi(ra, dec, radius);
        }
    }
}


function parseInput(input: string): [string, string, { radius: number, units: string }] | [] {
    const match = input.match(/^(\d+(?:\.\d+)?|\d{1,2}d\s\d{1,2}m\s\d{1,2}(?:\.\d+)?s),\s*([+-]?\d+(?:\.\d+)?|[+-]?\d{1,2}h\s\d{1,2}m\s\d{1,2}(?:\.\d+)?s)(?:,\s*(\d+(?:\.\d+)?[dms]))?$/);
    if (!match) return [];

    let [ra, dec, radiusStr = "0.1d"] = match.slice(1);
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
    const endpoint = import.meta.env.VITE_API_URL + `/query/cone?ra=${ra}&dec=${dec}&radius=${radius}&units=${units}`
    await axios.get(endpoint)
        .then(response => {
        // Handle the response data

        // store the search results
        store.save_search_results(response.data);

        // Use Vue Router to navigate to the "results" page and pass the data as a route parameter
        router.push({ name: 'Results' });
        })
        .catch(error => {
        // Handle the error
        console.error('API call error:', error)
        });
}
</script>
