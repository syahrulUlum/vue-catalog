<template>
  <main-layout>
    <div class="d-flex align-center text-subtitle-1 text-medium-emphasis">
      <span>Produk</span>
      <v-icon icon="mdi-chevron-right"></v-icon>
      <span>List</span>
    </div>
      <h4 class="text-h4 font-weight-bold">Produk</h4>

    <v-row class="pe-2 mt-5 mb-2 justify-space-between ga-1" no-gutters>
            <v-col cols="12" sm="4">
                <v-sheet>
                    <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
                        variant="outlined" flat hide-details single-line></v-text-field>
                </v-sheet>
            </v-col>
            <v-col cols="12" sm="2">
                <v-sheet class="text-end bg-transparent">
                  <v-btn class="text-none font-weight-medium" color="orange-accent-4" variant="flat"
                  :to="{ name: 'ProductCreate' }" style="height: 2.8em;" block>Tambah Produk</v-btn>
                </v-sheet>
            </v-col>
        </v-row>

    <v-data-table :loading="loading" :headers="headerTable" v-model:search="search"
      :filter-keys="['product_code', 'name']" :items="items" class="border rounded-lg overflow-hidden">
      <template v-slot:loading>
        <v-skeleton-loader v-for="j in 5" :key="j" type="text"></v-skeleton-loader>
      </template>

      <template v-slot:item.no="{ item }">
        {{ items.indexOf(item) + 1 }}
      </template>

      <template v-slot:item.price="{ item }">
        {{ formatRupiah(item.price) }}
      </template>

      <template v-slot:item.action="{ item }">
        <div class="d-inline">
          <router-link class="ma-1 text-decoration-none" :to="{ name: 'ProductEdit', params: { id: item.id } }">
            <span class="text-orange-darken-3">
              <v-icon icon="mdi-square-edit-outline"></v-icon>
            </span>
          </router-link>
          |
          <button class="ma-1" @click="openDeleteModal(item.id, item.name)">
            <span class="text-red-darken-3">
              <v-icon icon="mdi-delete"></v-icon>
            </span>
          </button>
        </div>
      </template>
    </v-data-table>

    <!-- Start Modal Delete -->
    <v-dialog v-model="deleteModal" max-width="600" persistent>
      <v-card>
        <v-card-text>
          <div class="text-center pa-2">
            <v-icon color="warning" icon="mdi-alert-circle" size="60"></v-icon>
            <p class="mt-2">Apakah anda yakin ingin menghapus Produk <strong>{{ nameDel
                }}</strong> ?</p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-btn text="tidak" variant="plain" @click="closeDeleteModal" :disabled="loadDelete"></v-btn>

          <v-btn color="deep-orange-accent-4" :loading="loadDelete" text="ya" variant="flat" @click="deleteProduct"
            :disabled="loadDelete"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- End Modal Delete -->
  </main-layout>
</template>
<script setup>
import MainLayout from '@/layouts/MainLayout.vue';
import { onMounted, ref } from 'vue';
import { toast } from 'vue3-toastify';
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { deleteObject, ref as storageRef } from 'firebase/storage';
import { db, storage } from "@/firebaseConfig";
import useAuth from '@/composables/useAuth';
import { useRouter } from 'vue-router';

const search = ref("");
const loading = ref(false);
const headerTable = ref([
  { key: 'no', sortable: false, title: 'No' },
  { key: 'product_code', title: 'Kode Produk' },
  { key: 'name', title: 'Nama' },
  { key: 'price', title: 'Harga' },
  { key: 'action', title: 'Aksi', sortable: false, align: 'end' },

])

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};


const items = ref([]);
const fetchProduk = async () => {
  loading.value = true;
  try {
    const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);

    items.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loading.value = false;
  } catch (error) {
    toast.error('Gagal mengambil data Produk: ' + error);
    loading.value = false;
  }
};
onMounted(() => {
  fetchProduk();
})

const nameDel = ref("");
const idDel = ref(null)
const deleteModal = ref(false)
const openDeleteModal = (id, name) => {
  nameDel.value = name;
  idDel.value = id;
  deleteModal.value = true
}

const closeDeleteModal = () => {
  nameDel.value = "";
  idDel.value = null
  deleteModal.value = false
}

const loadDelete = ref(false);
const router = useRouter()
const deleteProduct = async () => {
  if (idDel.value) {
    loadDelete.value = true;
    const { user, checkSessionExpiration, checkAuthStatus } = useAuth();
    await checkSessionExpiration();
    await checkAuthStatus();


    if (!user.value) {
      router.push({ name: 'Login' });
    }

    const dataItem = getItemById(idDel.value)

    try {
      if (dataItem.images && dataItem.images.length > 0) {
        for (const image of dataItem.images) {
          const imageRef = storageRef(storage, image);
          await deleteObject(imageRef);
        }
      }
      await deleteDoc(doc(db, 'products', idDel.value));
      toast.success('Produk berhasil dihapus');
      fetchProduk();
      deleteModal.value = false
    } catch (error) {
      toast.error('Gagal menghapus Produk: ' + error);
    } finally {
      loadDelete.value = false;
    }
  } else {
    toast.error('Produk tidak ditemukan');
    loadDelete.value = false;
    deleteModal.value = false
  }
}

const getItemById = (id) => {
  return items.value.find(item => item.id === id);
};
</script>