import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/pages/admin/Dashboard.vue';
import Product from '@/pages/admin/Product.vue';
import Login from '@/pages/admin/Login.vue';
import UserRefferal from '@/pages/admin/UserRefferal.vue';
import NotFound from '@/NotFound.vue';

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
    path: '/admin/product',
    name: 'Product',
    component: Product
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
  {
    path: '/',
    redirect: '/admin/user-refferal'
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
