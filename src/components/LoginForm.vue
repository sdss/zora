<template>
    <v-menu offset-y location="bottom" :close-on-content-click="false" v-model="menu">
        <template v-slot:activator="{ props }">
          <v-btn v-if="!store.logged_in" v-bind="props">
            <v-icon icon="mdi-account-arrow-right" class="ma-2" size="x-large"/>
        </v-btn>
        <v-btn v-else @click="reset">
          <v-icon icon="mdi-account-arrow-left" class="ma-2" size="x-large"/>
          {{ store.user }}
        </v-btn>
        </template>
        <v-card>
          <v-form v-model="valid" fast-fail @submit.prevent="login" id="login-form">
            <v-card-title>Login</v-card-title>
            <v-card-text>
              <v-text-field label="User" v-model="user" :rules="userRules"></v-text-field>
              <v-text-field label="Password" v-model="password" type="password" :rules="passRules"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn type="submit" color="primary" :disabled="!valid" form="login-form">Login</v-btn>
              <v-btn color="secondary" @click="reset">Reset</v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-menu>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import { useAppStore } from '@/store/app'

// get the application state store
const store = useAppStore()

// set the login data props
let user = ref('')
let password = ref('')
let valid = ref(false)
let menu = ref(false)

// form user validation rules
let userRules = [
    (value: string) => !!value || 'Required field.',
    (value: string) => value.length >= 3 || 'Min 3 characters.',
    (value: string) => !value.includes("sdss") || "general sdss user not allowed.",
                ]
let passRules = [
    (value: string) => !!value || 'Required field.',
    (value: string) => value.length >= 6 || 'Min 6 characters.',
]


function login() {
    // login via the valis API
    console.log('logging in now')
    menu.value = false
    store.logged_in = true
    store.user = 'Brian'
}

function reset() {
    // reset the login form
    user.value = ''
    password.value = ''
    valid.value = false
    store.logged_in = false
    store.user = ''
}

</script>
