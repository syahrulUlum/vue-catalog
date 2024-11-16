<template>
    <main-layout>
        <div class="d-flex align-center text-subtitle-1 text-medium-emphasis">
            <span>Produk</span>
            <v-icon icon="mdi-chevron-right"></v-icon>
            <span>Edit</span>
        </div>
        <div class="d-flex align-center justify-space-between">
            <h4 class="text-h4 font-weight-bold">Edit Produk</h4>

            <v-btn class="text-none font-weight-medium" color="orange-accent-4" variant="flat"
                :to="{ name: 'Product' }">Kembali</v-btn>
        </div>
        <div class="mt-5">
            <v-text-field v-model="data.name" :error-messages="v$.name.$errors.map((e) => e.$message)" label="Nama"
                required @blur="v$.name.$touch" @input="v$.name.$touch"></v-text-field>

            <v-text-field v-model="data.price" :error-messages="v$.price.$errors.map((e) => e.$message)" label="Harga"
                required @blur="v$.price.$touch" @input="v$.price.$touch"></v-text-field>

            <v-textarea v-model="data.description" :error-messages="v$.description.$errors.map((e) => e.$message)"
                label="Deskripsi" required @blur="v$.description.$touch" @input="v$.description.$touch"></v-textarea>

            <p class="text-subtitle-1 ms-2 text-grey-darken-3">Gambar</p>
            <v-card variant="outlined" class="pa-3" :color="v$.images.$errors.length > 0 ? 'red-darken-4' : ''">
                <FileUpload :initial-files="existingImage" @update-files="handleUpdatedFiles" />
            </v-card>
            <v-scroll-y-transition>
                <div class="mt-1 ml-4 text-danger" v-if="v$.images.$errors.length > 0">
                    <small class="text-caption text-red-darken-4">{{ v$.images.$errors[0].$message }}</small>
                </div>
            </v-scroll-y-transition>
            <v-btn class="mt-3" color="orange-accent-4" text="Ubah Produk" variant="flat" @click="updateProduct"
                :disabled="loadUpdate" :loading="loadUpdate"></v-btn>
        </div>
    </main-layout>
</template>
<script setup>
import MainLayout from '@/layouts/MainLayout.vue';
import useVuelidate from '@vuelidate/core';
import { numeric, required } from "@vuelidate/validators";
import { onMounted, reactive, ref, watchEffect } from 'vue';
import { collection, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from "@/firebaseConfig";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'vue3-toastify';
import FileUpload from '@/components/FileUpload.vue';
import { useRoute, useRouter } from 'vue-router';
import useAuth from '@/composables/useAuth';

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
    data.images = files
};

const route = useRoute()
const existingImage = ref(null);
const getData = async () => {
    const id = route.params.id;
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        data.name = docSnap.data().name;
        data.price = docSnap.data().price;
        data.description = docSnap.data().description;
        data.images = docSnap.data().images || null;
        existingImage.value = docSnap.data().images || null;

    } else {
        // redirect 404
        router.push({ name: 'NotFound' })
    }
};
onMounted(() => {
    getData();
})

const router = useRouter()
const loadUpdate = ref(false);
const updateProduct = async () => {
    const id = route.params.id;
    const cleanedNullImage = data.images.filter(item => item.preview !== null);
    data.images = cleanedNullImage;

    const deletedImages = getDeletedImages();

    const isValid = await v$.value.$validate();
    if (!isValid) return

    loadUpdate.value = true;

    const { user, checkSessionExpiration, checkAuthStatus } = useAuth();
    await checkSessionExpiration();
    await checkAuthStatus();


    if (!user.value) {
        loadUpdate.value = false
        next({ name: 'Login' });
    } else {
        next();
    }
    try {
        let imageUrls = [];

        // Upload setiap file ke Firebase Storage
        if (data.images.length > 0) {
            for (let i = 0; i < data.images.length; i++) {
                if (data.images[i].preview) {
                    // Upload jika ada gambar baru
                    if (data.images[i].file) {
                        const extensionFile = data.images[i].file.name.split('.').pop()
                        const fileRef = storageRef(storage, `products/${generateRandomString()}.${extensionFile}`);
                        await uploadBytes(fileRef, data.images[i].file);
                        const url = await getDownloadURL(fileRef);
                        imageUrls.push(url.split('&token')[0]);
                    } else {
                        imageUrls.push(data.images[i].preview);
                    }
                }
            }
        }

        // Hapus gambar yang telah dihapus
        if (deletedImages.length > 0) {
            for (const image of deletedImages) {
                const imageRef = storageRef(storage, image);
                await deleteObject(imageRef).catch(() => { });
            }
        }

        // Simpan data terbaru ke Firestore
        const ProductRef = doc(db, 'products', id);
        await updateDoc(ProductRef, {
            name: data.name,
            price: data.price,
            description: data.description,
            images: imageUrls,
        });

        data.name = '';
        data.price = null;
        data.description = '';
        data.images = null;
        toast.success('Produk berhasil diperbarui');
        setTimeout(() => {
            router.push({ name: 'Product' });
        }, 3000);
    } catch (error) {
        toast.error('Gagal memperbarui produk:', error);
    } finally {
        loadUpdate.value = false;
    }
};

const getDeletedImages = () => {
    const deletedImages = existingImage.value.filter(oldItem => {
        const oldImage = typeof oldItem === 'object' ? oldItem.preview : oldItem;

        return oldImage !== null && oldImage !== undefined &&
            !data.images.some(newItem => {
                const newImage = typeof newItem === 'object' ? newItem.preview : newItem;
                return newImage === oldImage;
            });
    });
    return deletedImages;
}

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