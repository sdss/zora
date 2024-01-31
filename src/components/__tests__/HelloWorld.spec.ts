import { describe, it, expect } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { mount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'
import { createTestingPinia } from '@pinia/testing'

describe('HelloWorld', () => {
  const vuetify = createVuetify({ components, directives })
  // need to import the testing store since the Home page uses the ConeSearch component
  // which uses the store
  const pinia = createTestingPinia()

  it('renders properly', () => {
    const wrapper = mount(HelloWorld, { global: { plugins: [vuetify] } })
    expect(wrapper.text()).toContain('Welcome toSDSS')
  })
})
