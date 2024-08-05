<template>
    <v-container fluid>
        <v-row dense no-gutters class="d-flex align-center">
            <v-col cols="auto" class="d-flex align-center">
                <v-btn variant='plain' density="compact" @mouseover="dialog = true" icon="mdi-help-circle-outline"></v-btn>
                <h1 class="ml-2">Results</h1>
            </v-col>
        </v-row>
        <v-row dense>
            <v-col cols="2">
                <v-select
                    v-model="exportas"
                    :items="['CSV', 'JSON']"
                    label="Export table"
                    outlined
                    @update:modelValue="handleExport"
                ></v-select>
            </v-col>
        </v-row>

        <v-row v-if="nodata">
            <v-col md="12">
                <v-banner class='ma-4' color="error" lines="one" icon="mdi-emoticon-sad"><v-banner-text>{{ msg }}</v-banner-text></v-banner>
            </v-col>
        </v-row>

      <!-- results data table -->
      <v-row dense>
        <v-col md="12">
            <v-data-table
                v-model="selected"
                :headers="headers"
                :items="data"
                show-select
                return-object
                select-strategy="all"
                fixed-header
                hover
                height="500"
                density="compact"
                :search="search"
            >
            <!-- table toolbar -->
            <template v-slot:top>
                <v-toolbar flat density="compact" color="surface">
                <v-card color="surface" variant="flat" class="ma-1">
                    Counts:
                    <v-chip class='rounded-lg' color="primary-darken-1" variant="flat">
                        Total: {{ data.length }}
                    </v-chip>
                    <v-chip class='rounded-lg' color="secondary-darken-1" variant="flat">
                        Selected: {{ selected.length }}
                    </v-chip>
                </v-card>
                <v-spacer></v-spacer>
                <v-text-field
                    v-model="search"
                    label="Filter table"
                    prepend-inner-icon="mdi-magnify"
                    single-line
                    variant="outlined"
                    color="primary"
                    hide-details
                ></v-text-field>

                </v-toolbar>
            </template>

            <!-- add hover tooltip to column ; retains column sorting -->
            <template v-for="h in headers" v-slot:[`header.${h.key}`]="{ column }">
                <span v-tippy="`${h.description}`">{{h.title}}</span>
            </template>

            <!-- adds a target page link to the sdss id column -->
            <template v-slot:item.sdss_id="{ item }">
                <router-link :to="{ name: 'target', params: { sdss_id: item.sdss_id } }" target="_blank">{{ item.sdss_id }}</router-link>
            </template>

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

             <!-- add checkmark for has_been_observed boolean -->
             <template v-slot:item.has_been_observed="{ item }">
                <v-icon>
                {{ item.has_been_observed ? "mdi-checkbox-marked" : null }}
                </v-icon>
            </template>
            </v-data-table>
        </v-col>
    </v-row>
    </v-container>

    <!-- Results page help dialog window -->
    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
        <v-card-title class="text-h5">Information</v-card-title>
        <v-divider class="mb-4"></v-divider>
        <v-card-text>
            Examine search results in the data-table on this page. Click on a column to sort the table.
            Export the table, or subset, to a CSV or JSON file. Type in the Filter Box to filter
            results by any row value.
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialog = false">Close</v-btn>
        </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">
import { useAppStore } from '@/store/app'
import { ref, onMounted } from 'vue'
import useStoredTheme from '@/composables/useTheme'

// mount the stored theme
useStoredTheme()

// get the application state store and router
const store = useAppStore()
const data = ref([])
const selected = ref([])
const headers = ref([])
const nodata = ref(false)
const msg = ref('')
const exportas = ref(null)
const search = ref('')
const dialog = ref(false)

// 315.014, 25.299 (one row)
// 278.232, 3.788, (19 rows) 0.05
//
// const headers = ref([
//   { title: 'sdss_id', key: 'sdss_id', type: 'number' },
//   { title: 'RA', key: 'ra_sdss_id', type: 'number' },
//   { title: 'Dec', key: 'dec_sdss_id', type: 'number' },
//   { title: 'catalogid21', key: 'catalogid21', type: 'number' },
//   { title: 'catalogid25', key: 'catalogid25', type: 'number' },
//   { title: 'catalogid31', key: 'catalogid31', type: 'number' },
//   { title: 'in_boss', key: 'in_boss', type: 'boolean' },
//   { title: 'in_apogee', key: 'in_apogee', type: 'boolean' },
//   { title: 'in_astra', key: 'in_astra', type: 'boolean' },

//   // Add more header objects for other fields as needed
// ]);

// const results = [{'sdss_id': 47510284,
//   'catalogid21': 7613823349,
//   'catalogid25': null,
//   'catalogid31': null,
//   'ra_sdss_id': 315.01922607421875,
//   'dec_sdss_id': 35.29448988981897,
//   'in_boss': true,
//   'in_apogee': true,
//   'in_astra': false},
//  {'sdss_id': 64302897,
//   'catalogid21': 4204682111,
//   'catalogid25': 27021597764223095,
//   'catalogid31': 63050394907753671,
//   'ra_sdss_id': 315.0246256608367,
//   'dec_sdss_id': 35.29759463931776,
//   'in_boss': false,
//   'in_apogee': false,
//   'in_astra': true},
//  {'sdss_id': 14442699,
//   'catalogid21': null,
//   'catalogid25': 27021601379848474,
//   'catalogid31': null,
//   'ra_sdss_id': 315.01417506605424,
//   'dec_sdss_id': 35.299699537762805,
//   'in_boss': false,
//   'in_apogee': true,
//   'in_astra': true},
//  {'sdss_id': 125565047,
//   'catalogid21': null,
//   'catalogid25': null,
//   'catalogid31': 63050400247293237,
//   'ra_sdss_id': 315.01417506605424,
//   'dec_sdss_id': 35.299699537762805,
//   'in_boss': true,
//   'in_apogee': false,
//   'in_astra': false},
//  {'sdss_id': 13350286,
//   'catalogid21': null,
//   'catalogid25': 27021601379848999,
//   'catalogid31': null,
//   'ra_sdss_id': 315.01441091013965,
//   'dec_sdss_id': 35.29998900607549,
//   'in_boss': false,
//   'in_apogee': false,
//   'in_astra': false},
//  {'sdss_id': 125416388,
//   'catalogid21': null,
//   'catalogid25': null,
//   'catalogid31': 63050399892520912,
//   'ra_sdss_id': 315.01441091013965,
//   'dec_sdss_id': 35.29998900607549,
//   'in_boss': false,
//   'in_apogee': false,
//   'in_astra': false},
//  {'sdss_id': 64302821,
//   'catalogid21': 4204682194,
//   'catalogid25': 27021597764223178,
//   'catalogid31': 63050394907750321,
//   'ra_sdss_id': 315.01407990873156,
//   'dec_sdss_id': 35.30040159080411,
//   'in_boss': true,
//   'in_apogee': false,
//   'in_astra': true},
//  {'sdss_id': 26214942,
//   'catalogid21': null,
//   'catalogid25': 27021601443434997,
//   'catalogid31': null,
//   'ra_sdss_id': 315.01470646598915,
//   'dec_sdss_id': 35.300391071119584,
//   'in_boss': false,
//   'in_apogee': false,
//   'in_astra': false},
//  {'sdss_id': 125416380,
//   'catalogid21': null,
//   'catalogid25': null,
//   'catalogid31': 63050399892508297,
//   'ra_sdss_id': 315.01470646598915,
//   'dec_sdss_id': 35.300391071119584,
//   'in_boss': false,
//   'in_apogee': false,
//   'in_astra': false},
//  {'sdss_id': 64302899,
//   'catalogid21': 4204682196,
//   'catalogid25': 27021597764223180,
//   'catalogid31': 63050394907753783,
//   'ra_sdss_id': 315.0184570164199,
//   'dec_sdss_id': 35.30143854456894,
//   'in_boss': false,
//   'in_apogee': false,
//   'in_astra': false},
//  {'sdss_id': 24523506,
//   'catalogid21': null,
//   'catalogid25': 27021601379848995,
//   'catalogid31': null,
//   'ra_sdss_id': 315.0140772959075,
//   'dec_sdss_id': 35.30079917090196,
//   'in_boss': false,
//   'in_apogee': false,
//   'in_astra': false},
//  {'sdss_id': 125416387,
//   'catalogid21': null,
//   'catalogid25': null,
//   'catalogid31': 63050399892520908,
//   'ra_sdss_id': 315.0140772959075,
//   'dec_sdss_id': 35.30079917090196,
//   'in_boss': false,
//   'in_apogee': false,
//   'in_astra': false},
//  {'sdss_id': 5657741,
//   'catalogid21': null,
//   'catalogid25': 27021601379848994,
//   'catalogid31': null,
//   'ra_sdss_id': 315.0140428484765,
//   'dec_sdss_id': 35.30084389148045,
//   'in_boss': false,
//   'in_apogee': false,
//   'in_astra': false},
//  {'sdss_id': 125416386,
//   'catalogid21': null,
//   'catalogid25': null,
//   'catalogid31': 63050399892520907,
//   'ra_sdss_id': 315.0140428484765,
//   'dec_sdss_id': 35.30084389148045,
//   'in_boss': false,
//   'in_apogee': false,
//   'in_astra': false},
//  {'sdss_id': 47510285,
//   'catalogid21': 7613823350,
//   'catalogid25': null,
//   'catalogid31': null,
//   'ra_sdss_id': 315.0096130371094,
//   'dec_sdss_id': 35.30448789493567,
//   'in_boss': false,
//   'in_apogee': false,
//   'in_astra': false}]

const downloadBlob = (data: Array<Object>, filename: string, mimeType: string) => {
    // download the data as a file blob
    const blob = new Blob([data], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
}

const exportToCsv = () => {
    // export the table to CSV
    let csvRows = [];
    // Add header
    csvRows.push(headers.value.map(e => e.title).join(","));

    // Add data
    selected.value.forEach(row => {
        let rowData = headers.value.map(header => JSON.stringify(row[header.key], (_, value) => {
            // Custom formatting can go here
            return value
        })).join(",");
        csvRows.push(rowData);
    });

    let csvContent = csvRows.join("\r\n");
    const filename = "sdss_table_export.csv"
    downloadBlob(csvContent, filename, 'text/csv; charset=utf-8;')
}

const exportToJson = () => {
    // export the table to JSON
    const filename = "sdss_table_export.json"
    const jsonContent = JSON.stringify(selected.value)
    downloadBlob(jsonContent, filename, "application/json")
}

const handleExport = () => {
    // toggle the type of table export
    if (exportas.value === 'CSV') {
        exportToCsv();
    } else if (exportas.value === 'JSON') {
        exportToJson();
    }
}

onMounted(() => {
    // Retrieve the data from the store
    let results = store.searchResults
    console.log('results', results, results.length)

    if (results.length == 0) {
        nodata.value = true
        msg.value = 'No search results returned'
    } else {
        data.value = results
        headers.value = Object.entries(data.value[0]).map((item)=> ({title: store.get_field_from_db(item[0], 'display_name'), key: item[0], type: typeof item[1], description: store.get_field_from_db(item[0], 'description')}))
        console.log('data', data.value)
        console.log('headers', headers.value)

        console.log('res data', data.value)
    }

  })
</script>
