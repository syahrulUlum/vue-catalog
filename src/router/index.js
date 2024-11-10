import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/pages/admin/Dashboard.vue';
import Product from '@/pages/admin/product/Product.vue';
import ProductCreate from '@/pages/admin/product/ProductCreate.vue';
import ProductEdit from '@/pages/admin/product/ProductEdit.vue';
import Login from '@/pages/admin/Login.vue';
import UserRefferal from '@/pages/admin/UserRefferal.vue';
import NotFound from '@/NotFound.vue';
import Catalog from '@/pages/catalog/Catalog.vue';
import CatalogDetail from '@/pages/catalog/CatalogDetail.vue';

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
    children: [
      {
        path: "",
        name: 'Product',
        component: Product,
      },
      {
        path: 'create',
        name: 'ProductCreate',
        component: ProductCreate,
      },
      {
        path: 'edit/:id',
        name: 'ProductEdit',
        component: ProductEdit,
      },
    ]
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
    path: '/catalogs',
    children: [
      {
        path: "",
        name: 'Catalogs',
        component: Catalog,
      },
      {
        path: "detail/:id",
        name: 'CatalogDetail',
        component: CatalogDetail,
      },
    ],
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
