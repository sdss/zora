// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Main.vue'),
    children: [
      {
        path: '/',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (home.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue')
      },
      {
        path: '/about',
        name: 'about',
        component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue')
      },
      {
        path: '/search',
        name: 'Search',
        component: () => import(/* webpackChunkName: "search" */ '@/views/Search.vue')
      },
      {
        path: '/results',
        name: 'Results',
        component: () => import(/* webpackChunkName: "results" */ '@/views/Results.vue')
      },
      {
        path: '/target/:sdss_id?',
        name: 'target',
        component: () => import(/* webpackChunkName: "results" */ '@/views/Target.vue')
      },
      {
        path: '/dataview',
        name: 'dataview',
        component: () => import(/* webpackChunkName: "results" */ '@/views/DataView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes
})

export default router
