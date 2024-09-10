/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'
import router from './router'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)

registerPlugins(app)

// Wait until the router is ready before mounting the app
// see https://www.vuemastery.com/blog/vue-router-4-route-params-not-available-on-created-setup/
router.isReady().then(() => {
    app.mount('#app')
})
