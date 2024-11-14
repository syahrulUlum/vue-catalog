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
import UserTransaction from '@/pages/UserTransaction.vue';
import { requireAuth } from '@/middlewares/authMiddleware';
import { requireGuest } from '@/middlewares/guestMiddleware';
import { requireRef } from '@/middlewares/refMiddleware';
import useCheckRef from '@/composables/useCheckRef';

const routes = [
  {
    path: '/',
    name: 'Home',
    beforeEnter: requireRef
  },
  {
    path: '/admin/login',
    name: 'Login',
    component: Login,
    beforeEnter: requireGuest
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireAuth
  },
  {
    path: '/admin/product',
    children: [
      {
        path: "",
        name: 'Product',
        component: Product,
        beforeEnter: requireAuth
      },
      {
        path: 'create',
        name: 'ProductCreate',
        component: ProductCreate,
        beforeEnter: requireAuth
      },
      {
        path: 'edit/:id',
        name: 'ProductEdit',
        component: ProductEdit,
        beforeEnter: requireAuth
      },
    ]
  },
  {
    path: '/admin/user-refferal',
    name: 'UserRefferal',
    component: UserRefferal,
    beforeEnter: requireAuth
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
        beforeEnter: requireRef
      },
      {
        path: "detail/:id",
        name: 'CatalogDetail',
        component: CatalogDetail,
        beforeEnter: requireRef
      },
    ],
  },
  {
    path: '/refferal/:id',
    name: 'Refferal',
    beforeEnter: async (to, from, next) => {
      const id = to.params.id;
      const { userRef, getRef } = useCheckRef();
      await getRef(id);
      if (id && userRef.value) {
        return next({ name: "Catalogs" });
      } else {
        next("/not-found");
      }
    }
  },
  {
    path: '/transaction/:id',
    name: 'UserTransaction',
    component: UserTransaction
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
