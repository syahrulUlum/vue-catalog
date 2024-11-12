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
                    <h1>{{ data.name }}</h1>
                    <h2>{{ formatRupiah(data.price) }}</h2>
                    <p class="text-h6 mt-4">Deskripsi</p>
                    <p>{{ data.description }}</p>
                    <v-btn @click="openOrderModal" class="mt-4" color="blue-darken-3" prepend-icon="mdi-cart"
                        variant="flat">Beli</v-btn>
                </v-sheet>
            </v-col>
        </v-row>

        <!-- Start Modal -->
        <v-dialog v-model="orderModal" max-width="600" persistent>
            <v-card :title="`Order ${data.name}`">
                <v-card-text>
                    <v-alert class="mb-3" text="Isi data berikut untuk membeli produk" type="warning"></v-alert>
                    <v-text-field v-model="orderData.name" :error-messages="v$.name.$errors.map((e) => e.$message)"
                        label="Nama" required @blur="v$.name.$touch" @input="v$.name.$touch"></v-text-field>

                    <v-text-field v-model="orderData.email" :error-messages="v$.email.$errors.map((e) => e.$message)"
                        label="Email" required @blur="v$.email.$touch" @input="v$.email.$touch"></v-text-field>

                    <v-text-field v-model="orderData.telp" :error-messages="v$.telp.$errors.map((e) => e.$message)"
                        label="No Hp" required @blur="v$.telp.$touch" @input="v$.telp.$touch"></v-text-field>

                    <v-textarea v-model="orderData.address" :error-messages="v$.address.$errors.map((e) => e.$message)"
                        label="Alamat" required @blur="v$.address.$touch" @input="v$.address.$touch"></v-textarea>

                    <!-- disable jika edit -->
                    <v-text-field label="Kode Referral" v-model="refId" readonly></v-text-field>
                </v-card-text>
                <v-card-actions class="pa-6">
                    <v-spacer></v-spacer>

                    <v-btn text="Tutup" variant="plain" @click="closeOrderModal" :disabled="loadOrder"></v-btn>

                    <v-btn color="primary" :loading="loadOrder" text="Beli" variant="flat" @click="orderProduct"
                        :disabled="loadOrder"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- End Modal -->
    </user-layout>
</template>
<script setup>
import UserLayout from '@/layouts/UserLayout.vue';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDoc, doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from "@/firebaseConfig";
import { useDisplay } from 'vuetify';
import { useVuelidate } from "@vuelidate/core";
import { email, required, numeric } from "@vuelidate/validators";
import { toast } from 'vue3-toastify';

const data = reactive({
    name: "",
    price: null,
    description: "",
    images: null,
});
const refId = ref(null);

const route = useRoute()
const router = useRouter()
const getData = async () => {
    const id = route.params.id;
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        data.name = docSnap.data().name;
        data.price = docSnap.data().price;
        data.description = docSnap.data().description;
        data.images = docSnap.data().images || null;

    } else {
        // redirect 404
        router.push('/not-found')
    }
};
onMounted(() => {
    const getRefId = localStorage.getItem('ref_id');
    refId.value = getRefId
    if (!refId.value) {
        router.push('/not-found')
    }
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

// Create Order
const orderData = reactive({
    name: "",
    email: "",
    telp: "",
    address: ""
});

const rules = reactive({
    name: { required },
    email: { required, email },
    telp: { required, numeric },
    address: { required }
});

const v$ = useVuelidate(rules, orderData);

const orderModal = ref(false);

const openOrderModal = () => {
    orderModal.value = true;
    orderData.name = "";
    orderData.email = "";
    orderData.telp = "";
    orderData.address = "";
    v$.value.$reset();

    if (!refId.value) {
        router.push('/not-found')
    }
}
const closeOrderModal = () => {
    orderModal.value = false;
    orderData.name = "";
    orderData.email = "";
    orderData.telp = "";
    orderData.address = "";
}

const loadOrder = ref(false);
const orderProduct = async () => {
    const isValid = await v$.value.$validate();
    if (!isValid) return


    loadOrder.value = true;
    try {
        await addDoc(collection(db, 'transactions'), {
            name: orderData.name,
            email: orderData.email,
            telp: orderData.telp,
            address: orderData.address,
            ref_id: refId.value,
            product: data,
            status: 0,
            created_at: serverTimestamp(),
        });
        toast.success('Anda berhasil membeli produk ini');
        closeOrderModal();
    } catch (error) {
        toast.error('Gagal membeli produk ini: ');
    } finally {
        loadOrder.value = false;
    }
}
</script>