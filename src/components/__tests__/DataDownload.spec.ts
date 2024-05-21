import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { createTestingPinia } from '@pinia/testing'

import DataDownload from '../DataDownload.vue'


// use describe to organize tests around each component, better for reports
describe('DataDownload', () => {
    const vuetify = createVuetify({ components, directives })
    const pinia = createTestingPinia()

    let files = [
        "/tmp/sdss/sas/ipl-3/spectro/boss/redux/v6_1_2/spectra/lite/015078/59187/spec-015078-59187-4291570940.fits",
        "/tmp/sdss/sas/ipl-3/spectro/apogee/redux/1.2/stars/apo25m/14/14966/apStar-1.2-apo25m-2M00104221+5744297.fits",
        "/tmp/sdss/sas/ipl-3/spectro/astra/0.5.0/spectra/star/25/44/mwmStar-0.5.0-54392544.fits"
    ]

    let wrapper

    beforeEach(() => {
      wrapper = mount(DataDownload, {
        global: {
          plugins: [vuetify, pinia]
        },
        props: {
          files: []
        }
      })
    })

    it('should convert paths correctly', () => {
      const convertPath = wrapper.vm.convertPath
      const path = files[0]
      const key = 'http'
      const convertedPath = convertPath(path, key)
      expect(convertedPath).toBe(`https://data.sdss5.org/sas/ipl-3/spectro/boss/redux/v6_1_2/spectra/lite/015078/59187/spec-015078-59187-4291570940.fits`)
    })

    it('should generate correct wget code', async () => {
      wrapper.setProps({ files })
      await wrapper.vm.$nextTick();
      const generateCode = wrapper.vm.generateCode
      const code = generateCode('http')
      expect(code).toContain('wget https://data.sdss5.org/sas/ipl-3/spectro/boss/redux/v6_1_2/spectra/lite/015078/59187/spec-015078-59187-4291570940.fits')
    })

    it('should generate correct rsync code', async () => {
      wrapper.setProps({ files })
      await wrapper.vm.$nextTick();
      const generateCode = wrapper.vm.generateCode
      const code = generateCode('rsync')
      console.log('Generated wget code:', code)
      console.log('here')
      expect(code).toContain('rsync -avz --no-motd rsync://sdss5@dtn.sdss.org/ipl-3/spectro/boss/redux/v6_1_2/spectra/lite/015078/59187/spec-015078-59187-4291570940.fits .')
    })

    it('should update download options when files prop changes', async () => {
        await wrapper.setProps({ files })
        await wrapper.vm.$nextTick()  // Wait for the watcher to trigger

        const updatedOptions = wrapper.vm.dloptions
        updatedOptions.forEach(option => {
            const expectedCode = wrapper.vm.generateCode(option.key)
            expect(option.code).toBe(expectedCode)
        })
    })

})