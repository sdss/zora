<template>
    <v-data-table
    sticky density="compact"
    v-model:sort-by="sortBy"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    item-value="sdss_id"
    v-model='selected'
    :items="props.items"
    :headers="headers"
    return-object
    show-select
    select-strategy="single">

    <template v-slot:item.sdss_id="{ item }">
        <router-link :to="{ name: 'target', params: { sdss_id: item.sdss_id } }" target="_blank">{{ item.sdss_id }}</router-link>
    </template>

    </v-data-table>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/store/app'
import { ref, watch } from 'vue'

// define which properties are passed in from the parent, i.e. ":xxx"
const props = defineProps<{
    id: number,
    items: Array<Object>,
    catalog: any
}>()

const store = useAppStore()

let selected = ref([])
let page = ref(1)
let itemsPerPage = ref(10)
let sortBy = ref([])
let temph = Object.entries(props.items[0]).map((item)=> ({title: item[0], key: item[0], type: typeof item[1], description: store.get_field_from_db(item[0], 'description')}))
let headers = reorderArrayObjects(temph, ['sdss_id', 'ra_sdss_id', 'dec_sdss_id', 'has_been_observed', 'in_boss', 'in_apogee', 'in_astra']);


function reorderArrayObjects(arr, priorityOrder) {
  // Create a map for quick lookup of priority order
  const orderMap = new Map(priorityOrder.map((key, index) => [key, index]));

  // Sort the array based on the 'key' field
  return arr.sort((a, b) => {
    const orderA = orderMap.has(a.key) ? orderMap.get(a.key) : priorityOrder.length;
    const orderB = orderMap.has(b.key) ? orderMap.get(b.key) : priorityOrder.length;
    return orderA - orderB;
  });
}


const sortItems = (itemList, sortBy) => {
    // manually sort the data table

    // if sortBy is empty, return the original array
    if (sortBy.length === 0) {
        return itemList
    }

    // sorting of array
    return itemList.slice().sort((a, b) => {
        const sortDesc = sortBy.order === "desc"
        const aValue = a[sortBy.key]
        const bValue = b[sortBy.key]

        let alt = sortDesc ? 1 : -1
        let agt = sortDesc ? -1 : 1
        if (sortBy.key == 'dec_sdss_id') {
            alt = sortDesc ? -1 : 1
            agt = sortDesc ? 1 : -1
        }

        if (aValue < bValue) return alt;
        if (aValue > bValue) return agt;
        return 0
    })
}

const emit = defineEmits(['selectionChanged'])

// Emit an event when selected changes
watch(selected, (newVal) => {
  emit('selectionChanged', newVal, props.id)
})

// Function to update selection from parent
const updateSelection = (newSelection) => {
  selected.value = newSelection
}

// Expose the updateSelection function to the parent
defineExpose({ updateSelection })


watch(selected, (newVal) => {
        // watch the selected table row and select the corresponding object in the Aladin view

        // First, checking whether dither is selected, since changing of LVMStore.selectedDithers
        // can be caused by deselecting the dither
        if (newVal && newVal.length > 0) {

            let itemList = props.items

            // first check whether sorting is neccessary and sort if needed
            if (sortBy.value.length > 0) {
                itemList = sortItems(itemList, sortBy.value[0])
            }

            // find index in (sorted) list of dithers
            const itemIdx = itemList.findIndex(item => item.sdss_id === newVal[0].sdss_id)

            // find page of selected dither
            const pg = Math.floor(itemIdx / itemsPerPage.value) + 1
            page.value = pg

            // select the object in the Aladin view
            let sources = props.catalog.sources
            let obj = sources.filter(item => (item.data && item.data.sdss_id == newVal[0].sdss_id))
            if (obj.length > 0) {
                props.catalog.deselectAll()
                obj[0].select()
            }
            // animate to the selected object
            //store.aladin.animateToRaDec(newVal[0].ra_sdss_id, newVal[0].dec_sdss_id, 0.4)
        } else {
            props.catalog.deselectAll()
        }
    }, {deep: true})

</script>
