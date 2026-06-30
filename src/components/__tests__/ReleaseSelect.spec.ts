
import { vi, describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import axios from 'axios'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { createTestingPinia } from '@pinia/testing'

import ReleaseSelect from '../ReleaseSelect.vue'


function get_releases() {
    return ['DR18', 'DR17', 'DR16', 'DR15', 'DR14', 'DR13', 'IPL2', 'IPL1', 'WORK']
  }

vi.mock('axios')

// use describe to organize tests around each component, better for reports
describe('ReleaseSelect', () => {
    const vuetify = createVuetify({ components, directives })
    const pinia = createTestingPinia()

    axios.get.mockResolvedValue({
        data: get_releases(),
      })

    // use it or test to write a specific unit test
    it('renders properly', async () => {

        const wrapper = mount(ReleaseSelect, { global: { plugins: [vuetify, pinia]}})
        await wrapper.vm.$nextTick()

        expect(axios.get).toHaveBeenCalledTimes(1)
        const url = import.meta.env.VITE_API_URL + '/envs/releases?public=False&release=DR17'
        expect(axios.get).toHaveBeenCalledWith(url)

        expect(wrapper.text()).toContain('Data Release')

      })

    it('selects a release', async () => {
      const wrapper = mount(ReleaseSelect, { global: { plugins: [vuetify, pinia]}})
      await wrapper.vm.$nextTick()

      const release = wrapper.get('#release')
      await release.setValue("DR15")
      expect(release.element.value).toBe('DR15')

    })

})