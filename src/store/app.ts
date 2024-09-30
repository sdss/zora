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
    dbkey_lookup: {},
    theme: '',
    aladin: null,
    result_targs: []
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

    get_obj_from_db(column: string, context: Object = {}) {
      // lookup the db metadata object for a column

      // get all possible keys for the column name
      const default_val = {}
      const possibleKeys = this.dbkey_lookup[column]

      if (!possibleKeys || possibleKeys.length === 0) {
        // Column name not found in metadata
        return default_val
      } else if (possibleKeys.length === 1) {
        // Unique column name, retrieve metadata directly
        const fullKey = possibleKeys[0]
        return this.flat_db[fullKey] || default_val
      } else {
        // Ambiguous column name
        // Use context to resolve ambiguity
        const { schema, table } = context;

        let filteredKeys = possibleKeys;

        if (schema) {
          filteredKeys = filteredKeys.filter(key => key.startsWith(`${schema}.`));
        }

        if (table) {
          filteredKeys = filteredKeys.filter(key => key.includes(`.${table}.`));
        }

        if (filteredKeys.length === 1) {
          const fullKey = filteredKeys[0];
          return this.flat_db[fullKey] || default_val;
        } else if (filteredKeys.length > 1) {
          // Still ambiguous after applying context
          // return first match
          return this.flat_db[filteredKeys[0]] || default_val;
        } else {
          // No matching keys after applying context
          return default_val;
        }
      }
    },

    get_field_from_db(column: string, field: string, context: Object = {}) {
      // looks up a db column field from the flattened db metadata object

      // set default value to the column name if the field is display_name, otherwise null
      const default_val = field === 'display_name' ? column : null;
      const mapping = this.get_obj_from_db(column, context);
      return mapping[field] || default_val;
    },

    set_result_data(data: any) {
      // set search results target data
      this.result_targs = data
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
              console.log('db info loaded', this.db_info)

              // flatten the db_info object, prefix schema to table.colum keys
              this.flat_db = Object.fromEntries(
                Object.entries(this.db_info).flatMap(([schema, table]) =>
                  Object.entries(table).map(([key, value]) => [`${schema}.${key}`, value])
                )
              )

              // preprocess the flattened metadata to create an index
              // of column names to any resolved schema.table.column key names
              this.dbkey_lookup = {};

              for (const fullKey in this.flat_db) {
                const parts = fullKey.split('.');
                const columnName = parts[2];
                if (!this.dbkey_lookup[columnName]) {
                  this.dbkey_lookup[columnName] = [];
                }
                this.dbkey_lookup[columnName].push(fullKey);
              }

          })
          .catch((error) => {
              console.error(error.toJSON())
          })
    },
  },
  persist: {
    omit: ['result_targs', 'aladin'],
    strategies: [
      {
        key: 'app-release',
        storage: sessionStorage,
        pick: ['release', 'all_releases'],
      },
      {
        key: 'app-user',
        storage: sessionStorage,
        pick: ['user', 'auth', 'logged_in'],
      },
      {
        key: 'app-theme',
        storage: sessionStorage,
        pick: ['theme']
      }
    ]
  },
})
