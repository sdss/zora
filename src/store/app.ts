// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    release: '',
    logged_in: false,
    user: ''
  })
})
