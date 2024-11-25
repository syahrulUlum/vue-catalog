<template>
    <user-layout>
        <div class="position-absolute top-0 w-100 h-screen justify-center align-center d-flex flex-column">
            <div class="loader-custom mx-auto" v-if="loading"></div>

            <div class="text-center" v-if="!loading && checkData">
                <h2 class="text-h4 text-medium-emphasis mt-4">Transaksi Berhasil</h2>
                <h4 class="text-h6 mt-4">Kode Transaksi: <b>{{ id }}</b></h4>
                <p>Silahkan hubungi admin agar transaksi anda mendapatkan prioritas utama pelayanan kami</p>
                <v-btn class="text-none font-weight-medium" color="orange-accent-4" variant="flat" text="Hubungi Admin"
                    prepend-icon="mdi-whatsapp"
                    :href="`https://wa.me/${contact}?text=Halo,%20saya%20telah%20membeli%20produk%20dengan%20kode%20transaksi%20${id},%20mohon%20segera%20diproses`"
                    target="_blank" rel="noopener noreferrer">
                </v-btn>
            </div>

            <div class="text-center" v-if="!loading && !checkData">
                <h4 class="text-h4">Whoops, 404</h4>
                <h5 class="text-h5">Transaction not found</h5>
                <p class="text-subtitle-1">The Transaction you were looking for does not exist</p>
            </div>
        </div>
    </user-layout>
</template>
<script setup>
import UserLayout from '@/layouts/UserLayout.vue';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "@/firebaseConfig";

const route = useRoute()
const id = route.params.id;
const contact = import.meta.env.VITE_NO_WA;

const checkData = ref(true)
const loading = ref(true)
const getData = async () => {
    loading.value = true
    const trxRef = collection(db, 'transactions');
    const q = query(trxRef, where('code', '==', id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        checkData.value = true
        loading.value = false
    } else {
        checkData.value = false
        loading.value = false
    }
};
onMounted(() => {
    getData();
})
</script>