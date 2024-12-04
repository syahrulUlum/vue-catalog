<template>
    <user-layout>
        <div class="pa-6">
            <div class="loader-custom mx-auto" v-if="loading"></div>

            <v-row no-gutters v-if="!loading && checkData">
                <v-col cols="12" sm="12" md="5" lg="4">
                    <v-sheet class="ma-2 pa-3 bg-transparent">
                        <div class="mx-auto">
                            <CarouselThumb :img="data.images" />
                        </div>
                    </v-sheet>
                </v-col>
                <v-col cols="12" sm="12" md="6">
                    <v-sheet class="mt-6 ml-4 bg-transparent">
                        <h1>{{ data.name }}</h1>
                        <h2>{{ formatRupiah(data.price) }}</h2>

                        <p class="text-h6 mt-4">Deskripsi</p>
                        <p v-html="data.description"></p>

                        <div class="product-qty my-4">
                            <button class="mr-2" @click="changeQty('min')">
                                <v-icon icon="mdi-minus"></v-icon>
                            </button>
                            <input type="number" min="0" v-model="data.qty">
                            <button class="ml-2" @click="changeQty('plus')">
                                <v-icon icon="mdi-plus"></v-icon>
                            </button>
                        </div>

                        <v-btn @click="orderToCart" class="mt-4 mr-2" color="orange-accent-4"
                            variant="flat">Beli</v-btn>
                        <v-btn @click="addToCart" class="mt-4" color="indigo" variant="flat">Tambah Ke Keranjang</v-btn>
                    </v-sheet>
                </v-col>
            </v-row>

            <div class="text-center" v-if="!loading && !checkData">
                <h4 class="text-h4">Whoops, 404</h4>
                <h5 class="text-h5">Product not found</h5>
                <p class="text-subtitle-1">The product you were looking for does not exist</p>
            </div>
        </div>
    </user-layout>
</template>
<script setup>
import UserLayout from '@/layouts/UserLayout.vue';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDoc, doc } from 'firebase/firestore';
import { db } from "@/firebaseConfig";
import { useDisplay } from 'vuetify';
import { toast } from 'vue3-toastify';
import { useCartStore } from '@/stores/cart';
import CarouselThumb from '@/components/CarouselThumb.vue';

const data = reactive({
    id: null,
    name: "",
    price: null,
    description: "",
    images: null,
    qty: 1
});
const refId = ref(null);

const route = useRoute()
const router = useRouter()
const checkData = ref(true)
const loading = ref(true)
const getData = async () => {
    loading.value = true
    const id = route.params.id;
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        data.id = id
        data.name = docSnap.data().name;
        data.price = docSnap.data().price;
        data.description = docSnap.data().description;
        data.images = docSnap.data().images || null;
        checkData.value = true
        loading.value = false
    } else {
        loading.value = false
        checkData.value = false
    }
};

onMounted(async () => {
    const getRefId = localStorage.getItem('ref_id');
    refId.value = getRefId
    if (!refId.value) {
        router.push('/not-found')
    }
    await getData();
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

const changeQty = (type) => {
    if (type === 'min') {
        if (data.qty < 1) return

        data.qty -= 1
    }
    if (type === 'plus') {
        data.qty += 1
    }
}

const addToCart = () => {
    if (data.qty < 1) {
        toast.error('Jumlah produk tidak boleh kurang dari 1');
        return
    }

    const cartStore = useCartStore();
    cartStore.addToCart({ id: data.id, qty: data.qty });

    toast.success('Produk berhasil ditambahkan ke keranjang');
}

const orderToCart = () => {
    if (data.qty < 1) {
        toast.error('Jumlah produk tidak boleh kurang dari 1');
        return
    }

    const cartStore = useCartStore();
    cartStore.addToCart({ id: data.id, qty: data.qty });

    localStorage.setItem('buyItem', data.id);
    router.push({ name: 'Cart' });
}

</script>
<style scoped>
.product-qty input::-webkit-outer-spin-button,
.product-qty input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

.product-qty input {
    -moz-appearance: textfield;
    appearance: textfield;
    width: 60px;
    text-align: center;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>