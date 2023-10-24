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
            <v-btn rounded="lg" @click="submit_form" :disabled="!valid" size="large">Search</v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn rounded="lg" @click="reset_form" size="large">Reset</v-btn>
          </v-col>

          <v-banner v-if="fail" class='ma-4' color="error" lines="one" icon="mdi-alert-box"><v-banner-text>Form Failed</v-banner-text></v-banner>
        </v-row>
      </v-container>
    </v-form>
</template>

<script setup lang="ts">

import axios from 'axios'
import { ref } from 'vue'
import TextInput from '@/components/TextInput.vue'

import { useAppStore } from '@/store/app'

// get the application state store
const store = useAppStore()

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
let valid = ref(false)

// events
async function submit_form(this: any) {
    // Handle the search form submission here

    // manually validate form just for safe measure
    const valid = await form.value.validate()
    if (!valid.valid) {
      console.error("Form is not valid.  Check form inputs again.")
      fail.value = true
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
            console.log(response.data)
            console.log(response.data['data'][0])
            fail.value = false
        })
        .catch((error) => {
            console.error(error.toJSON())
            fail.value = true
            reset_form()
        })
}

async function reset_form() {
  console.log('resetting', formData.value);
  // Reset the entire formData object to its initial state
  Object.assign(formData.value, initFormData);

  valid.value = false

  // Reset the form validation state
  await form.value.resetValidation();
}

</script>

