<template>
    <user-layout>
        <div class="pa-6">
            <div class="loader-custom mx-auto" v-if="loading"></div>
            <v-row v-if="items.length >= 0 && !loading" align="start" justify="start">
                <v-col v-for="item in items" :key="item" cols="6" sm="4" md="3" lg="2" xl="1">
                    <v-sheet class="bg-transparent">
                        <v-card class="mx-auto cursor-pointer bg-grey-lighten-3 card-product"
                            :to="{ name: 'CatalogDetail', params: { id: item.id } }" variant="text">
                            <v-img class="image-product" :src="item.images[0]" cover></v-img>

                            <v-card-item>
                                <p class="text-h6 text-sm-h5">{{ item.name }}</p>
                                <div class="text-subtitle-2 text-sm-h6">
                                    {{ formatRupiah(item.price) }}
                                </div>
                            </v-card-item>
                        </v-card>
                    </v-sheet>
                </v-col>
            </v-row>
            <div class="text-center" v-if="items.length <= 0 && !loading">
                <h5 class="text-h5">Produk kosong</h5>
                <p class="text-subtitle-1">Saat ini produk tidak tersedia</p>
            </div>
        </div>
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
<style scoped>
.image-product {
    aspect-ratio: 1 / 1;
}
</style>