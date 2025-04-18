<template>
  <div class="file-upload">
    <v-row no-gutters>
      <v-col cols="auto" class="d-flex align-center">
          <v-btn color='warning' variant='outlined' density="compact" @mouseover="dialog = true" icon="mdi-help"></v-btn>
      </v-col>
      <v-col cols="auto" md="10" class="align-center">
        <!-- Use Vuetify file-input component -->
        <v-file-input
          v-model="file"
          label="Upload Target List"
          accept=".txt,.csv,text/plain,text/csv"
          :rules="checkFile"
          hide-details
          clearable
          dense
          prepend-icon=""
          prepend-inner-icon="mdi-upload"
          @change="handleChange"
          class="file-upload-input"
        />
      </v-col>
    <div class="mt-1" id='validated-list'>
      <span v-if="message" class="text-caption">{{ message }}</span>
    </div>
    </v-row>
  </div>

    <!-- File upload help dialog window -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card
        title="File Upload Help"
        subtitle="Upload a list of targets by id or coordinate"
      >
        <v-card-text>
          Upload a CSV or TXT file of a list of coordinates or ids (limit of 200 targets). The first
          row should be a header row containing the name of the column(s). The
          'id' column name should be the type of identifier, e.g. "sdssid",
          "gaiaid", "catalogid",etc. See examples below.

          <v-tabs v-model="tab">
            <v-tab value="coord">By Coordinate</v-tab>
            <v-tab value="id">By Id</v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="coord">
              <pre>
  ra,	dec
  248.9, 54.5
  315.78, -3.2
  150.385, 1.02
            </pre
              >
            </v-tabs-window-item>
            <v-tabs-window-item value="id">
              <pre>
 gaiaid
 625453654702751872
 1512267987902318464
 2422574280380383872
            </pre
              >
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const dialog = ref(false)
const tab = ref('coord')
const file = ref<File|null>(null)
const message = ref('')
const emit = defineEmits(['update:targetList'])

// define which properties are passed in from the parent, i.e. ":xxx"
const props = defineProps<{
    targetList: Object,
}>()

// Retrieve papa from the global app instance
const instance = getCurrentInstance()
const papa = instance.appContext.config.globalProperties.$papa

// file validation rules
let valid = ref(true)
let checkFile = [
  (value: string) => {
    //console.log('checkFile:', value, valid.value, value && valid.value)
    if (!value) return true
    return value && valid.value || 'File has no validated targets.'
  },
]


function handleChange() {
  console.log('file:', file.value)

  // read the file
  const reader = new FileReader()
  reader.readAsText(file.value)
  reader.onload = () => {
    const fileContent = reader.result as string
    papa.parse(fileContent, {
      skipEmptyLines: true,
      preview: 200, // limit to 200 targets
      header: true,
      transformHeader: (value: string) => value.replace("#", "").trim(),
      transform: (value: string) => value.trim(), // trim whitespace

      complete: (results: any) => {
        console.log('Parsed results:', results)
        let fields: string[] = results.meta?.fields || []

        // Use case of missing header row
        if (fields.length === 2 && !(fields.includes('ra') && fields.includes('dec'))) {
          // coordinate list
          // add header row back as data and update the object keys with correct fields
          const headerRow = fields.slice()
          results.data.unshift({ ra: headerRow[0], dec: headerRow[1] })
          fields = ['ra', 'dec']
          // update fields
          results.data = results.data.map(row => Object.fromEntries(fields.map((key, index) => [key, Object.values(row)[index]])));
        } else if (fields.length === 1 && !fields[0].includes('id')) {
          // single column id list, assume it is sdssid
          // add header row back as data and update the object keys with correct fields
          const headerRow = fields.slice()
          results.data.unshift({ sdssid: headerRow[0] })
          fields = ['sdssid']
          // update fields
          results.data = results.data.map(row => Object.fromEntries(fields.map((key, index) => [key, Object.values(row)[index]])));

        }

        // validate and parse the data
        const validated: any[] = []
        let listType = ''
        if (fields.includes('ra') && fields.includes('dec')) {
          listType = 'coord'
          // Validate as coordinate list: iterate over objects in results.data
          for (const row of results.data) {
            if (!isNaN(parseFloat(row.ra)) && !isNaN(parseFloat(row.dec))) {
              validated.push({ ra: row.ra.toString().trim(), dec: row.dec.toString().trim() })
            }
          }
        } else if (fields.length === 1 && fields[0].includes('id')) {
          listType = 'id'
          // can't really validate the id list
          for (const row of results.data) {
            validated.push(row)
          }
        }
        // update output target list
        valid.value = validated.length > 0
        const output = { type: listType, data: validated, valid: validated.length > 0}
        message.value = `Validated ${validated.length} targets`
        emit('update:targetList', output)
      },
      error: (err: any) => {
        // run on parsing errors
        console.error('Papa parse error:', err)
      }
    })
  }
  reader.onerror = (e) => {
    // run on file reading error
    console.error('Error reading file:', e)
  }
}

// Function reset file field
const resetFile = () => {
    file.value = null
    message.value = ''
    valid.value = true
}

// Expose the resetFile function to the parent
defineExpose({ resetFile })

</script>

<style scoped>
.file-upload {
  margin: 0;
  padding: 0;
}
.file-upload-input {
  margin: 0;
  padding: 0;
  min-width: auto;
}

#validated-list {
  margin: 0;
  padding-left: 2rem;
}
</style>
