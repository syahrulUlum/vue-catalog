<template>
    <user-layout v-if="checkData">
        <h2 class="text-h4 text-medium-emphasis mt-4">Transaksi Berhasil</h2>
        <h4 class="text-h6 mt-4">Kode Transaksi: <b>{{ id }}</b></h4>
        <v-btn class="text-none font-weight-medium" color="orange-accent-4" variant="flat" text="Hubungi Admin"
            prepend-icon="mdi-whatsapp"
            :href="`https://wa.me/${contact}?text=Halo,%20saya%20telah%20membeli%20produk%20dengan%20kode%20transaksi%20${id},%20mohon%20segera%20diproses`" target="_blank"
            rel="noopener noreferrer">
        </v-btn>
    </user-layout>
    <v-empty-state v-else headline="Whoops, 404" title="Transaction not found"
        text="The Transaction you were looking for does not exist"></v-empty-state>
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

const checkData = ref(false)
const getData = async () => {
    const trxRef = collection(db, 'transactions');
    const q = query(trxRef, where('code', '==', id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        checkData.value = true
    } else {
        checkData.value = false
    }
};
onMounted(() => {
    getData();
})
</script>