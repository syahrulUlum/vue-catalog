<template>
    <user-layout>
        <div class="pa-6">
            <v-row class="justify-end">
                <v-col cols="12" md="3">
                    <v-text-field v-model="searchQuery" @input="performSearch" label="Search" variant="outlined"
                        prepend-inner-icon="mdi-magnify" clearable density="compact"></v-text-field>
                </v-col>
            </v-row>

            <div class="loader-custom mx-auto" v-if="loading"></div>

            <v-row v-if="displayedItems.length >= 0 && !loading" align="start" justify="start">
                <v-col v-for="item in displayedItems" :key="item.id" cols="6" sm="4" md="3" lg="2" xl="1">
                    <v-sheet class="bg-transparent">
                        <v-card class="mx-auto cursor-pointer bg-white card-product"
                            :to="{ name: 'CatalogDetail', params: { id: item.id } }" variant="text">
                            <v-img class="image-product" :src="item.images[0]" cover></v-img>

                            <v-card-item>
                                <p class="text-h6 text-sm-h5 text-product">{{ item.name }}</p>
                                <div class="text-subtitle-2 text-sm-h6">
                                    {{ formatRupiah(item.price) }}
                                </div>
                            </v-card-item>
                        </v-card>
                    </v-sheet>
                </v-col>
            </v-row>

            <!-- Pagination -->
            <div class="text-center mt-4" v-if="totalPages > 1">
                <v-pagination v-model="currentPage" :length="totalPages" @update:model-value="changePage"
                    total-visible="7"></v-pagination>
            </div>

            <div class="text-center" v-if="displayedItems.length <= 0 && !loading">
                <h5 class="text-h5">{{ searchQuery ? 'Produk tidak ditemukan' : 'Produk kosong' }}</h5>
                <p class="text-subtitle-1">{{ searchQuery ? 'Produk yang anda cari tidak ditemukan' : 'Saat ini produk tidak tersedia' }}</p>
            </div>

        </div>
    </user-layout>
</template>

<script setup>
import UserLayout from '@/layouts/UserLayout.vue';
import { onMounted, ref, computed } from 'vue';
import { toast } from 'vue3-toastify';
import {
    collection,
    getDocs,
    orderBy,
    query,
    where
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

const ITEMS_PER_PAGE = 12

const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const allItems = ref([]);
const items = ref([]);

const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const fetchProduk = async (searchText = '') => {
    loading.value = true;
    try {
        let q;
        q = query(
            collection(db, 'products'),
            orderBy('created_at', 'desc')
        );

        const querySnapshot = await getDocs(q);

        allItems.value = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                lowercaseName: doc.data().name.toLowerCase()
            }))
            .filter(item =>
                searchText === '' ||
                item.lowercaseName.includes(searchText.toLowerCase())
            );

        currentPage.value = 1;
        loading.value = false;
    } catch (error) {
        toast.error('Gagal mengambil data Produk: ' + error);
        loading.value = false;
    }
};

const performSearch = () => {
    fetchProduk(searchQuery.value);
};

const totalPages = computed(() => {
    return Math.ceil(allItems.value.length / ITEMS_PER_PAGE);
});

const displayedItems = computed(() => {
    const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return allItems.value.slice(start, end);
});

const changePage = (page) => {
    currentPage.value = page;
};

onMounted(() => {
    fetchProduk();
});
</script>

<style scoped>
.image-product {
    aspect-ratio: 1 / 1;
}

.text-product {
    height: 2.4em;
    line-height: 1.2em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}
</style>