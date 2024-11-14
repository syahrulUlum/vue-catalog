<template>
    <user-layout v-if="checkData">
        <v-btn class="text-none font-weight-regular" color="blue-darken-3" prepend-icon="mdi-arrow-left" variant="flat"
            :to="{ name: 'Catalogs' }">Kembali ke Katalog</v-btn>

        <h2 class="text-h4 text-medium-emphasis mt-4">Transaksi Berhasil</h2>

        <v-card ref="contentToPrint" variant="outlined" class="mt-4">
            <v-card-text>
                <table class="styled-table">
                    <tr>
                        <td>Kode Transaksi</td>
                        <td>:</td>
                        <td>{{ id }}</td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px solid black;" colspan="3"><b>Data Pembeli</b></td>
                    </tr>
                    <tr>
                        <td>Nama</td>
                        <td>:</td>
                        <td>{{ data.name }}</td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td>:</td>
                        <td>{{ data.email }}</td>
                    </tr>
                    <tr>
                        <td>No Hp</td>
                        <td>:</td>
                        <td>{{ data.telp }}</td>
                    </tr>
                    <tr>
                        <td>Alamat</td>
                        <td>:</td>
                        <td>{{ data.address }}</td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px solid black;" colspan="3"><b>Produk yang dibeli</b></td>
                    </tr>
                    <tr>
                        <td>Nama Produk</td>
                        <td>:</td>
                        <td>{{ data.product.name }}</td>
                    </tr>
                    <tr>
                        <td>Harga Produk</td>
                        <td>:</td>
                        <td>{{ formatRupiah(data.product.price) }}</td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px solid black;" colspan="3"><b>Data Lainnya</b></td>
                    </tr>
                    <tr>
                        <td>Tanggal Pembelian</td>
                        <td>:</td>
                        <td>{{ formatDate(data.created_at) }}</td>
                    </tr>
                    <tr>
                        <td>Kode Referensi</td>
                        <td>:</td>
                        <td>{{ data.ref_id }}</td>
                    </tr>
                    <tr>
                        <td>Status Pembelian</td>
                        <td>:</td>
                        <td>
                            <span v-if="data.status == 0"
                                class="pa-3 bg-indigo-darken-2 d-inline-block font-weight-bold">Diproses</span>
                            <span v-if="data.status == 1"
                                class="pa-3 bg-green d-inline-block font-weight-bold">Selesai</span>
                            <span v-if="data.status == 2"
                                class="pa-3 bg-red d-inline-block font-weight-bold">Dibatalkan</span>
                        </td>
                    </tr>
                </table>
            </v-card-text>
        </v-card>
        <div class="text-center mb-3 mt-5 w-100">
            <v-btn @click="saveDoc" variant="outlined" class="bg-blue-grey-darken-1">
                Simpan
            </v-btn>
        </div>
    </user-layout>
    <v-empty-state v-else headline="Whoops, 404" title="Transaction not found"
        text="The Transaction you were looking for does not exist"></v-empty-state>
</template>
<script setup>
import UserLayout from '@/layouts/UserLayout.vue';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "@/firebaseConfig";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const route = useRoute()
const router = useRouter()
const id = route.params.id;

const data = reactive({
    name: null,
    email: null,
    address: null,
    telp: null,
    ref_id: null,
    status: null,
    product: null,
    created_at: null
});

const checkData = ref(false)
const getData = async () => {
    const trxRef = collection(db, 'transactions');
    const q = query(trxRef, where('code', '==', id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        data.name = docSnap.data().name;
        data.email = docSnap.data().email;
        data.address = docSnap.data().address;
        data.telp = docSnap.data().telp;
        data.ref_id = docSnap.data().ref_id;
        data.status = docSnap.data().status;
        data.product = docSnap.data().product;
        data.created_at = docSnap.data().created_at;
        checkData.value = true
    } else {
        checkData.value = false
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

const contentToPrint = ref(null);
const saveDoc = () => {
    const doc = new jsPDF();

    // Ambil elemen <v-card> dan tabel di dalamnya
    const cardElement = contentToPrint.value?.$el;
    if (!cardElement) {
        console.warn('Elemen <v-card> tidak ditemukan');
        return;
    }

    const tableElement = cardElement.querySelector('table');

    if (tableElement) {
        // Menggunakan autoTable dengan opsi untuk mengikuti style HTML asli
        autoTable(doc, {
            html: tableElement,
            theme: 'plain', // Tidak ada border default
            useCss: true,   // Menggunakan style dari CSS asli
            styles: {
                font: 'helvetica', // Anda bisa mengubah font sesuai keinginan
                fontSize: 12,
                cellPadding: 4,
            },
        });
    } else {
        console.warn('Tabel tidak ditemukan di dalam <v-card>');
    }

    doc.save(id + '.pdf');
};

const formatDate = (date) => {
    if (!date) return '-';

    if (typeof date === 'object' && date.seconds) {
        date = new Date(date.seconds * 1000);
    } else {
        date = new Date(date);
    }

    if (isNaN(date)) return '-';

    const formattedDate = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const formattedTime = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    return `${formattedDate} ${formattedTime}`;
}
</script>
<style scoped>
.styled-table {
    width: 100%;
    border-collapse: collapse;
}

.styled-table td {
    padding: 5px;
    font-size: 1rem;
}
</style>