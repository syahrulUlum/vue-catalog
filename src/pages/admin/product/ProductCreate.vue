<template>
    <main-layout>
        <h2>Tambah Produk</h2>
        <v-card class="mx-auto mt-2 pa-1 overflow-x-auto" elevation="6">
            <v-card-title>
                <v-btn class="text-none font-weight-regular" color="blue-darken-3" prepend-icon="mdi-arrow-left"
                    variant="flat" :to="{ name: 'Product' }">Kembali</v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="mt-3">
                <v-text-field v-model="data.name" :error-messages="v$.name.$errors.map((e) => e.$message)" label="Nama"
                    required @blur="v$.name.$touch" @input="v$.name.$touch"></v-text-field>

                <v-text-field v-model="data.price" :error-messages="v$.price.$errors.map((e) => e.$message)"
                    label="Harga" required @blur="v$.price.$touch" @input="v$.price.$touch"></v-text-field>

                <v-textarea v-model="data.description" :error-messages="v$.description.$errors.map((e) => e.$message)"
                    label="Deskripsi" required @blur="v$.description.$touch"
                    @input="v$.description.$touch"></v-textarea>

                <p class="text-subtitle-1 ms-2 text-grey-darken-3">Gambar</p>
                <v-card variant="outlined" class="pa-3" :color="v$.images.$errors.length > 0 ? 'red-darken-4' : ''">
                    <FileUpload @update-files="handleUpdatedFiles" />
                </v-card>
                <v-scroll-y-transition>
                    <div class="mt-1 ml-4 text-danger" v-if="v$.images.$errors.length > 0">
                        <small class="text-caption text-red-darken-4">{{ v$.images.$errors[0].$message }}</small>
                    </div>
                </v-scroll-y-transition>
            </v-card-text>
            <v-card-actions class="pa-6">
                <v-btn color="primary" text="Tambah Produk" variant="flat" @click="createProduct" :disabled="loadCreate"
                    :loading="loadCreate"></v-btn>
            </v-card-actions>
        </v-card>
    </main-layout>
</template>
<script setup>
import MainLayout from '@/layouts/MainLayout.vue';
import useVuelidate from '@vuelidate/core';
import { numeric, required } from "@vuelidate/validators";
import { reactive, ref } from 'vue';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from "@/firebaseConfig";
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'vue3-toastify';
import FileUpload from '../../../components/FileUpload.vue';
import { useRouter } from 'vue-router';

const data = reactive({
    name: "",
    price: null,
    description: "",
    images: null,
});

const rules = reactive({
    name: { required },
    price: { required, numeric },
    description: { required },
    images: { required }
});

const v$ = useVuelidate(rules, data);

const handleUpdatedFiles = (files) => {
    data.images = files.filter(f => f.file);
};

const router = useRouter()
const loadCreate = ref(false);
const createProduct = async () => {
    const isValid = await v$.value.$validate();
    if (!isValid) return

    loadCreate.value = true;
    try {
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
            name: data.name,
            price: data.price,
            description: data.description,
            images: imageUrls,
            created_at: serverTimestamp(),
        });

        data.name = '';
        data.price = null;
        data.description = '';
        data.images = null;
        toast.success('Produk berhasil disimpan');
        setTimeout(() => {
            router.push({ name: 'Product' });
        }, 3000);
    } catch (error) {
        toast.error('Gagal menyimpan produk:', error);
    } finally {
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