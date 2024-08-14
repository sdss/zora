<template>
    <!-- column menu item -->
    <div class="text-center">
        <v-menu location='start' :close-on-content-click="false">
            <template v-slot:activator="{ props }">
                <v-btn
                density="compact"
                color="success"
                rounded="0"
                v-bind="props"
                :disabled="is_parent_empty(catalogs)"
                :variant="is_parent_empty(catalogs) ? 'text' : 'tonal'"
                >
                {{ !is_parent_empty(catalogs) ? 'Show' : 'None' }}
                </v-btn>
            </template>

            <v-list lines="one" density="compact" border="sm">
                <v-list-item
                v-for="(item, index) in catalogs"
                :key="index"
                :border="index !== catalogs.length - 1 ? 'b' : ''"
                >
                <v-list-item-title>
                    <v-btn color='primary' variant="plain" @click="openDialog(index, item)">{{ index }}</v-btn>
                </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>

    <!-- parent catalog popup window -->
    <v-dialog v-model="dialog" max-width="600px" max-height="500px">
        <v-card class="d-flex flex-column">
            <v-card-title class="text-h6">
            <v-row no-gutters align="center">
                <v-col>Parent Catalog: {{ selected_catalog }}</v-col>
                <v-col text-end cols="auto">
                    <v-btn density="compact" color="secondary" size="small"
                    icon="mdi-close" @click="dialog = false"></v-btn
                ></v-col>
            </v-row>
            </v-card-title>
            <v-card-subtitle>Target: {{ sdssid }}</v-card-subtitle>

            <v-divider class="mb-0 mt-2"></v-divider>

            <v-card-text class="pa-0 ma-0 flex-grow-1 overflow-hidden">
                <v-row no-gutters class="fill-height">
                <v-col class="data-table-container">
                    <!-- Data Table -->
                    <v-data-table-virtual
                    :headers="headers"
                    :items="tableData"
                    height="500"
                    fixed-header
                    ></v-data-table-virtual>
                </v-col>

                <v-col cols="4" class="item-list-container">
                    <!-- List of Items -->
                    <v-list
                    lines="one"
                    density="compact"
                    class="fill-height"
                    style="overflow-y: auto"
                    border="sm"
                    >
                    <v-list-item
                        :border="index !== catalogs.length - 1 ? 'b' : ''"
                        v-for="(item, index) in catalogs"
                        :key="index"
                    >
                        <v-list-item-title>
                        <v-btn
                            color="primary"
                            variant="plain"
                            @click="updateTable(index, item)"
                            >{{ index }}</v-btn
                        >
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
  import { ref, defineProps } from 'vue';
  import axiosInstance from '@/axios'

// define which properties are passed in from the parent, i.e. ":xxx"
const props = defineProps<{
    sdssid: string,
    catalogid: Number,
    catalogs: Object,
}>()

let dialog = ref(false)
let selected_catalog = ref('')
let selected_key = ref('')
let local_cache = ref({})

const tableData = ref([])
const headers = [
  { title: 'Parameter', key: 'parameter' },
  { title: 'Value', key: 'value' }
]

function openDialog(catalog: string, key: string) {
    // open the catalog dialog window on catalog menu selection
    selected_catalog.value = catalog
    selected_key.value = key
    dialog.value = true
    getParentCatalogData()
}

function updateTable(catalog: any, key: any) {
    // update the table on catalog selection
    selected_catalog.value = catalog
    selected_key.value = key
    getParentCatalogData()
}

async function getParentCatalogData() {
    // Populate table data with parent catalog info for the given sdssid and catalog name

    // resolve the target coordinates using the valis endpoint
    const url = `/target/parents/${selected_catalog.value}/${props.sdssid}/?catalogid=${props.catalogid}`;

    // use local cache if available
    // temporary cache per target page load
    // not sure if we want to store the parent catalog data in the global store?
    let data = get_or_update_cache(null)
    if (data) {
        tableData.value = data
        return
    }

    // fetch the parent catalog data
    await axiosInstance.get(url)
    .then((response) => {
        // convert response data to an array of objects for the data table; object keys match header field "key"
        let data = Object.entries(response.data[0]).map((item)=> ({parameter: item[0], value: item[1]}))
        tableData.value = get_or_update_cache(data)
    })
    .catch((error) => {
        console.error("Axios fetch error: ", error);
        tableData.value = []
    })
}

function get_or_update_cache(data: any) {
    // get or update the local cache
    // add intiial catalogid
    if (!(props.catalogid in local_cache.value)) {
        local_cache.value[props.catalogid] = {}
    }

    // add initial catalog name
    if (!(selected_catalog.value in local_cache.value[props.catalogid])) {
        local_cache.value[props.catalogid][selected_catalog.value] = data
        return data
    } else {
        // get or update the cached data
        let cache = local_cache.value[props.catalogid][selected_catalog.value]
        if (cache === null) {
            local_cache.value[props.catalogid][selected_catalog.value] = data
            return data
        } else {
            return cache
        }
    }
}

function is_parent_empty(value: Object) {
    // check if the parent catalogs object is empy
    return value && Object.keys(value).length === 0
}

</script>

<style>
  .data-table-container {
    overflow-y: hidden;
    max-height: 100%;
  }

  .item-list-container {
    overflow-y: auto;
    max-height: 100%;
  }
</style>