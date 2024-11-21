<template>
    <user-layout>
        <v-container>
            <h1 class="text-h4">Keranjang Anda</h1>
            <v-empty-state title="Keranjang anda kosong" v-if="data.length < 1" class="mt-4"></v-empty-state>
            <div class="mt-4" v-else>
                <div class="overflow-x-auto">
                    <table class="w-100 mb-4 text-center" style="border: 1px sold #ccc;">
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td class="text-subtitle-2 text-medium-emphasis">Qty</td>
                            <td class="text-subtitle-2 text-medium-emphasis">Total</td>
                            <td></td>
                        </tr>
                        <tr v-for="(item, index) in data" :key="item.id">
                            <td class="border-b" width="5%">
                                <v-checkbox @change="changeSelectedItem(item)"></v-checkbox>
                            </td>
                            <td width="15%" class="border-b">
                                <img :src="item.images[0]" alt="image" width="100" />
                            </td>
                            <td class="text-left border-b">
                                <b>{{ item.name }}</b>
                                <p>{{ formatRupiah(item.price) }}</p>
                            </td>
                            <td class="border-b">
                                <div class="product-qty my-4">
                                    <button class="mr-2" @click="changeQty('min', index)">
                                        <v-icon icon="mdi-minus"></v-icon>
                                    </button>
                                    <input type="number" min="0" :value="item.qty" readonly>
                                    <button class="ml-2" @click="changeQty('plus', index)">
                                        <v-icon icon="mdi-plus"></v-icon>
                                    </button>
                                </div>
                            </td>
                            <td class="border-b">{{ formatRupiah(item.price * item.qty) }}</td>
                            <td width="10%" class="border-b">
                                <button @click="deleteCart(item.id)">
                                    <span class="text-red-darken-3">
                                        <v-icon icon="mdi-delete"></v-icon>
                                    </span>
                                </button>
                            </td>
                        </tr>
                        <tr class="text-h6 font-weight-bold">
                            <td></td>
                            <td>Total</td>
                            <td colspan="2"></td>
                            <td>{{ formatRupiah(totalPrice()) }}</td>
                        </tr>
                    </table>
                </div>
                <div class="text-right">
                    <v-btn class="mt-4" color="orange-accent-4" @click="openOrderModal" variant="flat">Beli</v-btn>
                </div>

            </div>
        </v-container>
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

                    <v-btn color="grey" text="Reset" variant="flat" @click="resetOrderModal"
                        :disabled="loadOrder"></v-btn>

                    <v-btn color="orange-accent-4" :loading="loadOrder" text="Beli" variant="flat" @click="orderProduct"
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

onMounted(() => {
    const getRefId = localStorage.getItem('ref_id');
    refId.value = getRefId
    if (!refId.value) {
        router.push('/not-found')
    }
    getData()
})

const cartStore = useCartStore();
const getData = async () => {
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

const selectedItems = ref([]);
const changeSelectedItem = (item) => {
    const exists = selectedItems.value.some((i) => i.id === item.id);

    if (exists) {
        selectedItems.value = selectedItems.value.filter((i) => i.id !== item.id);
    } else {
        selectedItems.value.push(item);
    }

}

const deleteCart = (id) => {
    data.value = data.value.filter(item => item.id !== id)
    selectedItems.value = selectedItems.value.filter(item => item.id !== id)
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

const resetOrderModal = () => {
    orderData.name = "";
    orderData.email = "";
    orderData.telp = "";
    orderData.address = "";
    v$.value.$reset();
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

        for(let item of selectedItems.value) {
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