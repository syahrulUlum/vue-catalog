<template>
  <v-app-bar :elevation="2" prominent>
    <template v-slot:prepend>
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" v-if="width <= 768"></v-app-bar-nav-icon>
    </template>
    <v-app-bar-title class="font-weight-bold">Katalog</v-app-bar-title>
    <template v-slot:append>
      <button class="mr-5">
        <v-avatar image="/avatar.jpg"></v-avatar>

        <v-menu activator="parent">
        <v-list>
          <v-list-item>
            <v-btn @click="logoutModal = true" block class="text-subtitle-1">Logout</v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
      </button>
    </template>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" class="bg-transparent border-0 mt-5" permanent>
    <v-list density="compact" nav>
      <v-list-item :active="$route.name == 'Dashboard'" class="text-grey-darken-2" value="dashboard"
        :to="{ name: 'Dashboard' }">
        <div :class="$route.name == 'Dashboard' ? 'text-orange' : ''">
          <v-icon class="mr-3" icon="mdi-view-dashboard"></v-icon>
          <span class="text-subtitle-2">Dashboard</span>
        </div>
      </v-list-item>
      <v-list-item :active="['Product', 'ProductCreate', 'ProductEdit'].includes($route.name)"
        class="text-grey-darken-2" value="product" :to="{ name: 'Product' }">
        <div :class="['Product', 'ProductCreate', 'ProductEdit'].includes($route.name) ? 'text-orange' : ''">
          <v-icon class="mr-3" icon="mdi-package-variant-closed"></v-icon>
          <span class="text-subtitle-2">Produk</span>
        </div>
      </v-list-item>
      <v-list-item :active="$route.name == 'UserReferral'" class="text-grey-darken-2" value="user-referral"
        :to="{ name: 'UserReferral' }">
        <div :class="$route.name == 'UserReferral' ? 'text-orange' : ''">
          <v-icon class="mr-3" icon="mdi-account-multiple"></v-icon>
          <span class="text-subtitle-2">User Referral</span>
        </div>
      </v-list-item>
      <v-list-item :active="$route.name == 'Transaction'" class="text-grey-darken-2" value="transaction"
        :to="{ name: 'Transaction' }">
        <div :class="$route.name == 'Transaction' ? 'text-orange' : ''">
          <v-icon class="mr-3" icon="mdi-swap-horizontal-bold"></v-icon>
          <span class="text-subtitle-2">Transaksi</span>
        </div>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

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
  }else{
    drawer.value = true;
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