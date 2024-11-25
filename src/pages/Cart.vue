<template>
    <user-layout>
        <div class="pa-6">
            <h1 class="text-h4">Keranjang Anda</h1>
            <div class="loader-custom mx-auto" v-if="loading"></div>

            <div class="mt-4" style="margin-left: -15px; margin-right: -15px;" v-if="data.length > 0 && !loading">
                <div class="d-flex mt-6" style="height: 90px;" v-for="(item, index) in data" :key="item.id">
                    <div class="h-100 d-flex" style="width: 150px;">
                        <v-checkbox @change="changeSelectedItem(item)" class="d-flex" v-model="selectedValue"
                            :value="item.id"></v-checkbox>
                        <div class="image-container">
                            <img :src="item.images[0]" alt="image" />
                        </div>
                    </div>
                    <div class="h-100 w-100 ml-2 d-sm-flex border-b">
                        <div class="h-xs-50 h-sm-100 w-100 w-sm-50 overflow-hidden">
                            <p class="text-sm-h6">
                                <b>{{ item.name }}</b>
                            </p>
                            <p class="text-sm-h6">{{ formatRupiah(item.price) }}</p>
                        </div>
                        <div class="h-xs-50 h-sm-100 d-flex align-center justify-space-between pa-1 pa-sm-3 w-100">
                            <div class="product-qty">
                                <button class="mr-2" @click="changeQty('min', index)">
                                    <v-icon icon="mdi-minus"></v-icon>
                                </button>
                                <input type="number" min="0" :value="item.qty" readonly>
                                <button class="ml-2" @click="changeQty('plus', index)">
                                    <v-icon icon="mdi-plus"></v-icon>
                                </button>
                            </div>
                            <p class="d-none d-sm-inline">
                                {{ formatRupiah(item.price * item.qty) }}
                            </p>
                            <button @click="deleteCart(item.id)">
                                <span class="text-red-darken-3">
                                    <v-icon icon="mdi-delete"></v-icon>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="d-flex text-h6 font-weight-bold justify-space-between pa-3">
                    <p>Total Harga</p>
                    <p>{{ formatRupiah(totalPrice()) }}</p>
                </div>
                <div class="text-right">
                    <v-btn class="mt-4" color="orange-accent-4" @click="openOrderModal" variant="flat">Checkout</v-btn>
                </div>
            </div>

            <h4 v-if="data.length < 1 && !loading" class="mt-4 text-h6">Keranjang Anda Kosong</h4>
        </div>
    </user-layout>

    <!-- Start Modal -->
    <v-dialog v-model="orderModal" max-width="600" persistent>
        <v-card title="Tinjauan Pembelian">
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
            </v-card-text>
            <v-card-actions class="pa-6">
                <v-spacer></v-spacer>

                <v-btn text="Tutup" variant="plain" @click="closeOrderModal" :disabled="loadOrder"></v-btn>

                <v-btn color="orange-accent-4" :loading="loadOrder" text="Lanjut" variant="flat" @click="orderProduct"
                    :disabled="loadOrder"></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <!-- End Modal -->
</template>
<script setup>
import UserLayout from '@/layouts/UserLayout.vue';
import { onMounted, reactive, ref } from 'vue';
import { getDoc, doc, addDoc, collection, serverTimestamp, limit, where, query, getDocs } from 'firebase/firestore';
import { db } from "@/firebaseConfig";
import { useCartStore } from '@/stores/cart';
import { useVuelidate } from "@vuelidate/core";
import { email, required, numeric } from "@vuelidate/validators";
import { toast } from 'vue3-toastify';
import useCheckRef from '@/composables/useCheckRef';
import { useRouter } from 'vue-router';

const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const data = ref([])
const refId = ref(null);

const cartStore = useCartStore();
const loading = ref(true)
const getData = async () => {
    loading.value = true
    const getCart = JSON.parse(localStorage.getItem('cart')) || []
    if (getCart.length > 0) {
        for (let cartItem of getCart) {
            const docRef = doc(db, "products", cartItem.id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                data.value.push({ id: cartItem.id, ...docSnap.data(), qty: cartItem.qty })
            } else {
                cartStore.removeFromCart(cartItem.id)
            }
        }
    }
    loading.value = false
}

const changeQty = (type, index) => {
    if (type === 'min') {
        if (data.value[index].qty <= 1) return

        data.value[index].qty -= 1
    }
    if (type === 'plus') {
        data.value[index].qty += 1
    }
    cartStore.updateQuantity(data.value[index].id, data.value[index].qty)
}

const selectedValue = ref([]);
const selectedItems = ref([]);
const changeSelectedItem = (item) => {
    const exists = selectedItems.value.some((i) => i.id === item.id);

    if (exists) {
        selectedItems.value = selectedItems.value.filter((i) => i.id !== item.id);
    } else {
        selectedItems.value.push(item);
    }

}


onMounted(async () => {
    const getRefId = localStorage.getItem('ref_id');
    refId.value = getRefId
    if (!refId.value) {
        router.push('/not-found')
    }
    await getData()

    const getBuyItem = localStorage.getItem('buyItem');
    if (getBuyItem) {
        const selectedData = data.value.filter(item => item.id == getBuyItem);
        selectedItems.value = selectedData;
        selectedValue.value.push(getBuyItem);

        localStorage.removeItem('buyItem');
    }
})

const deleteCart = (id) => {
    data.value = data.value.filter(item => item.id !== id)
    selectedItems.value = selectedItems.value.filter(item => item.id !== id)
    selectedValue.value = selectedValue.value.filter(item => item !== id)
    cartStore.removeFromCart(id)
}

const totalPrice = () => {
    return selectedItems.value.reduce((total, item) => total + item.price * item.qty, 0)
}

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
const router = useRouter();
const openOrderModal = () => {
    if (selectedItems.value.length < 1) {
        toast.error('Anda belum memilih produk untuk dibeli');
        return
    }

    const nullQty = selectedItems.value.some((i) => i.qty < 1);
    if (nullQty) {
        toast.error('Ada produk dengan qty kosong');
        return
    }

    orderModal.value = true;
    v$.value.$reset();

    if (!refId.value) {
        router.push('/not-found')
    }
}

const closeOrderModal = () => {
    orderModal.value = false;
}

const loadOrder = ref(false);
const orderProduct = async () => {
    const isValid = await v$.value.$validate();
    if (!isValid) return

    if (selectedItems.value.length < 1) {
        toast.error('Anda belum memilih produk untuk dibeli');
        return
    }

    const nullQty = selectedItems.value.some((i) => i.qty < 1);
    if (nullQty) {
        toast.error('Ada produk dengan qty kosong');
        return
    }

    loadOrder.value = true;
    try {
        const { userRef, getRef } = useCheckRef();
        await getRef(refId.value);
        if (!userRef.value) {
            toast.error("Link referral tidak valid");
            return
        }

        const getCode = generateCode()

        await addDoc(collection(db, 'transactions'), {
            code: getCode,
            ...orderData,
            ref_id: refId.value,
            product: selectedItems.value,
            status: 0,
            created_at: serverTimestamp(),
        });

        for (let item of selectedItems.value) {
            deleteCart(item.id)
        }

        router.push('/transaction/' + getCode);
        closeOrderModal();
    } catch (error) {
        toast.error('Gagal membeli produk ini: ');
    } finally {
        loadOrder.value = false;
    }
}

const generateCode = () => {
    const randomNumber = Math.floor(10000 + Math.random() * 90000);

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}${month}${day}`;

    return `CS${formattedDate}${randomNumber}`;
}
</script>
<style scoped>
.product-qty input::-webkit-outer-spin-button,
.product-qty input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

.product-qty {
    transform: scale(0.8);
    position: relative;
    left: -10px
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

.image-container {
    width: 90px;
    height: 90px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #ccc;
    overflow: hidden;
    border: 1px solid #999;
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

.text-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>