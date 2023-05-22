import { vi, describe, it, expect } from 'vitest'

// stores/app.spec.ts
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '../app'


describe('App Store', () => {
    beforeEach(() => {
      // creates a fresh pinia and make it active so it's automatically picked
      // up by any useStore() call without having to pass it to it:
      // `useStore(pinia)`
      setActivePinia(createPinia())
    })

    it('gets releases', () => {
      const store = useAppStore()
      store.all_releases = ['DR18', 'DR17', 'DR16', 'IPL2', 'IPL1', 'WORK']
      const rels = store.get_releases()
      expect(rels).toContain('DR16')
      expect(rels).not.toContain("IPL2")
    })

    it('gets releases with login', () => {
        const store = useAppStore()
        store.all_releases = ['DR18', 'DR17', 'DR16', 'IPL2', 'IPL1', 'WORK']
        store.logged_in = true
        const rels = store.get_releases()
        expect(rels).toContain('DR16')
        expect(rels).toContain("IPL2")
      })

      it('updates releases', () => {
        const store = useAppStore()
        store.all_releases = ['DR18', 'DR17', 'DR16', 'IPL2', 'IPL1', 'WORK']
        store.update_release('DR17')
        expect(store.release).toEqual('DR17')
      })

      it('checks the release', () => {
        const store = useAppStore()
        store.all_releases = ['DR18', 'DR17', 'DR16', 'IPL2', 'IPL1', 'WORK']

        // log in and set release to private one
        store.logged_in = true
        store.update_release('IPL2')
        expect(store.release).toEqual('IPL2')

        // log out and check the release is public
        store.logged_in = false
        store.check_release()
        expect(store.release).toEqual('DR18')
      })

      it('resets users', () => {
        const store = useAppStore()
        store.user = {username: 'test'}
        store.reset_user()
        expect(store.user).toEqual({})
      })

      it('gets a username', () => {
        const store = useAppStore()
        store.user = {username: 'test'}
        const name = store.get_user()
        expect(name).toEqual('test')
      })

      it('gets auth header', () => {
        const store = useAppStore()
        store.auth = {"access_token": 'test'}
        const hdr = store.get_auth_hdr()
        expect(hdr).toEqual({ Authorization: 'Bearer test' })
      })
  })