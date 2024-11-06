import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/pages/admin/Dashboard.vue';
import Catalog from '@/pages/admin/Catalog.vue';
import Login from '@/pages/admin/Login.vue';
import UserRefferal from '@/pages/admin/UserRefferal.vue';

const routes = [
  {
    path: '/admin/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/admin/catalog',
    name: 'Catalog',
    component: Catalog
  },
  {
    path: '/admin/user-refferal',
    name: 'UserRefferal',
    component: UserRefferal
  },
  {
    path: '/admin',
    redirect: '/admin/login'
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
