<template>
  <v-app-bar app flat>
    <v-row align="center">
      <!-- Orbit icon as drawer toggle button on small screens -->
      <v-col cols="auto" class="d-flex d-sm-none">
        <v-app-bar-nav-icon @click="drawer = !drawer">
          <v-icon size='large' icon="mdi-orbit" color="deep-purple-lighten-2"/>
        </v-app-bar-nav-icon>
      </v-col>

      <!-- Title area (visible on all screens) -->
      <v-col cols="auto" class="d-none d-sm-flex">
        <v-app-bar-title class="ma-2">
          <v-icon icon="mdi-orbit" />
          SDSS
        </v-app-bar-title>
      </v-col>

      <!-- page links -->
      <v-col class="d-none d-sm-flex">
        <v-btn justify="start"><RouterLink to="/">Home</RouterLink></v-btn>
        <v-btn><RouterLink to="/about">About</RouterLink></v-btn>
        <v-btn><RouterLink to="/search">Search</RouterLink></v-btn>
      </v-col>

      <v-spacer></v-spacer>
      <!-- release -->
      <v-col cols="2" md="2" sm="3" class="d-none d-sm-flex">
        <release-select />
      </v-col>

      <!-- Login -->
      <v-col cols="auto">
        <login-form />
      </v-col>

      <!-- toggle theme -->
      <!-- <v-btn @click="toggleTheme"><v-icon icon="mdi-theme-light-dark"/></v-btn> -->
    </v-row>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" app temporary :width="175">
    <v-list>
      <v-list-item>
        <span>SDSS</span>
      </v-list-item>
      <v-list-item link>
        <v-list-item-content><RouterLink to="/">Home</RouterLink></v-list-item-content>
      </v-list-item>
      <v-list-item link>
        <v-list-item-content><RouterLink to="/about">About</RouterLink></v-list-item-content>
      </v-list-item>
      <v-list-item link>
        <v-list-item-content><RouterLink to="/search">Search</RouterLink></v-list-item-content>
      </v-list-item>
      <v-list-item>
        <release-select />
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from "vue-router"
import ReleaseSelect from '@/components/ReleaseSelect.vue'
import LoginForm from '@/components/LoginForm.vue'
import { useTheme } from 'vuetify'

const drawer = ref(false);
const theme = useTheme()

function toggleTheme () {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const closeDrawerOnResize = () => {
  if (window.innerWidth >= 600) { // Adjust this value based on your breakpoint
    drawer.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', closeDrawerOnResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', closeDrawerOnResize);
});

</script>
