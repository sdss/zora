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
      <v-col class="d-none d-sm-flex" id="pagelinks">
        <v-btn v-for="(item, i) in links" :key="i" :value="item"
        v-tippy='{"content": `${item.tippy}`, "placement": "bottom", "popperOptions": {"strategy": "fixed"}}'
          :prepend-icon="item.icon">
          <RouterLink :to="item.site">{{item.text}}</RouterLink>
        </v-btn>

        <!-- Conditionally render DataView button -->
        <v-btn v-if="showdataviz" :prepend-icon="dataviewlink.icon" v-tippy="dataviewlink.tippy">
          <RouterLink :to="dataviewlink.site">{{dataviewlink.text}}</RouterLink>
        </v-btn>
      </v-col>

      <v-spacer></v-spacer>
      <!-- release select -->
      <v-col cols="2" md="2" sm="3" class="d-none d-sm-flex">
        <release-select />
      </v-col>

      <!-- Login -->
      <v-col cols="auto">
        <login-form />
      </v-col>

      <!-- toggle theme -->
      <v-btn @click="toggleTheme" v-tippy="'Toggle Theme'"><v-icon icon="mdi-theme-light-dark"/></v-btn>
    </v-row>
  </v-app-bar>

  <!-- navigation drawer for small screens -->
  <v-navigation-drawer v-model="drawer" app temporary :width="175">
    <v-list>
      <!-- header -->
      <v-list-item>
        <span>SDSS</span>
      </v-list-item>

      <!-- page links -->
      <v-list-item
        v-for="(item, i) in links"
        :key="i"
        :value="item"
        link
      >
        <template v-slot:prepend>
          <v-icon :icon="item.icon" size="small"></v-icon>
        </template>

        <v-list-item-title><RouterLink :to="item.site">{{ item.text }}</RouterLink></v-list-item-title>
      </v-list-item>

      <!-- Conditionally render DataView link -->
      <v-list-item v-if="showdataviz" link>
        <template v-slot:prepend>
          <v-icon :icon="dataviewlink.icon" size="small"></v-icon>
        </template>
        <v-list-item-title><RouterLink :to="dataviewlink.site">{{ dataviewlink.text }}</RouterLink></v-list-item-title>
      </v-list-item>

      <!-- release select -->
      <v-list-item>
        <release-select />
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { RouterLink } from "vue-router"
import ReleaseSelect from '@/components/ReleaseSelect.vue'
import LoginForm from '@/components/LoginForm.vue'
import { useTheme } from 'vuetify'
import { useAppStore } from '@/store/app'

const store = useAppStore()
const drawer = ref(false);
const theme = useTheme()

const links = [
        { text: 'Home', icon: 'mdi-home', site: '/', tippy: 'Home - quick access to features' },
        { text: 'About', icon: 'mdi-help', site: '/about', tippy: 'Learn more about Zora' },
        { text: 'Search', icon: 'mdi-magnify', site: '/search', tippy: 'Search for SDSS targets' },
        { text: 'Explore', icon: 'mdi-binoculars', site: '/explore', tippy: 'Explore SDSS on the sky'}
      ]

// Local state variable for showing the DataView button
const showdataviz = computed(() => { return ['IPL3', 'DR19'].includes(store.release)})
const dataviewlink = { text: 'DataView', icon: 'mdi-chart-scatter-plot', site: '/dataview', tippy: 'Explore SDSS output parameters' }

// function to toggle the dark/light theme
function toggleTheme () {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  store.theme = theme.global.name.value
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
