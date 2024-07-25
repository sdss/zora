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
            />
          </v-col>
          <v-col md=2>
            <!-- radius dropdown select -->
            <v-select
                v-model="formData.units"
                label="Unit"
                id="unit"
                :items="['degree', 'arcmin', 'arcsec']"
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
            <v-col cols="4" md="4">
            <!-- search id field -->
            <text-input
              v-model="formData.id"
              label="ID Search"
              placeholder="23326"
              hint="Enter an SDSS identifier"
              :rules="idRules"
              id="id"
            />
          </v-col>
          <v-col cols="4" md="4">
            <dropdown-select label="Programs" id="programs" :items="store.programs" v-model="formData.program"/>
          </v-col>
          <v-col cols="4" md="4">
            <dropdown-select label="Cartons" id="cartons" :items="store.cartons" v-model="formData.carton"/>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="4">
            <v-btn rounded="lg" color='primary' @click="submit_form" size="large" :disabled="!valid" :append-icon="valid ? 'mdi-check-circle' : 'mdi-close-circle'">Search
              <template v-slot:append>
                <v-icon size='large' :color="!valid ? 'error' : 'success'"></v-icon>
              </template>
            </v-btn>
          </v-col>
          <v-col cols="4">
            <v-btn color="warning" rounded="lg" @click="revalidate" size="large">Revalidate
            </v-btn>
          </v-col>
          <v-col cols="4">
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

// get the application state store and router
const store = useAppStore()
const router = useRouter()

// mount the stored theme
useStoredTheme()

// set up a form reference, is the name in v-form ref="form"
let form = ref(null);

// set up validation rules

const exclusiveFieldRule = () => {
  const coordsFilled = !!formData.value.coords.trim()
  const idFilled = !!formData.value.id.trim()
  const good = (coordsFilled && !idFilled) || (!coordsFilled && idFilled)
  return good || 'Either Coordinate or ID must be filled, but not both.'
};

// coordinate regex
const re = /([0-9.hms\s:]+),\s*([+-]?[0-9.dms\s:]+)/gm;

let coordRules = [
  // (value: string) => !!value || 'Required field.',
  exclusiveFieldRule,
  (value: string) => {
    if (!value) return true
    return value.match(re) != null || 'Value does not match sky coordinate regex'
  },
]
let radiusRules = [
  (value: number) => !isNaN(value) || 'Value must be a number.',
]
let idRules = [exclusiveFieldRule] //[(value: number) => !!value || 'Required field.']

// create initial state of formData
let initFormData = {
  coords: '',
  ra: '',
  dec: '',
  radius: '',
  id: '',
  units: 'degree',
  release: store.release,
  carton: '',
  program: ''
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
  const formValid = await form.value.validate(); // validate the form
  valid.value = formValid.valid; // update the valid state
}, { deep: true }); // deep watch to track nested property changes


// events
async function submit_form(this: any) {
    // Handle the search form submission here

    // manually validate form just for safe measure
    const formValid = await form.value.validate()
    console.log('valid form', formValid)
    if (!formValid.valid) {
      let msg = "Form is not valid.  Check form inputs again."
      set_fail(msg)
      return
    }

    // extract out ra and dec fields from coords
    [formData.value.ra, formData.value.dec] = formData.value.coords ? formData.value.coords.split(',') : ["", ""]
    console.log('submitting', formData.value)

    await axiosInstance.post('/query/main',
        formData.value, {headers: {'Content-Type': 'application/json'}})
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

  // Reset the form validation state
  await form.value.resetValidation();
}

async function set_fail(msg : string) {
  // set the fail flags
  fail.value = true
  failmsg.value = msg
  console.error(msg)
}

onMounted(() => {

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
