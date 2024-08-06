import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// must load this if component uses pinia store, even if not directly used in test
import { createTestingPinia } from '@pinia/testing'

import Search from '../Search.vue'


describe('Search', () => {
    const vuetify = createVuetify({ components, directives })
    const pinia = createTestingPinia()


    let wrapper

    beforeEach(() => {
        wrapper = mount(Search, {
          global: {
            plugins: [vuetify, pinia]
          },
          props: {
            files: []
          }
        })
      })

      it.each([
        ['123.45,67.89', '123.45', '67.89'],
        ['123.45, -67.89', '123.45', '-67.89'],
        ['123.45 +67.89', '123.45', '+67.89'],
        ['21:00:33.6 +25:17:56.4', '21:00:33.6', '+25:17:56.4'],
        ['21 00 33.6 25 17 56.4', '21 00 33.6', '25 17 56.4'],
        ['21h03m07.2s, -03d12m00s', '21h03m07.2s', '-03d12m00s'],
        ['21h 03m 07.2s -03d 12m 00s', '21h 03m 07.2s', '-03d 12m 00s']
      ])('splits coordinates "%s" into ra and dec', (coords, expRa, expDec) => {
        const extract_coords = wrapper.vm.extract_coords
        const [ra, dec] = extract_coords(coords)
        expect(ra).toBe(expRa)
        expect(dec).toBe(expDec)
      })


})