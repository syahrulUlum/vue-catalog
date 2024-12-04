<template>
    <main-layout>
        <div class="d-flex align-center text-subtitle-1 text-medium-emphasis">
            <span>Transaksi</span>
            <v-icon icon="mdi-chevron-right"></v-icon>
            <span>List</span>
        </div>
        <div class="d-flex align-center justify-space-between">
            <h4 class="text-h4 font-weight-bold">Transaksi</h4>
        </div>
        <v-row class="pe-2 mt-5 mb-2 justify-space-between ga-1" no-gutters>
            <v-col cols="12" sm="4">
                <v-sheet>
                    <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
                        variant="outlined" flat hide-details single-line></v-text-field>
                </v-sheet>
            </v-col>
            <v-col cols="12" sm="2">
                <v-sheet class="text-end bg-transparent">
                    <v-btn class="text-none font-weight-medium" style="height: 2.8em;" color="orange-accent-4"
                        variant="flat" block>
                        Export

                        <v-menu activator="parent">
                            <v-list>
                                <v-list-item>
                                    <v-btn block class="text-subtitle-1 rounded-0 justify-start"
                                        @click="exportToExcel('1')">Hari Ini</v-btn>
                                    <v-btn block class="text-subtitle-1 rounded-0 justify-start"
                                        @click="exportToExcel('7')">7
                                        Hari Yang Lalu</v-btn>
                                    <v-btn block class="text-subtitle-1 rounded-0 justify-start"
                                        @click="exportToExcel('30')">30
                                        Hari Yang Lalu</v-btn>
                                    <v-btn block class="text-subtitle-1 rounded-0 justify-start"
                                        @click="exportToExcel('all')">Semuanya</v-btn>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-btn>
                </v-sheet>
            </v-col>
        </v-row>

        <v-data-table :loading="loading" v-model:search="search" :headers="headerTable" :filter-keys="['code']"
            :items="items" class="border rounded-lg overflow-hidden">
            <template v-slot:loading>
                <v-skeleton-loader v-for="j in 5" :key="j" type="text"></v-skeleton-loader>
            </template>

            <template v-slot:item.no="{ item }">
                {{ items.indexOf(item) + 1 }}
            </template>

            <template v-slot:item.product_name="{ item }">
                {{ item.product.name }}
            </template>

            <template v-slot:item.created_at="{ item }">
                {{ formatDate(item.created_at) }}
            </template>

            <template v-slot:item.status="{ item }">
                <span v-if="item.status == 0"
                    class="text-indigo-darken-2 d-inline-block font-weight-bold">Diproses</span>
                <span v-if="item.status == 1" class="text-green d-inline-block font-weight-bold">Selesai</span>
                <span v-if="item.status == 2" class="text-red d-inline-block font-weight-bold">Dibatalkan</span>
            </template>

            <template v-slot:item.action="{ item }">
                <div class="d-inline">
                    <button class="ma-1" @click="openModalDetail(item)">
                        <span class="text-indigo-darken-2">
                            <v-icon icon="mdi-list-box-outline"></v-icon>
                        </span>
                    </button>
                </div>
            </template>
        </v-data-table>

        <!-- Modal Detail -->
        <v-dialog v-model="modalDetail" max-width="600" persistent>
            <v-card>
                <v-card-text>
                    <table class="styled-table">
                        <tbody>
                            <tr>
                                <td>Kode Transaksi</td>
                                <td>:</td>
                                <td>{{ data.code }}</td>
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
                                <td colspan="3">
                                    <div class="overflow-x-auto">
                                        <table class="w-100 mb-4 text-center" style="border: 1px sold #ccc;">
                                            <tbody>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td class="text-subtitle-2 text-medium-emphasis">Qty</td>
                                                    <td class="text-subtitle-2 text-medium-emphasis">Total</td>
                                                </tr>
                                                <tr class="text-subtitle-2" v-for="product in data.product"
                                                    :key="product.id">
                                                    <td width="10%" class="border-t">
                                                        <img :src="product.images[0]" width="50px">
                                                    </td>
                                                    <td class="text-left border-t">
                                                        <b>{{ product.name }}</b>
                                                        <p>{{ formatRupiah(product.price) }}</p>
                                                    </td>
                                                    <td class="border-t">{{ product.qty }}</td>
                                                    <td class="text-right border-t">{{ formatRupiah(product.qty *
                                                        product.price)
                                                        }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="border-top: 1px solid black;" colspan="3"><b>Data Lainnya</b></td>
                            </tr>
                            <tr>
                                <td>Total Harga</td>
                                <td>:</td>
                                <td>{{ formatRupiah(totalPrice(data.product)) }}</td>
                            </tr>
                            <tr>
                                <td>Tanggal Pembelian</td>
                                <td>:</td>
                                <td>{{ formatDate(data.created_at) }}</td>
                            </tr>
                            <tr>
                                <td>Kode Referral</td>
                                <td>:</td>
                                <td>{{ data.ref_id }}</td>
                            </tr>
                            <tr>
                                <td>Status Pembelian</td>
                                <td>:</td>
                                <td>
                                    <span v-if="data.status == 0"
                                        class="text-indigo-darken-2 d-inline-block font-weight-bold">Diproses</span>
                                    <span v-if="data.status == 1"
                                        class="text-green d-inline-block font-weight-bold">Selesai</span>
                                    <span v-if="data.status == 2"
                                        class="text-red d-inline-block font-weight-bold">Dibatalkan</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </v-card-text>
                <v-card-actions class="pr-6 pb-4">
                    <v-btn color="amber-darken-4 ma-1" variant="flat" text="tutup" @click="closeModalDetail"></v-btn>
                    <template v-if="data.status == 0">
                        <v-btn class="ma-1 bg-red" prepend-icon="mdi-cancel" text="Batal" @click="openModalAction(2)"
                            variant="flat"></v-btn>
                        <v-btn class="ma-1 bg-green" @click="openModalAction(1)" text="Selesai" prepend-icon="mdi-check"
                            variant="flat"></v-btn>
                    </template>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- End Modal Detail -->

        <!-- Start Modal Action -->
        <v-dialog v-model="actionModal" max-width="600" persistent>
            <v-card>
                <v-card-text>
                    <div class="text-center pa-2">
                        <v-icon color="warning" icon="mdi-alert-circle" size="60"></v-icon>
                        <p class="mt-2" v-if="statusAction == 1">Transaksi ini sudah selesai?</p>
                        <p class="mt-2" v-if="statusAction == 2">Yakin membatalkan transaksi ini?</p>
                    </div>
                </v-card-text>
                <v-card-actions class="pr-6 pb-4">
                    <v-btn text="tidak" variant="plain" @click="actionModal = false" :disabled="loadAction"></v-btn>

                    <v-btn :color="statusAction == 1 ? 'amber-darken-4' : 'deep-orange-accent-4'" :loading="loadAction"
                        text="Ya" variant="flat" @click="trxAction(statusAction)" :disabled="loadAction"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- End Modal Action -->
    </main-layout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue';
import { onMounted, reactive, ref } from 'vue';
import { toast } from 'vue3-toastify';
import { collection, doc, getDocs, orderBy, query, updateDoc, where, Timestamp } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import * as XLSX from 'xlsx';
import useAuth from '@/composables/useAuth';
import { useRouter } from 'vue-router';

const search = ref("");
const loading = ref(false);
const headerTable = ref([
    { key: 'no', sortable: false, title: 'No' },
    { key: 'code', title: 'Kode Transaksi' },
    { key: 'created_at', title: 'Waktu Transaksi' },
    { key: 'status', title: 'Status' },
    { key: 'action', title: 'Aksi', sortable: true, align: 'end' },
])

const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const items = ref([]);
const fetchTrx = async () => {
    loading.value = true;
    try {
        const q = query(collection(db, 'transactions'), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);

        items.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loading.value = false;
    } catch (error) {
        toast.error('Gagal mengambil data Transaksi: ' + error);
        loading.value = false;
    }
};
onMounted(() => {
    fetchTrx();
})

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
        month: '2-digit',
        year: 'numeric',
    });

    const formattedTime = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    return `${formattedDate} ${formattedTime}`;
}
const totalPrice = (product) => {
    return product.reduce((total, item) => total + item.price * item.qty, 0)
}

const data = reactive({
    code: null,
    name: null,
    email: null,
    address: null,
    telp: null,
    ref_id: null,
    status: null,
    product: null,
    created_at: null
});

const idAction = ref(null);
const modalDetail = ref(false);
const openModalDetail = (item) => {
    modalDetail.value = true;
    data.code = item.code;
    data.name = item.name;
    data.email = item.email;
    data.address = item.address;
    data.telp = item.telp;
    data.ref_id = item.ref_id;
    data.status = item.status;
    data.product = item.product;
    data.created_at = item.created_at;
    idAction.value = item.id;
}

const closeModalDetail = () => {
    data.code = null;
    data.name = null;
    data.email = null;
    data.address = null;
    data.telp = null;
    data.ref_id = null;
    data.status = null;
    data.product = [];
    data.created_at = null;
    modalDetail.value = false;
    idAction.value = null;
}

const actionModal = ref(false);
const statusAction = ref(null);
const loadAction = ref(false);
const openModalAction = (status) => {
    actionModal.value = true;
    statusAction.value = status;
    loadAction.value = false;
}

const router = useRouter()
const trxAction = async (status) => {
    loadAction.value = true;
    const { user, checkSessionExpiration, checkAuthStatus } = useAuth();

    await checkSessionExpiration();
    await checkAuthStatus();


    if (!user.value) {
        loadAction.value = false;
        router.push({ name: 'Login' });
    }

    try {
        const docRef = doc(db, 'transactions', idAction.value);
        if (status == 1) {
            await updateDoc(docRef, { status: 1 });
            toast.success('Berhasil menyelesaikan transaksi');
        }
        if (status == 2) {
            await updateDoc(docRef, { status: 2 });
            toast.success('Berhasil membatalkan transaksi');
        }
        fetchTrx();
    } catch (error) {
        toast.error('Gagal mengubah status transaksi: ' + error);
    } finally {
        loadAction.value = false;
        actionModal.value = false;
        closeModalDetail()
    }
}

// Export Excel
const exportRange = ref('all');
const today = new Date();

const fetchDataForExcel = async () => {
    let startDate;
    let endDate = new Date();

    switch (exportRange.value) {
        case '1':
            startDate = new Date(today.setHours(0, 0, 0, 0));
            break;
        case '7':
            startDate = new Date(today.setDate(today.getDate() - 7));
            break;
        case '30':
            startDate = new Date(today.setMonth(today.getMonth() - 1));
            break;
        case 'all':
        default:
            startDate = null;
            break;
    }

    const collectionRef = collection(db, 'transactions');
    let q;

    if (startDate) {
        q = query(collectionRef, where('created_at', '>=', Timestamp.fromDate(startDate)));
    } else {
        q = query(collectionRef);
    }

    const querySnapshot = await getDocs(q);
    const dataExcel = [];
    querySnapshot.forEach((doc) => {
        dataExcel.push({ id: doc.id, ...doc.data() });
    });

    return { dataExcel, startDate, endDate };
};

const filterProduct = (product) => {
    const filteredProduct = product.map(item => ({
        product_code: item.product_code,
        name: item.name,
        price: item.price,
        qty: item.qty
    }));
    return JSON.stringify(filteredProduct);
}

const prepareDataForExcel = (dataExcel) => {
    return dataExcel.map(item => ({
        'Kode Transaksi': item.code,
        'Nama': item.name || 'N/A',
        'Email': item.email || 'N/A',
        'No Hp': item.telp || 'N/A',
        'Alamat': item.address || 'N/A',
        'Produk': filterProduct(item.product) || 'N/A',
        'Total Harga': totalPrice(item.product) || 'N/A',
        'Tanggal Pembelian': new Date(item.created_at?.seconds * 1000).toLocaleString() || 'N/A',
        'Kode Referral': item.ref_id || 'N/A',
        'Status': item.status == 0 ? 'Diproses' : item.status == 1 ? 'Selesai' : 'Dibatalkan' || 'N/A',
    }));
};

const exportToExcel = async (val) => {
    exportRange.value = val
    const { dataExcel: rawData, startDate, endDate } = await fetchDataForExcel();

    if (rawData.length == 0) {
        toast.error('Tidak ada data untuk diexport pada periode ini');
        return;
    }

    const formattedData = prepareDataForExcel(rawData);

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const columnCount = Object.keys(formattedData[0]).length;

    const customHeader = [
        [`Data dari ${startDate ? formatDate(startDate) : 'Awal'} ke ${formatDate(endDate)}`]
    ];
    XLSX.utils.sheet_add_aoa(worksheet, customHeader, { origin: 'A1' });

    const merge = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } }];
    worksheet['!merges'] = merge;

    const emptyRow = Array(columnCount).fill('');
    XLSX.utils.sheet_add_aoa(worksheet, [emptyRow], { origin: 'A2' });

    const dataHeaders = [Object.keys(formattedData[0])];
    XLSX.utils.sheet_add_aoa(worksheet, dataHeaders, { origin: 'A3' });

    XLSX.utils.sheet_add_json(worksheet, formattedData, { origin: 'A4', skipHeader: true });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DataExport');
    XLSX.writeFile(workbook, `KatalogExport_${exportRange.value}_days.xlsx`);
};
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