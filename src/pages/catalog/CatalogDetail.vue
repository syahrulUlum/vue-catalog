<template>
    <user-layout>
        <v-btn class="text-none font-weight-regular" color="blue-darken-3" prepend-icon="mdi-arrow-left" variant="flat"
            :to="{ name: 'Catalogs' }">Kembali</v-btn>

        <v-row no-gutters>
            <v-col cols="12" sm="12" md="6">
                <v-sheet class="ma-2 pa-3">
                    <v-carousel class="mt-4" width="50%" interval="3000" :height="heightCarousel" cycle
                        hide-delimiter-background>
                        <v-carousel-item v-for="image in data.images" :key="image" :src="image" cover></v-carousel-item>
                    </v-carousel>
                </v-sheet>
            </v-col>
            <v-col cols="12" sm="12" md="6">
                <v-sheet class="mt-6 ml-4">
                    <h1>{{ data.nama }}</h1>
                    <h2>{{ formatRupiah(data.harga) }}</h2>
                    <p class="text-h6 mt-4">Deskripsi</p>
                    <p>{{ data.description }}</p>
                    <v-btn class="mt-4" color="blue-darken-3" prepend-icon="mdi-cart" variant="flat">Beli</v-btn>
                </v-sheet>
            </v-col>
        </v-row>
    </user-layout>
</template>
<script setup>
import UserLayout from '@/layouts/UserLayout.vue';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDoc, doc } from 'firebase/firestore';
import { db } from "@/firebaseConfig";
import { useDisplay } from 'vuetify';

const data = reactive({
    nama: "",
    harga: null,
    description: "",
    images: null,
});

const route = useRoute()
const router = useRouter()
const getData = async () => {
    const id = route.params.id;
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        data.nama = docSnap.data().nama;
        data.harga = docSnap.data().harga;
        data.description = docSnap.data().description;
        data.images = docSnap.data().images || null;

    } else {
        // redirect 404
        router.push({ name: 'NotFound' })
    }
};
onMounted(() => {
    getData();
})

const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const { width } = useDisplay();
const heightCarousel = ref(500);
onMounted(() => {
    if (width.value <= 425) {
        heightCarousel.value = 300;
    }
})
</script>