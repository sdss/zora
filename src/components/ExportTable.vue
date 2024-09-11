<template>
    <v-menu location="bottom">
    <template v-slot:activator="{ props }">
        <v-btn v-if="$props.short" color="tonal" rounded="0" v-bind="props" icon="mdi-export"
        v-tippy="{content: 'Export table to csv or json', placement: 'right-end'}"></v-btn>
        <v-btn v-else color="tonal" rounded="0" v-bind="props" prepend-icon="mdi-export">
            Export Table
        </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        :value="index"
        @click="handleExport(item)"
      >
        <v-list-item-title>
          <v-btn color="primary" variant="plain"
            >{{ item }}</v-btn
          >
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// define which properties are passed in from the parent, i.e. ":xxx"
const props = defineProps<{
    data: Array<Object>,
    short: boolean
}>()

const items = ['CSV', 'JSON']

const headers = computed(() => {
    // get the headers from the data
    return Object.keys(props.data[0])
})


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
    // Add header, use the original column name
    console.log('headers', headers.value)
    csvRows.push(headers.value.join(","));

    // get the selected rows or all rows if none selected
    //let rows = selected.value.length > 0 ? selected.value : data.value
    let rows = props.data

    // Add data
    rows.forEach(row => {
        let rowData = headers.value.map(field => JSON.stringify(row[field])).join(",")
        csvRows.push(rowData);
    });

    let csvContent = csvRows.join("\r\n");
    const filename = "sdss_table_export.csv"
    downloadBlob(csvContent, filename, 'text/csv; charset=utf-8;')
}

const exportToJson = () => {
    // export the table to JSON

    // get the selected rows or all rows if none selected
    //let rows = selected.value.length > 0 ? selected.value : data.value
    let rows = props.data

    const filename = "sdss_table_export.json"
    const jsonContent = JSON.stringify(rows, null, 2)
    downloadBlob(jsonContent, filename, "application/json")
}

const handleExport = (item) => {
    // toggle the type of table export
    if (item === 'CSV') {
        exportToCsv();
    } else if (item === 'JSON') {
        exportToJson();
    }
}

</script>
