// Utilities
import { defineStore } from 'pinia'
import axios, { AxiosResponse } from 'axios'
import {parseSimbadResponse, parseNEDResponse} from '@/utils/parseSimbadNEDResponse'

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
    db_info: {}
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
    }

  }
})


// Split store in logical component. `search` store will contain all data related to search form/process.
export const useSearchStore = defineStore('search', {
  state: () => ({
    resolverName: '',
    resolverServer: 'simbad',
    resolverStatus: null,
    resolverMessage: '',
    resolverCoords: null,
    resolverIsLoading: false,
  }),
  actions: {
    resolveName() {

      let url: string
      
      // Resolve button clicked without providing the target name
      if (this.resolverName == '') {
        this.resolverStatus = 'error'
        this.resolverMessage = 'Target Name is required'
        this.resolverCoords = null
        this.resolverIsLoading = false
        return
      }

      // select server resolver      
      switch (this.resolverServer) {
        case 'simbad':
          url = `https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(this.resolverName)}&output.format=votable&output.params=main_id,coo(d)`
          break
        case 'ned':
          // NED via Sesame CDS https://vizier.cds.unistra.fr/vizier/doc/sesame.htx
          // NED directly does not allow due to CORS
          url = `https://cds.unistra.fr/cgi-bin/nph-sesame/-ox/~N?${encodeURIComponent(this.resolverName)}`
          break
        default:
          throw new Error('Unknown name resolver')
      }

      // set loading status while response is going on
      this.resolverIsLoading = true

      let res: {status: string, message: string, payload: any}

      axios
        .get(url)
        .then((response) => {
          console.log('debug1');
          switch (this.resolverServer) {
            case 'simbad':
              res = parseSimbadResponse(response.data)
              break
            case 'ned':
              res = parseNEDResponse(response.data)
              break
          } 
          // successful server response, but status can be `error` if cannot find object in DB
          this.resolverStatus = res.status
          this.resolverMessage = res.message
          this.resolverCoords = res.payload
          this.resolverIsLoading = false
      })
      .catch((error) => {
        // error response is something went wrong
        this.resolverStatus = 'error'
        this.resolverMessage = `"${this.resolverServer}" cannot successfully resolve "${this.resolverName}" to coordinates`
        this.resolverCoords = null
        this.resolverIsLoading = false
        // error details will be posted in console
        console.warn(error);
      })
    },
    // cleanup Target Resolver input
    resetResolver() {
      this.resolverStatus = null,
      this.resolverMessage = '',
      this.resolverCoords = null,
      this.resolverIsLoading = false
    }
  }
})