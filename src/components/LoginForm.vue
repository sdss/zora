<template>
    <v-menu offset-y location="bottom" :close-on-content-click="false" v-model="menu">
        <!-- login button -->
        <template v-slot:activator="{ props }">
          <v-btn v-if="!store.logged_in" v-bind="props" v-tippy="'Log in User'" id="login">
            <v-icon icon="mdi-account-arrow-right" class="ma-2" size="x-large"/>
        </v-btn>
        <v-btn v-else @click="reset" v-tippy="'Log out User'" id="logout">
          <v-icon icon="mdi-account-arrow-left" class="ma-2" size="x-large"/>
          {{ store.get_user() }}
        </v-btn>
        </template>

        <!-- login menu display -->
        <v-card>
          <v-form v-model="valid" fast-fail @submit.prevent="login" id="login-form" ref="form">
            <v-card-title>Login</v-card-title>
            <v-card-text>
              <!-- input fields -->
              <v-text-field label="User" v-model="user" :rules="userRules" id="user"></v-text-field>
              <v-text-field label="Password" v-model="password" type="password" :rules="passRules" id="pass"></v-text-field>

              <!-- failed login banner -->
              <v-banner v-if="fail" class='ma-4' color="error" lines="one" icon="mdi-alert-box"><v-banner-text>Login Failed</v-banner-text></v-banner>
            </v-card-text>

            <!-- login actions -->
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn type="submit" color="primary" :disabled="!valid" form="login-form" id="submitbtn">Login</v-btn>
              <v-btn color="secondary" @click="reset" id="resetbtn">Reset</v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-menu>
</template>

<script lang="ts" setup>

import axiosInstance from '@/axios';
import { useAppStore } from '@/store/app';
import { ref } from 'vue';

// get the application state store
const store = useAppStore()

// set the login data properties
let user = ref('')
let password = ref('')
let valid = ref(false)
let menu = ref(false)
let fail = ref(false)

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


async function login() {
    // login via the valis API
    console.log('logging in now')

    await axiosInstance.post(import.meta.env.VITE_API_URL + '/auth/login',
        {"username": user.value, "password": password.value},
        {headers: {'Content-Type': 'multipart/form-data'}})
        .then((response) => {
            // store the auth info
            store.auth = response.data
            get_user()
        })
        .catch((error) => {
            console.error(error.toJSON())
            fail.value = true
            reset()
        })
}

async function get_user() {
    // get the user member info
    await axiosInstance.post(import.meta.env.VITE_API_URL + '/auth/user', {}, {headers: store.get_auth_hdr()})
        .then((response) => {
            // store the user info
            store.user = response.data
            // set user as logged in
            store.logged_in = true
            menu.value = false
            fail.value = false
          })
        .catch((error) => {
            console.log(error.toJSON())
            fail.value = true
            reset()
        })
}

function reset() {
    // reset the login form
    user.value = ''
    password.value = ''
    valid.value = false
    store.logged_in = false
    store.reset_user()
    store.check_release()
    store.update_release(store.release)
}

</script>
