<template>
    <main-layout>
        <div class="d-flex align-center text-subtitle-1 text-medium-emphasis">
            <span>Produk</span>
            <v-icon icon="mdi-chevron-right"></v-icon>
            <span>Tambah</span>
        </div>
        <div class="d-flex align-center justify-space-between">
            <h4 class="text-h4 font-weight-bold">Tambah Produk</h4>
        </div>

        <div class="mt-5">
            <v-text-field v-model="data.product_code" :error-messages="v$.product_code.$errors.map((e) => e.$message)"
                label="Kode Produk" required @blur="v$.product_code.$touch" @input="v$.product_code.$touch"
                class="mb-3"></v-text-field>

            <v-text-field v-model="data.name" :error-messages="v$.name.$errors.map((e) => e.$message)" label="Nama"
                required @blur="v$.name.$touch" @input="v$.name.$touch" class="mb-3"></v-text-field>

            <v-text-field v-model="data.price" :error-messages="v$.price.$errors.map((e) => e.$message)" label="Harga"
                required @blur="v$.price.$touch" @input="v$.price.$touch" class="mb-3"></v-text-field>

            <div class="mb-3">
                <p class="text-subtitle-1 ms-2 text-grey-darken-3">Deskripsi</p>
                <div style="height: 200px;" ref="editorRef"></div>
            </div>

            <p class="text-subtitle-1 ms-2 text-grey-darken-3">Gambar</p>
            <v-card variant="outlined" class="pa-3" :color="v$.images.$errors.length > 0 ? 'red-darken-4' : ''">
                <FileUpload @update-files="handleUpdatedFiles" />
            </v-card>
            <v-scroll-y-transition>
                <div class="mt-1 ml-4 text-danger" v-if="v$.images.$errors.length > 0">
                    <small class="text-caption text-red-darken-4">{{ v$.images.$errors[0].$message }}</small>
                </div>
            </v-scroll-y-transition>
        </div>
        <div class="d-flex justify-end mt-3">
            <v-btn color="indigo-accent-4" text="Batal" variant="flat" class="mt-3 mr-3"
                :to="{ name: 'Product' }"></v-btn>

            <v-btn color="orange-accent-4" text="Simpan Produk" variant="flat" @click="createProduct"
                :disabled="loadCreate" :loading="loadCreate" class="mt-3"></v-btn>
        </div>
    </main-layout>
</template>
<script setup>
import MainLayout from '@/layouts/MainLayout.vue';
import useVuelidate from '@vuelidate/core';
import { numeric, required } from "@vuelidate/validators";
import { onMounted, reactive, ref, watch } from 'vue';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db, storage } from "@/firebaseConfig";
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'vue3-toastify';
import FileUpload from '@/components/FileUpload.vue';
import { useRouter } from 'vue-router';
import useAuth from '@/composables/useAuth';
import Quill from 'quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const data = reactive({
    product_code: "",
    name: "",
    price: null,
    description: "",
    images: null,
});

const rules = reactive({
    product_code: { required },
    name: { required },
    price: { required, numeric },
    images: { required }
});

const v$ = useVuelidate(rules, data);

const editorRef = ref(null)
onMounted(() => {
    if (editorRef.value) {
        const quill = new Quill(editorRef.value, {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['clean']
                ]
            },
        })

        quill.on('text-change', () => {
            data.description = quill.root.innerHTML
        })
    }
})

const handleUpdatedFiles = (files) => {
    data.images = files.filter(f => f.file);
};

const router = useRouter()
const loadCreate = ref(false);
const createProduct = async () => {
    const isValid = await v$.value.$validate();
    if (!isValid) return

    loadCreate.value = true;

    const { user, checkSessionExpiration, checkAuthStatus } = useAuth();
    await checkSessionExpiration();
    await checkAuthStatus();


    if (!user.value) {
        loadCreate.value = false;
        router.push({ name: 'Login' });
    }

    try {
        // Cek Kode produk
        const queryProductCode = query(collection(db, 'products'), where('product_code', '==', data.product_code));
        const getProductCode = await getDocs(queryProductCode);
        if (!getProductCode.empty) {
            toast.error('Kode produk sudah digunakan');
            loadCreate.value = false;
            return
        }

        let imageUrls = [];
        // Upload setiap file ke Firebase Storage
        for (const file of data.images) {
            const extensionFile = file.file.name.split('.').pop()
            const fileRef = storageRef(storage, `products/${generateRandomString()}.${extensionFile}`);
            await uploadBytes(fileRef, file.file);
            const url = await getDownloadURL(fileRef);
            imageUrls.push(url.split('&token')[0]);
        }

        // Simpan data ke Firestore
        await addDoc(collection(db, 'products'), {
            product_code: data.product_code,
            name: data.name,
            price: data.price,
            description: data.description,
            images: imageUrls,
            created_at: serverTimestamp(),
        });

        toast.success('Produk berhasil disimpan');
        setTimeout(() => {
            router.push({ name: 'Product' });
            loadCreate.value = false;
        }, 3000);
    } catch (error) {
        toast.error('Gagal menyimpan produk:', error);
        loadCreate.value = false;
    }
};

const generateRandomString = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 30; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}


</script>