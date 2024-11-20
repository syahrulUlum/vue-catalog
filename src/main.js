import { createApp } from 'vue';
import App from './App.vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import router from './router';
import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { createPinia } from 'pinia';

const vuetify = createVuetify({
  components,
  directives,
})

const pinia = createPinia()

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.use(Vue3Toastify, {
  autoClose: 1000,
})
app.use(pinia)
app.mount('#app');
