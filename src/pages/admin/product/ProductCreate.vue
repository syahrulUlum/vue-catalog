<template>
    <main-layout>
        <h2>Tambah Produk</h2>
        <v-card class="mx-auto mt-2 pa-3 overflow-x-auto" elevation="6">
            <v-card-title>
                <v-btn class="text-none font-weight-regular" color="blue-darken-3" prepend-icon="mdi-arrow-left"
                    variant="flat" :to="{ name: 'Product' }">Kembali</v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="mt-3">
                <v-text-field v-model="data.nama" :error-messages="v$.nama.$errors.map((e) => e.$message)" label="Nama"
                    required @blur="v$.nama.$touch" @input="v$.nama.$touch"></v-text-field>

                <v-text-field v-model="data.harga" :error-messages="v$.harga.$errors.map((e) => e.$message)"
                    label="Harga" required @blur="v$.harga.$touch" @input="v$.harga.$touch"></v-text-field>

                <v-textarea v-model="data.description" :error-messages="v$.description.$errors.map((e) => e.$message)"
                    label="Deskripsi" required @blur="v$.description.$touch"
                    @input="v$.description.$touch"></v-textarea>

                <v-file-input required :error-messages="v$.images.$errors.map((e) => e.$message)" accept="image/*"
                    label="Upload Gambar" prepend-icon="mdi-image" @change="handleImages"></v-file-input>
                <v-card variant="outlined" class="pa-3">
                    <FileUpload @update-files="handleUpdatedFiles" />
                </v-card>
                <ul>
                    <li v-for="file in fileData">{{ file.file.name }}</li>
                </ul>
            </v-card-text>
            <v-card-actions class="pa-6">
                <v-btn color="primary" text="Tambah Produk" variant="flat" @click="createProduct"></v-btn>
            </v-card-actions>
        </v-card>
    </main-layout>
</template>
<script setup>
import MainLayout from '@/layouts/MainLayout.vue';
import useVuelidate from '@vuelidate/core';
import { numeric, required } from "@vuelidate/validators";
import { reactive, ref, watch, watchEffect } from 'vue';
import { collection, addDoc } from 'firebase/firestore';
import { db, storage } from "@/firebaseConfig";
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'vue3-toastify';
import FileUpload from '../../../components/FileUpload.vue';

const data = reactive({
    nama: "",
    harga: null,
    description: "",
    images: null,
});

const rules = reactive({
    nama: { required },
    harga: { required, numeric },
    description: { required },
    images: { required }
});

const v$ = useVuelidate(rules, data);

const selectedFiles = ref(null);
const handleImages = (event) => {
    const file = event.target.files[0];
    selectedFiles.value = file;
};

const createProduct = async () => {
    const isValid = await v$.value.$validate();
    if (!isValid) return

    try {
        let imageUrls = "";

        // Upload setiap file ke Firebase Storage
        const file = selectedFiles.value
        const extensionFile = file.name.split('.').pop()
        const fileRef = storageRef(storage, `products/${generateRandomString()}.${extensionFile}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        imageUrls = url;

        const image = imageUrls.split('&token')[0];
        // Simpan data ke Firestore
        await addDoc(collection(db, 'products'), {
            nama: data.nama,
            harga: data.harga,
            images: image
        });

        toast.success('Produk berhasil disimpan');
    } catch (error) {
        console.error('Gagal menyimpan produk:', error);
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

const fileData = ref([]);

// Fungsi untuk menangani file yang di-upload
const handleUpdatedFiles = (files) => {
    fileData.value = files.filter(f => f.file);;
};

</script>