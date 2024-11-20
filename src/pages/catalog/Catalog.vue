<template>
    <user-layout>
        <v-row align="start" justify="start">
            <v-col v-for="item in items" :key="item" cols="12" lg="2" md="3" sm="4">
                <v-sheet class="bg-transparent">
                    <v-card class="mx-auto cursor-pointer bg-grey-lighten-3" :loading="loading" width="225" :to="{ name: 'CatalogDetail', params: { id: item.id } }" variant="text">
                        <template v-slot:loader="{ isActive }">
                            <v-skeleton-loader v-if="isActive" type="image"></v-skeleton-loader>
                            <v-skeleton-loader v-if="isActive" height="80" type="image"></v-skeleton-loader>
                            <v-skeleton-loader v-if="isActive" type="heading"></v-skeleton-loader>
                            <v-skeleton-loader v-if="isActive" style="margin-top: -13px;"
                                type="text"></v-skeleton-loader>
                            <v-skeleton-loader v-if="isActive" style="margin-top: -13px;"
                                type="heading"></v-skeleton-loader>
                        </template>

                        <v-img height="200" :src="item.images[0]" cover></v-img>

                        <v-card-item>
                            <v-card-title>{{ item.name }}</v-card-title>
                            <div class="text-subtitle-1">
                                {{ formatRupiah(item.price) }}
                            </div>
                        </v-card-item>
                    </v-card>
                </v-sheet>
            </v-col>
        </v-row>
        <v-empty-state v-if="items.length <= 0 && !loading" title="Produk kosong"
            text="Saat ini produk tidak tersedia"></v-empty-state>

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