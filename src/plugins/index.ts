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

// Types
import type { App } from 'vue'

// Vue Tippy
import { plugin as VueTippy } from 'vue-tippy'
import 'tippy.js/dist/tippy.css' // optional for styling
import 'tippy.js/themes/light-border.css'


export function registerPlugins(app: App) {
  loadFonts()
  app.use(vuetify).use(router).use(pinia)

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
