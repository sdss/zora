/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import pinia from '../store'
import router from '../router'

// Persisted State
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
pinia.use(piniaPluginPersistedstate)

// Types
import type { App } from 'vue'

// Vue Tippy
import { plugin as VueTippy } from 'vue-tippy'
import 'tippy.js/dist/tippy.css' // optional for styling
import 'tippy.js/themes/light-border.css'

// Vue Papa parse
import VuePapaParse from 'vue-papa-parse'


export function registerPlugins(app: App) {
  loadFonts()
  app.use(vuetify).use(router).use(pinia)

  // Vue Papa Parse
  app.use(VuePapaParse, {

  })

  // VueTippy plugin and options
  app.use(VueTippy, {
    directive: 'tippy', // => v-tippy
    component: 'tippy', // => <tippy/>
    componentSingleton: 'tippy-singleton', // => <tippy-singleton/>,
    defaultProps: {
      placement: 'auto-end',
      allowHTML: true,
      hideOnClick: false,
      distance: '20',
      delay: [250, 0],
      interactive: true,
      interactiveBorder: 0,
      boundary: "window",
      arrow: true,
      theme: 'light-border',
      offset: [0, 0]
    }, // => Global default options * see all props
  })
}
