<template>
    <v-container fluid>
        <v-row>
            <v-col md=12>
                <h1>Results</h1>
            </v-col>
        </v-row>

      <v-row>
        <v-col md="12">
            <v-data-table
                v-model="selected"
                :headers="headers"
                :items="data"
                show-select
                return-object
                fixed-header
                hover
                height="500"
                density="compact"
            >
            <!-- TODO  - try to generalize these templates -->

            <!-- add checkmark for in_boss boolean -->
            <template v-slot:item.in_boss="{ item }">
                <v-icon>
                {{ item.in_boss ? "mdi-checkbox-marked" : null }}
                </v-icon>
            </template>

            <!-- add checkmark for in_apogee boolean -->
            <template v-slot:item.in_apogee="{ item }">
                <v-icon>
                {{ item.in_apogee ? "mdi-checkbox-marked" : null }}
                </v-icon>
            </template>

             <!-- add checkmark for in_astra boolean -->
            <template v-slot:item.in_astra="{ item }">
                <v-icon>
                {{ item.in_astra ? "mdi-checkbox-marked" : null }}
                </v-icon>
            </template>

            </v-data-table>
        </v-col>
    </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/app'
import { ref, onMounted } from 'vue'

// get the application state store and router
const store = useAppStore()
const data = ref([])
const selected = ref([])
//const headers = ref([])
const headers = ref([
  { title: 'sdss_id', key: 'sdss_id', type: 'number' },
  { title: 'RA', key: 'ra_sdss_id', type: 'number' },
  { title: 'Dec', key: 'dec_sdss_id', type: 'number' },
  { title: 'catalogid21', key: 'catalogid21', type: 'number' },
  { title: 'catalogid25', key: 'catalogid25', type: 'number' },
  { title: 'catalogid31', key: 'catalogid31', type: 'number' },
  { title: 'in_boss', key: 'in_boss', type: 'boolean' },
  { title: 'in_apogee', key: 'in_apogee', type: 'boolean' },
  { title: 'in_astra', key: 'in_astra', type: 'boolean' },

  // Add more header objects for other fields as needed
]);

const results = ref([{'sdss_id': 47510284,
  'catalogid21': 7613823349,
  'catalogid25': null,
  'catalogid31': null,
  'ra_sdss_id': 315.01922607421875,
  'dec_sdss_id': 35.29448988981897,
  'in_boss': true,
  'in_apogee': true,
  'in_astra': false},
 {'sdss_id': 64302897,
  'catalogid21': 4204682111,
  'catalogid25': 27021597764223095,
  'catalogid31': 63050394907753671,
  'ra_sdss_id': 315.0246256608367,
  'dec_sdss_id': 35.29759463931776,
  'in_boss': false,
  'in_apogee': false,
  'in_astra': true},
 {'sdss_id': 14442699,
  'catalogid21': null,
  'catalogid25': 27021601379848474,
  'catalogid31': null,
  'ra_sdss_id': 315.01417506605424,
  'dec_sdss_id': 35.299699537762805,
  'in_boss': false,
  'in_apogee': true,
  'in_astra': true},
 {'sdss_id': 125565047,
  'catalogid21': null,
  'catalogid25': null,
  'catalogid31': 63050400247293237,
  'ra_sdss_id': 315.01417506605424,
  'dec_sdss_id': 35.299699537762805,
  'in_boss': true,
  'in_apogee': false,
  'in_astra': false},
 {'sdss_id': 13350286,
  'catalogid21': null,
  'catalogid25': 27021601379848999,
  'catalogid31': null,
  'ra_sdss_id': 315.01441091013965,
  'dec_sdss_id': 35.29998900607549,
  'in_boss': false,
  'in_apogee': false,
  'in_astra': false},
 {'sdss_id': 125416388,
  'catalogid21': null,
  'catalogid25': null,
  'catalogid31': 63050399892520912,
  'ra_sdss_id': 315.01441091013965,
  'dec_sdss_id': 35.29998900607549,
  'in_boss': false,
  'in_apogee': false,
  'in_astra': false},
 {'sdss_id': 64302821,
  'catalogid21': 4204682194,
  'catalogid25': 27021597764223178,
  'catalogid31': 63050394907750321,
  'ra_sdss_id': 315.01407990873156,
  'dec_sdss_id': 35.30040159080411,
  'in_boss': true,
  'in_apogee': false,
  'in_astra': true},
 {'sdss_id': 26214942,
  'catalogid21': null,
  'catalogid25': 27021601443434997,
  'catalogid31': null,
  'ra_sdss_id': 315.01470646598915,
  'dec_sdss_id': 35.300391071119584,
  'in_boss': false,
  'in_apogee': false,
  'in_astra': false},
 {'sdss_id': 125416380,
  'catalogid21': null,
  'catalogid25': null,
  'catalogid31': 63050399892508297,
  'ra_sdss_id': 315.01470646598915,
  'dec_sdss_id': 35.300391071119584,
  'in_boss': false,
  'in_apogee': false,
  'in_astra': false},
 {'sdss_id': 64302899,
  'catalogid21': 4204682196,
  'catalogid25': 27021597764223180,
  'catalogid31': 63050394907753783,
  'ra_sdss_id': 315.0184570164199,
  'dec_sdss_id': 35.30143854456894,
  'in_boss': false,
  'in_apogee': false,
  'in_astra': false},
 {'sdss_id': 24523506,
  'catalogid21': null,
  'catalogid25': 27021601379848995,
  'catalogid31': null,
  'ra_sdss_id': 315.0140772959075,
  'dec_sdss_id': 35.30079917090196,
  'in_boss': false,
  'in_apogee': false,
  'in_astra': false},
 {'sdss_id': 125416387,
  'catalogid21': null,
  'catalogid25': null,
  'catalogid31': 63050399892520908,
  'ra_sdss_id': 315.0140772959075,
  'dec_sdss_id': 35.30079917090196,
  'in_boss': false,
  'in_apogee': false,
  'in_astra': false},
 {'sdss_id': 5657741,
  'catalogid21': null,
  'catalogid25': 27021601379848994,
  'catalogid31': null,
  'ra_sdss_id': 315.0140428484765,
  'dec_sdss_id': 35.30084389148045,
  'in_boss': false,
  'in_apogee': false,
  'in_astra': false},
 {'sdss_id': 125416386,
  'catalogid21': null,
  'catalogid25': null,
  'catalogid31': 63050399892520907,
  'ra_sdss_id': 315.0140428484765,
  'dec_sdss_id': 35.30084389148045,
  'in_boss': false,
  'in_apogee': false,
  'in_astra': false},
 {'sdss_id': 47510285,
  'catalogid21': 7613823350,
  'catalogid25': null,
  'catalogid31': null,
  'ra_sdss_id': 315.0096130371094,
  'dec_sdss_id': 35.30448789493567,
  'in_boss': false,
  'in_apogee': false,
  'in_astra': false}])

onMounted(() => {
    // Retrieve the data from the store
    //let results = store.searchResults
    console.log('results', results)
    data.value = results.value
    //headers.value = Object.keys(results.value[0]).map((name) => ({ title: name, key: name }))
    //headers.value = Object.entries(results.value[0]).map((item)=> ({title: item[0], key: item[0], type: typeof item[1]}))
    console.log('data', data.value)
    console.log('headers', headers.value)


    console.log('res data', data.value)
  })
</script>
