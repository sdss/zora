// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    release: '',
    all_releases: [],
    logged_in: false,
    user: {},
    auth: {}
  }),
  actions: {
    get_releases() {
      // get the available releases based on user login status
      return this.logged_in ? this.all_releases : this.all_releases.filter((rel: string) => rel.startsWith('DR'))
    },

    update_release(release: string) {
      // update the selected release
      release ? '' : console.log('release cannot be null. setting to', this.all_releases[0])
      this.release = release || this.all_releases[0]
      console.log('updating release', release)
      console.log('meta env', import.meta.env)
    },

    check_release() {
      // check the selected release when logging out to ensure a public one is selected
      this.release = (!this.release.startsWith("DR") && !this.logged_in) ? this.get_releases()[0] : this.release
    },

    reset_user() {
      // reset the user and auth information
      this.user = {}
      this.auth = {}
    },

    get_auth_hdr() {
      // create a header entry with the token authorizaton set
      return 'access_token' in this.auth ? {'Authorization': `Bearer ${this.auth.access_token}`} : {}
    },

    get_user() {
      // get the username from the user member info
      return 'username' in this.user ? this.user.username : ''
    }
  }
})
