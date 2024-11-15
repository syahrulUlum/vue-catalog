<template>
  <v-navigation-drawer v-model="drawer" class="bg-indigo" theme="dark" permanent>
    <h2 class="text-center mt-3 mb-4">Katalog</h2>
    <v-divider></v-divider>
    <v-list density="compact" nav>
      <v-list-item :active="$route.name == 'Dashboard'" prepend-icon="mdi-view-dashboard" title="Dashboard"
        value="dashboard" :to="{ name: 'Dashboard' }"></v-list-item>
      <v-list-item :active="['Product', 'ProductCreate', 'ProductEdit'].includes($route.name)"
        prepend-icon="mdi-package-variant-closed" title="Produk" value="katalog" :to="{ name: 'Product' }"></v-list-item>
      <v-list-item :active="$route.name == 'UserReferral'" prepend-icon="mdi-account-multiple" title="User Referral"
        value="user-referral" :to="{ name: 'UserReferral' }"></v-list-item>
      <v-list-item :active="$route.name == 'Transaction'" prepend-icon="mdi-swap-horizontal-bold" title="Transaksi"
        value="transaction" :to="{ name: 'Transaction' }"></v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn @click="logoutModal = true" block>
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

  <!-- Start Modal Logout -->
  <v-dialog v-model="logoutModal" max-width="600" persistent>
    <v-card>
      <v-card-text>
        <div class="text-center pa-2">
          <v-icon color="warning" icon="mdi-alert-circle" size="60"></v-icon>
          <p class="mt-2">Apakah anda yakin ingin keluar ?</p>
        </div>
      </v-card-text>
      <v-card-actions class="pb-6 pr-6">
        <v-spacer></v-spacer>

        <v-btn text="cancel" variant="plain" @click="logoutModal = false" :disabled="loadLogout"></v-btn>

        <v-btn color="primary" :loading="loadLogout" text="Keluar" variant="flat" @click="handleLogout"
          :disabled="loadLogout"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- End Modal Logout -->
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import useAuth from '@/composables/useAuth';
import { toast } from 'vue3-toastify';

const drawer = ref(true);
const { width } = useDisplay();

onMounted(() => {
  if (width.value <= 768) {
    drawer.value = false;
  }
})

const logoutModal = ref(false)
const loadLogout = ref(false)
const router = useRouter()
const { logout } = useAuth()
const handleLogout = async () => {
  loadLogout.value = true
  try {
    await logout()
    router.push({ name: 'Login' })
  } catch (error) {
    toast.error("Terjadi kesalahan saat logout")
  } finally {
    loadLogout.value = false
  }
}
</script>