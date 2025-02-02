import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/pages/admin/Dashboard.vue';
import Product from '@/pages/admin/product/Product.vue';
import ProductCreate from '@/pages/admin/product/ProductCreate.vue';
import ProductEdit from '@/pages/admin/product/ProductEdit.vue';
import Login from '@/pages/admin/Login.vue';
import Referral from '@/pages/admin/Referral.vue';
import Transaction from '@/pages/admin/Transaction.vue';
import NotFound from '@/NotFound.vue';
import Catalog from '@/pages/catalog/Catalog.vue';
import CatalogDetail from '@/pages/catalog/CatalogDetail.vue';
import UserTransaction from '@/pages/UserTransaction.vue';
import { requireAuth } from '@/middlewares/authMiddleware';
import { requireGuest } from '@/middlewares/guestMiddleware';
import { requireRef } from '@/middlewares/refMiddleware';
import useCheckRef from '@/composables/useCheckRef';
import Cart from '@/pages/Cart.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    beforeEnter: requireRef
  },
  {
    path: '/woYO31lEHOlBaCZcD/login',
    name: 'Login',
    component: Login,
    beforeEnter: requireGuest
  },
  {
    path: '/woYO31lEHOlBaCZcD/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireAuth
  },
  {
    path: '/woYO31lEHOlBaCZcD/products',
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
    path: '/woYO31lEHOlBaCZcD/referrals',
    name: 'Referral',
    component: Referral,
    beforeEnter: requireAuth
  },
  {
    path: '/woYO31lEHOlBaCZcD/transactions',
    name: 'Transaction',
    component: Transaction,
    beforeEnter: requireAuth
  },
  {
    path: '/woYO31lEHOlBaCZcD',
    redirect: '/woYO31lEHOlBaCZcD/login'
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
    path: '/u/:id',
    name: 'CheckReferral',
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
    path: '/cart',
    name: 'Cart',
    component: Cart,
    beforeEnter: requireRef
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
