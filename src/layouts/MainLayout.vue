<template>
  <v-navigation-drawer v-model="drawer" class="bg-indigo" theme="dark" permanent>
    <h2 class="text-center mt-3 mb-4">Katalog</h2>
    <v-divider></v-divider>
    <v-list density="compact" nav>
      <v-list-item :active="$route.name == 'Dashboard'" prepend-icon="mdi-view-dashboard" title="Dashboard"
        value="dashboard" to="/admin/dashboard"></v-list-item>
      <v-list-item :active="$route.name == 'Catalog'" prepend-icon="mdi-forum" title="Katalog" value="katalog"
        to="/admin/catalog"></v-list-item>
      <v-list-item :active="$route.name == 'UserRefferal'" prepend-icon="mdi-account-multiple" title="User Refferal"
        value="user-refferal" to="/admin/user-refferal"></v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn block>
          Keluar
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <v-app-bar prominent>
    <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
  </v-app-bar>

  <v-main class="h-auto">
    <div class="pa-6 h-auto">
      <slot />
    </div>
  </v-main>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useDisplay } from 'vuetify';

const drawer = ref(true);
const { width } = useDisplay();

onMounted(() => {
  if (width.value <= 768) {
    drawer.value = false;
  }
})
</script>