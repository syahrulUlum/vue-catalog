<template>
  <main-layout>
    <h2>Produk</h2>
    <v-card class="mx-auto mt-2 pa-3 overflow-x-auto" elevation="6">
      <v-btn class="text-none font-weight-regular" color="blue-darken-3" prepend-icon="mdi-plus" variant="flat"
        :to="{ name: 'ProductCreate' }">Tambah Produk</v-btn>

      <v-card-title class="d-flex align-center pe-2">
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
          variant="solo-filled" flat hide-details single-line></v-text-field>
      </v-card-title>

      <v-data-table :loading="loading" v-model:search="search" :headers="headerTable" :filter-keys="['name', 'price']"
        :items="items">
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
          <div class="d-flex justify-center">
            <v-btn class="ma-1" color="primary" :to="{ name: 'ProductEdit', params: { id: item.id } }">Edit</v-btn>
            <v-btn class="ma-1" color="error" @click="openDeleteModal(item.id, item.name)">Hapus</v-btn>
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
            <v-btn text="cancel" variant="plain" @click="closeDeleteModal" :disabled="loadDelete"></v-btn>

            <v-btn color="primary" :loading="loadDelete" text="Hapus" variant="flat" @click="deleteProduct"
              :disabled="loadDelete"></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- End Modal Delete -->
    </v-card>
  </main-layout>
</template>
<script setup>
import MainLayout from '@/layouts/MainLayout.vue';
import { onMounted, ref } from 'vue';
import { toast } from 'vue3-toastify';
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { deleteObject, ref as storageRef } from 'firebase/storage';
import { db, storage } from "@/firebaseConfig";

const search = ref("");
const loading = ref(false);
const headerTable = ref([
  { key: 'no', sortable: false, title: 'No' },
  { key: 'name', title: 'Nama' },
  { key: 'price', title: 'Harga' },
  { key: 'action', title: 'Aksi', sortable: false, align: 'center' },

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
const deleteProduct = async () => {
  if (idDel.value) {
    loadDelete.value = true;
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