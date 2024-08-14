// Utilities
import { defineStore } from 'pinia'
import axiosInstance from '@/axios'

export const useAppStore = defineStore('app', {
  state: () => ({
    release: '',
    all_releases: [],
    logged_in: false,
    user: {},
    auth: {},
    searchResults: [],
    cartons: [],
    programs: [],
    program_map: {},
    carton_map: {},
    db_info: {},
    flat_db: {},
    theme: '',
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
    },

    save_search_results(results: []) {
      // save the search results
      this.searchResults = results
    },

    store_cartons(cartons: [], programs: [], progmap: {}) {
      // save the carton and program lists
      this.cartons = cartons
      this.programs = programs
      this.program_map = progmap

      // reverse the map
      this.carton_map = Object.entries(this.program_map).reduce((acc, [key, values]) => {
        values.forEach(value => {
          acc[value] = acc[value] ? [...acc[value], key] : [key]
        })
        return acc
      }, {})
    },

    is_allowed() {
      // checks if a user is logged in or if the release is public
      return this.logged_in || (!this.logged_in && this.release.startsWith("DR"))
    },

    get_field_from_db(column: string, field: string) {
      // looks up a db column description from the flattened db metadata

      // set default value to the column name if the field is display_name, otherwise null
      let default_val = (this.flat_db[column] === undefined && field === 'display_name') ? column : null

      return this.flat_db[column] ? this.flat_db[column][field] : default_val;
    },

    async get_db_info(refresh: boolean = true) {
      // get the database metadata info for column descriptions and such
      // always refresh

      if (!refresh && Object.keys(this.db_info).length !== 0) {
          console.log('db info already loaded')
          return
      }

      await axiosInstance.get('/info/database')
          .then((response) => {
              // store the db metadata
              this.db_info = response.data

              // flatten the db_info object
              this.flat_db =  Object.fromEntries(Object.entries(this.db_info).flatMap(([schema, table])=>Object.entries(table)))

          })
          .catch((error) => {
              console.error(error.toJSON())
          })
    }

  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'app-release',
        storage: sessionStorage,
        paths: ['release', 'all_releases'],
      },
      {
        key: 'app-user',
        storage: sessionStorage,
        paths: ['user', 'auth', 'logged_in'],
      },
      {
        key: 'app-theme',
        storage: sessionStorage,
        paths: ['theme']
      }
    ],
  },
})
