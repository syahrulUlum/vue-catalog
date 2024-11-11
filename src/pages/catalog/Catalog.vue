<template>
    <user-layout>
        <v-sheet class="d-flex flex-wrap" style="gap: 18px">
            <v-sheet v-for="item in items" :key="item">
                <v-card elevation="6" :loading="loading" class="mx-auto" width="275">
                    <template v-slot:loader="{ isActive }">
                        <v-skeleton-loader v-if="isActive" type="image"></v-skeleton-loader>
                        <v-skeleton-loader v-if="isActive" height="80" type="image"></v-skeleton-loader>
                        <v-skeleton-loader v-if="isActive" type="heading"></v-skeleton-loader>
                        <v-skeleton-loader v-if="isActive" style="margin-top: -13px;" type="text"></v-skeleton-loader>
                        <v-skeleton-loader v-if="isActive" style="margin-top: -13px;"
                            type="heading"></v-skeleton-loader>
                    </template>

                    <v-img height="230" :src="item.images[0]" cover></v-img>

                    <v-card-item>
                        <v-card-title>{{ item.nama }}</v-card-title>
                        <div class="text-subtitle-1">
                            {{ formatRupiah(item.harga) }}
                        </div>
                    </v-card-item>

                    <v-card-actions>
                        <v-btn color="light-blue-darken-4 font-weight-bold"
                            :to="{ name: 'CatalogDetail', params: { id: item.id } }" text="Detail" block
                            variant="flat"></v-btn>
                    </v-card-actions>
                </v-card>
            </v-sheet>
        </v-sheet>
    </user-layout>
</template>
<script setup>
import UserLayout from '@/layouts/UserLayout.vue';

import { onMounted, ref } from 'vue';
import { toast } from 'vue3-toastify';
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebaseConfig";



const loading = ref(false);
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
</script>