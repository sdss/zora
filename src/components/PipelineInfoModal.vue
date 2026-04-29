<template>
    <v-btn
        size="small"
        color="success"
        rounded="0"
        variant="tonal"
        @click="openDialog"
    >
        Show
    </v-btn>

    <v-dialog v-model="dialog" max-width="700px" max-height="600px">
        <v-card class="d-flex flex-column">
            <v-card-title class="text-h6">
                <v-row no-gutters align="center">
                    <v-col>{{ title }}</v-col>
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
                <span>Target: {{ targetSdssid }}</span>
                <span>(Null values excluded from display)</span>
            </v-card-subtitle>
            <v-divider class="mb-0 mt-2"></v-divider>

            <v-card-text class="pa-0 ma-0" style="height: 500px; overflow: hidden;">
                <v-row no-gutters class="fill-height">
                    <v-col class="data-table-container">
                        <div v-if="loading" class="pa-4">
                            <v-progress-linear indeterminate color="blue-lighten-3"></v-progress-linear>
                        </div>
                        <v-alert v-else-if="error" type="error" variant="tonal" class="ma-4">
                            {{ error }}
                        </v-alert>
                        <v-alert v-else-if="tableData.length === 0" type="info" variant="tonal" class="ma-4">
                            No pipeline parameters available for this row.
                        </v-alert>
                        <v-data-table-virtual
                            v-else
                            :headers="headers"
                            :items="tableData"
                            density="compact"
                            height="500"
                            fixed-header
                        >
                            <template #item.parameter="{ item }">
                                <span v-tippy="item.description || undefined">{{ item.parameter }}</span>
                            </template>
                        </v-data-table-virtual>
                    </v-col>

                    <v-col cols="4" class="item-list-container">
                        <v-list
                            lines="one"
                            density="compact"
                            style="height: 100%; overflow-y: auto; padding-left: 0;"
                            border="sm"
                        >
                            <v-list-item
                                v-for="(row, index) in props.rows"
                                :key="rowKey(row, index)"
                                :active="isSelectedRow(row)"
                                :border="index !== props.rows.length - 1 ? 'b' : ''"
                                style="padding: 0;"
                            >
                                <v-list-item-title class="text-left">
                                    <v-btn
                                        color="primary"
                                        variant="plain"
                                        class="text-left"
                                        style="justify-content: flex-start; text-align: left;"
                                        @click="selectRow(row)"
                                    >
                                        {{ rowLabel(row) }}
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
import { computed, ref } from 'vue'
import axiosInstance from '@/axios'
import { useAppStore } from '@/store/app'

type PipelineSource = {
    pipeline: 'boss' | 'apogee'
}

// Define strongly-typed component props.
const props = defineProps<{
    sdssid: string | string[]
    rows: Record<string, any>[]
    summaryRow: Record<string, any>
    source: PipelineSource
}>()

const store = useAppStore()  // Access the global application store.
const storeAny = store as any  // Use loose typing for dynamic store helpers.

const dialog = ref(false)  // Controls the modal visibility.
const loading = ref(false) // Tracks whether a request is in progress.
const error = ref('') // Stores the current error message.
const selectedRow = ref<Record<string, any> | null>(null) // Stores the currently selected pipeline row.
const tableData = ref<TableItem[]>([]) // Holds table-ready pipeline parameters.
const cache = ref<Record<string, TableItem[]>>({}) // Caches transformed rows by release and dbid.

// Defines the table headers.
const headers = [
    { title: 'Parameter', key: 'parameter' },
    { title: 'Value', key: 'value' }
]

// Derives dbid key and schema from pipeline type.
const pipelineConfig = computed(() => {
    if (props.source.pipeline === 'boss') {
        return { dbidKey: 'id', schema: 'boss_drp' }
    }
    return { dbidKey: 'pk', schema: 'apogee_drp' }
})

// Normalizes sdssid into a single string.
const targetSdssid = computed(() => {
    return Array.isArray(props.sdssid) ? props.sdssid[0] || '' : props.sdssid
})

// Builds a dynamic dialog title for the selected pipeline row.
const title = computed(() => {
    if (props.source.pipeline === 'boss') {
        return 'Boss DRP Pipeline Parameters'
    }
    // Determine the APOGEE observation type.
    const obstype = selectedRow.value?._rowtype || 'star'
    // Build a short observation label for the title.
    const obs = obstype === 'visit' ? 'Visit' : 'Star'
    return `Apogee DRP Pipeline Parameters (${obs})`
})

/** Return the database identifier for a row. */
function rowDbid(row: Record<string, any>): string {
    // Read the configured dbid value from the row.
    const value = row?.[pipelineConfig.value.dbidKey]
    return value == null ? '' : String(value)
}

/** Build a stable key for each selectable row. */
function rowKey(row: Record<string, any>, index: number): string {
    const dbid = rowDbid(row)
    if (!dbid) return `${props.source.pipeline}-row-${index}`

    if (props.source.pipeline === 'apogee') {
        const obstype = row._rowtype || 'star'
        return `${dbid}:${obstype}`
    }

    return dbid
}

/** Build a cache key from release, dbid, and pipeline label. */
function buildCacheKey(row: Record<string, any>, dbid: string): string {
    if (props.source.pipeline === 'boss') {
        const coadd = row.coadd ? String(row.coadd) : 'none'
        return `${store.release}:${dbid}:${coadd}`
    }

    const obstype = row._rowtype || 'star'
    return `${store.release}:${dbid}:${obstype}`
}

/** Format the visible label for a selectable row. */
function rowLabel(row: Record<string, any>): string {
    if (props.source.pipeline === 'boss') {
        // Build a BOSS row label from coadd and MJD.
        const parts = [row.coadd, row.mjd].filter((v) => v != null && `${v}`.trim() !== '')
        return parts.length > 0 ? parts.join(' | ') : rowDbid(row)
    }
    // apogee
    // Determine if this APOGEE row is star or visit.
    const rowtype = row._rowtype || 'star'
    if (rowtype === 'visit') {
        // Build an APOGEE visit label.
        const parts = ['visit', row.mjd, row.field].filter((v) => v != null && `${v}`.trim() !== '')
        return parts.join(' | ')
    }
    return ['star', row.starver].filter((v) => v != null && `${v}`.trim() !== '').join(' | ')
}

/** Check whether a row is currently selected. */
function isSelectedRow(row: Record<string, any>): boolean {
    if (!selectedRow.value) return false
    return rowDbid(selectedRow.value) === rowDbid(row)
}

/** Convert complex values into display-safe primitives. */
function formatValue(value: unknown): string | number | boolean {
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        return JSON.stringify(value)
    }
    return value as string | number | boolean
}

type TableItem = {
    parameter: string
    value: string | number | boolean
    description: string
    column: string
}

/** Transform API data into table items with metadata. */
function toTableData(data: Record<string, unknown>): TableItem[] {
    // Resolve the metadata schema for the active pipeline.
    const schema = pipelineConfig.value.schema
    return Object.entries(data)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([column, value]) => {
            // Lookup strict metadata for this schema and column.
            const meta = getColumnMetaStrict(column, schema)
            return {
                column,
                parameter: meta.display_name || column,
                description: meta.description || '',
                value: formatValue(value)
            }
        })
}

/** Resolve column metadata strictly within one schema. */
function getColumnMetaStrict(column: string, schema: string): Record<string, any> {
    // Collect all known flattened keys for this column name.
    const possibleKeys = storeAny?.dbkey_lookup?.[column] || []
    if (!Array.isArray(possibleKeys) || possibleKeys.length === 0) return {}

    // Keep only keys that belong to the requested schema.
    const schemaMatches = possibleKeys.filter((key: string) => key.startsWith(`${schema}.`) && key.endsWith(`.${column}`))
    if (schemaMatches.length === 0) return {}

    return storeAny?.flat_db?.[schemaMatches[0]] || {}
}

/** Open the modal and load the initial row. */
function openDialog() {
    dialog.value = true
    selectRow(props.summaryRow)
}

/** Fetch and display parameters for a selected row. */
async function selectRow(row: Record<string, any>) {
    selectedRow.value = row
    error.value = ''

    // Resolve the dbid for the selected row.
    const dbid = rowDbid(row)
    if (!dbid) {
        tableData.value = []
        error.value = `Missing ${pipelineConfig.value.dbidKey} for selected row.`
        return
    }

    // Build a release-aware cache key for this row.
    const cacheKey = buildCacheKey(row, dbid)

    if (cache.value[cacheKey]) {
        tableData.value = cache.value[cacheKey]
        return
    }

    loading.value = true

    // Build the correct API endpoint for the active pipeline.
    const endpoint = props.source.pipeline === 'boss'
        ? `/target/pipe/boss/${targetSdssid.value}`
        : `/target/pipe/apogee/${targetSdssid.value}`

    // Build baseline request params.
    const params: Record<string, string> = {
        release: store.release,
        dbid
    }

    if (props.source.pipeline === 'boss' && row.coadd) {
        params.coadd = row.coadd
    }

    if (props.source.pipeline === 'apogee') {
        params.obstype = row._rowtype || 'star'
    }

    // Attach auth headers when available.
    const authHeaders = storeAny.get_auth_hdr ? storeAny.get_auth_hdr() : {}

    await axiosInstance.get(endpoint, { params, headers: authHeaders })
        .then(({ data }) => {
            // Transform API data and store it in cache.
            const transformed = toTableData(data || {})
            cache.value[cacheKey] = transformed
            tableData.value = transformed
        })
        .catch((err) => {
            console.error('PipelineInfoModal fetch error:', err)
            // Show a useful error message in the modal.
            const message = err?.response?.data?.detail || err?.toJSON?.().message || 'Error loading pipeline parameters.'
            error.value = message
            tableData.value = []
        })
        .finally(() => {
            loading.value = false
        })
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
