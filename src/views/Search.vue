<template>
    <v-form v-model="valid" fast-fail @submit.prevent ref="form">
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
            <v-col cols="12" md="6">
            <!-- search id field -->
            <text-input
              v-model="formData.ids"
              label="ID Search"
              placeholder="14442699"
              hint="Enter an SDSS identifier"
              :rules="idRules"
              id="id"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <v-btn rounded="lg" @click="submit_form" size="large" :disabled="!valid">Search</v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn rounded="lg" @click="reset_form" size="large">Reset</v-btn>
          </v-col>

          <v-banner v-if="fail" class='ma-4' color="error" lines="one" icon="mdi-alert-box"><v-banner-text>{{ failmsg }}</v-banner-text></v-banner>
        </v-row>
      </v-container>
    </v-form>
</template>

<script setup lang="ts">

import axios from 'axios'
import { ref } from 'vue'
import TextInput from '@/components/TextInput.vue'
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app'

// get the application state store and router
const store = useAppStore()
const router = useRouter()

// set up a form reference, is the name in v-form ref="form"
let form = ref(null);

// set up validation rules

// coordinate regex
const re = /([0-9.hms\s:]+),\s*([+-]?[0-9.dms\s:]+)/gm;

let coordRules = [
  (value: string) => !!value || 'Required field.',
  (value: string) => value.match(re) != null || 'Value does not match sky coordinate regex',

];
let radiusRules = [
  (value: number) => !!value || 'Required field.',
  (value: number) => !isNaN(value) || 'Value must be a number.',
];
let idRules: [] = []

// create initial state of formData
let initFormData = {
  coords: '',
  ra: '',
  dec: '',
  radius: '',
  ids: '',
  units: 'degree',
  release: store.release
}
// create dynamic bindings to form fields
let formData = ref({ ...initFormData })
let fail = ref(false)
let failmsg = ref('')
let valid = ref(false)

// events
async function submit_form(this: any) {
    // Handle the search form submission here

    // manually validate form just for safe measure
    const valid = await form.value.validate()
    if (!valid.valid) {
      let msg = "Form is not valid.  Check form inputs again."
      set_fail(msg)
      return
    }

    // extract out ra and dec fields from coords
    [formData.value.ra, formData.value.dec] = formData.value.coords.split(',')
    console.log('submitting', formData.value)

    // submit the POST request to Valis
    await axios.post(import.meta.env.VITE_API_URL + '/query/main',
        formData.value,
        {headers: {'Content-Type': 'application/json'}})
        .then((response) => {
          // handle the initial response
            console.log(response.data)

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

async function reset_form() {
  // reset the form data

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

</script>
