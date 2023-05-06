// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    release: '',
    all_releases: [],
    logged_in: false,
    user: ''
  }),
  actions: {
    get_releases() {
      return this.logged_in ? this.all_releases : this.all_releases.filter((rel: string) => rel.startsWith('DR'))
    },

    update_release(release: string) {
      !release ? console.log('release cannot be null. setting to', this.all_releases[0]) : ''
      this.release = release ? release : this.all_releases[0]
      console.log('updating release', release)
    },

    check_release() {
        this.release = (!this.release.startsWith("DR") && !this.logged_in) ? this.all_releases[0] : this.release
    }
  }
})
