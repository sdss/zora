<template>
    <v-form fast-fail @submit.prevent ref="form" validate-on="input">
      <v-container>
        <v-row>
          <!-- width of all columns in a row should add up to 12 ;  see Vuetify Grid -->
          <v-col md=6>
            <!-- use of the TextInput component -->
            <!-- search coordinate field -->
            <text-input
              v-model="formData.coords"
              label="Coordinate Search"
              placeholder="315.014, 35.299"
              hint="Enter a RA, Dec coordinate in [decimal or hmsdms] format"
              :rules="coordRules"
              id="coords"
              :disabled="coordsDisabled"
            />
          </v-col>
          <v-col md=4>
            <!-- search radius field -->
            <text-input
                v-model="formData.radius"
                label="Search Radius"
                placeholder="0.01"
                hint="Enter a search radius"
                :rules="radiusRules"
                id="radius"
                :disabled="coordsDisabled"
            />
          </v-col>
          <v-col md=2>
            <!-- radius dropdown select -->
            <v-select
                v-model="formData.units"
                label="Unit"
                id="unit"
                :items="['degree', 'arcmin', 'arcsec']"
                :disabled="coordsDisabled"
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
            <v-col cols="2" md="2">
            <!-- search id field -->
            <v-select
              v-model="searchType"
              label="ID Type"
              v-tippy="{content:'Select the type of identifier to search on', placement: 'left', maxWidth: 200}"
              :items="['sdssid', 'altid']"
            ></v-select>
            </v-col>
            <v-col cols="3" md="3">
            <text-input
              v-if="searchType === 'sdssid'"
              v-model="formData.id"
              label="ID Search"
              placeholder="23326"
              hint="Enter an SDSS identifier"
              :rules="idRules"
              id="id"
              :disabled="idDisabled"
            />
            <text-input
              v-if="searchType === 'altid'"
              v-model="formData.altid"
              label="Alternative ID Search"
              placeholder="2M23595980+1528407"
              hint="Enter an alternative identifier, e.g. an APOGEE_ID or catalogid"
              :rules="altidRules"
              id="altid"
              :disabled="idDisabled"
            />
          </v-col>
          <!-- cartons and programs dropdown menus -->
          <v-col cols="auto" md="3">
            <dropdown-select label="Programs" id="programs" :items="store.programs" v-model="formData.program"/>
            <v-row no-gutters class="d-flex align-center">
            <p class="text-body-2 font-weight-medium mt-1 text-primary d-flex align-center" v-tippy="'Searches on programs may take a long time and/or time out. There is a time out limit of 30 minutes. For faster searches, we suggest combining it with a cone search, or searching by carton instead.'">
              <v-icon class='align-center' size="x-small">mdi-help-circle-outline</v-icon>Program Caveat</p>
            </v-row>
          </v-col>
          <v-col cols="auto" md="3">
            <dropdown-select label="Cartons" id="cartons" :items="store.cartons" v-model="formData.carton"/>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="3">
            <!-- observed targets toggle -->
            <v-switch
              v-tippy="{content:'Toggle between only observed targets or all targets', placement: 'left', maxWidth:200}"
              v-model="formData.observed"
              color="success"
              :label="`Targets: ${formData.observed ? 'Observed' : 'All'}`"
              hide-details
              inset
            ></v-switch>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="4">
            <!-- search button -->
            <v-btn rounded="lg" color='primary' @click="submit_form" size="large" :disabled="!valid" :append-icon="valid ? 'mdi-check-circle' : 'mdi-close-circle'">Search
              <template v-slot:append>
                <v-icon size='large' :color="!valid ? 'error' : 'success'"></v-icon>
              </template>
              <progress-circle :loading="loading"></progress-circle>
            </v-btn>
          </v-col>
          <v-col cols="4">
            <!--revalidate search form -->
            <v-btn color="warning" rounded="lg" @click="revalidate" size="large">Revalidate
            </v-btn>
          </v-col>
          <v-col cols="4">
            <!-- reset form -->
            <v-btn rounded="lg" @click="reset_form" size="large">Reset</v-btn>
          </v-col>

          <v-banner v-if="fail" class='ma-4' color="error" lines="one" icon="mdi-alert-box"><v-banner-text>{{ failmsg }}</v-banner-text></v-banner>
        </v-row>
      </v-container>
    </v-form>
</template>

<script setup lang="ts">

import { ref, onMounted, watch } from 'vue'
import TextInput from '@/components/TextInput.vue'
import DropdownSelect from '@/components/DropdownSelect.vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app'
import useStoredTheme from '@/composables/useTheme'
import axiosInstance from '@/axios'
import ProgressCircle from '@/components/ProgressCircle.vue'

// get the application state store and router
const store = useAppStore()
const router = useRouter()

// mount the stored theme
useStoredTheme()

// set up a form reference, is the name in v-form ref="form"
let form = ref(null);

// set up validation rules

// coordinate regex
const re = /([0-9.hms\s:]+)(,|\s)+([+-]?[0-9.dms\s:]+)/gm;

let coordRules = [
  (value: string) => {
    if (!value) return true
    return value.match(re) != null || 'Value does not match sky coordinate regex'
  },
]
let idRules = [
  (value: number) => !isNaN(value) || 'Value must be a number.',
]

let radiusRules = [
  (value: number) => !isNaN(value) || 'Value must be a number.',
]

let altidRules = [
  (value: string) => (!!value ? /^[a-zA-Z0-9-+]+$/.test(value) : true) || 'Only alphanumeric characters and hyphens are allowed.',
]

// parameters
let loading = ref(false)
let coordsDisabled = ref(false)
let idDisabled = ref(false)
let searchType = ref('sdssid')

// create initial state of formData
let initFormData = {
  coords: '',
  ra: '',
  dec: '',
  radius: '0.1',
  id: '',
  altid: '',
  units: 'degree',
  release: store.release,
  carton: '',
  program: '',
  observed: true
}
// create dynamic bindings to form fields
let formData = ref({ ...initFormData })
let fail = ref(false)
let failmsg = ref('')
let valid = ref(false)
//let filteredCartons = ref([ ...store.cartons ])
let filteredCartons = ref([])

// create watcher for the form validation
watch(formData, async () => {
  console.log('in watcher validate')

  // update id/coords disabled states
  idDisabled.value = !!formData.value.coords.trim()
  coordsDisabled.value = !!formData.value.id.trim() || !!formData.value.altid.trim()

  const formValid = await form.value.validate(); // validate the form
  valid.value = formValid.valid; // update the valid state
}, { deep: true }); // deep watch to track nested property changes


// events
async function submit_form(this: any) {
    // Handle the search form submission here

    // set loading flag
    loading.value = true

    // manually validate form just for safe measure
    const formValid = await form.value.validate()
    console.log('valid form', formValid)
    if (!formValid.valid) {
      let msg = "Form is not valid.  Check form inputs again."
      set_fail(msg)
      return
    }

    // extract out ra and dec fields from coords
    [formData.value.ra, formData.value.dec] = extract_coords(formData.value.coords)
    console.log('submitting', formData.value)

    let hdr1 = {'Content-Type': 'application/json'}
    let hdr = {...hdr1, ...store.get_auth_hdr()}
    await axiosInstance.post('/query/main',
        formData.value, {headers: hdr })
        .then((response) => {
          // handle the initial response
            console.log(response)

            // check for good status in response
            if (response.data['status'] != 'success') {
              let msg = `Response status failed: ${response.data['msg']}`
              set_fail(msg)
              throw new Error(msg)
            }

            // return the actual data
            fail.value = false
            return response.data['data']
        })
        .then((data) => {
          // handle the actual data results
          console.log("new", data)

          // turn off loading flag
          loading.value = false

          // store the search results
          store.save_search_results(data);

          // Use Vue Router to navigate to the "results" page and pass the data as a route parameter
          router.push({ name: 'Results' });
        })
        .catch((error) => {
          // catch any request failures

          // check the kind of error, axios or regular string
          let msg = (typeof error.toJSON == 'function') ? error.toJSON().message : error
          set_fail(`Request Error: ${msg}`)
          // reset_form()
        })
}

function extract_coords(coords: string) {
  // extract ra, dec coordinates from the input string and format them

  let [ra, dec] = ["", ""]
  if (coords.includes(',')) {
    [ra, dec] = coords.split(',')
  } else if (coords.includes(' ')) {
    let obj = coords.split(' ')
    switch (obj.length) {
      case 2:
        // [ra, dec]
        [ra, dec] = obj
        break
      case 3:
        // [ra, "", dec]
        [ra, dec] = [obj[0], obj[2]]
      case 6:
        // [hh, mm, ss, dd, mm, ss]
        [ra, dec] = [obj.slice(0, 3).join(' '), obj.slice(3, 6).join(' ')]
        break
      default:
        [ra, dec] = obj
    }
  } else {
    [ra, dec] = ["", ""]
  }

  return [ra.trim(), dec.trim()]
}

async function revalidate() {
  // revalidate the search form
  const formValid = await form.value.validate()
  valid.value = formValid.valid
  console.log('valid', valid.value)
}

async function reset_form() {
  // reset the form data
  console.log('resetting form')

  // reset the entire formData object to its initial state
  Object.assign(formData.value, initFormData);

  // reset other values
  valid.value = false
  fail.value = false
  failmsg.value = ''
  loading.value = false
  idDisabled.value = false
  coordsDisabled.value = false

  // Reset the form validation state
  await form.value.resetValidation();
}

async function set_fail(msg : string) {
  // set the fail flags
  fail.value = true
  failmsg.value = msg
  loading.value = false
  console.error(msg)
}

onMounted(() => {

    // get database info
    store.get_db_info()

  // set up API call endpoints
    let endpoints = [
        `/query/list/cartons`,
        `/query/list/programs`,
        `/query/list/program-map`
        ]

    // check if the store already has data saved
    if (store.cartons.length !== 0) {
      console.log('data already loaded')
      return
    }

    // await the promises and cache the results in the store
    Promise.all(endpoints.map((endpoint) => axiosInstance.get(endpoint)))
    .then(([{data: carts}, {data: progs}, {data: progmap}] )=> {
      console.log({ carts, progs, progmap })
      store.store_cartons(carts, progs, progmap)
      console.log(filteredCartons)
    })
})

// //Immediate watch with deep option if needed
// watch(() => store.cartons, (newVal) => {
//   filteredCartons.value = newVal;
// }, { immediate: true, deep: true });


// // Watch for changes in selected program
// watch(formData.value.program, (newVal) => {
//   console.log('watching', newVal)
//   if (newVal && store.program_map[newVal]) {
//     filteredCartons.value = store.program_map[newVal].map(carton => {
//       console.log('inside here')
//       return store.cartons.find(item => item.id === carton)
//     }).filter(Boolean);
//   } else {
//     console.log('skipping, returning full cartons', store.cartons)
//     filteredCartons.value = store.cartons
//   }
// }, { immediate: true, deep: true })

</script>
