import type { RouteRecordRaw } from 'vue-router'

export const mailRoutes: RouteRecordRaw[] = [
  {
    path: '/mail',
    component: () => import('./views/MailWorkstationView.vue'),
    meta: { requiresAuth: true }
  }
]
