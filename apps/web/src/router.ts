import { createRouter, createWebHistory } from 'vue-router'
import { mailRoutes } from '@/modules/mail'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/mail' },
    ...mailRoutes
  ]
})
