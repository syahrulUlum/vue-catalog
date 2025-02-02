<template>
    <main-layout>
        <div class="d-flex align-center text-subtitle-1 text-medium-emphasis">
            <span>Produk</span>
            <v-icon icon="mdi-chevron-right"></v-icon>
            <span>Edit</span>
        </div>
        <div class="d-flex align-center justify-space-between">
            <h4 class="text-h4 font-weight-bold">Edit Produk</h4>
        </div>
        <div class="mt-5">
            <v-text-field v-model="data.product_code" label="Kode Produk" readonly class="mb-3"></v-text-field>

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
                <FileUpload :initial-files="existingImage" @update-files="handleUpdatedFiles" />
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

            <v-btn color="orange-accent-4" text="Simpan Produk" variant="flat" @click="updateProduct"
                :disabled="loadUpdate" :loading="loadUpdate" class="mt-3"></v-btn>
        </div>
    </main-layout>
</template>
<script setup>
import MainLayout from '@/layouts/MainLayout.vue';
import useVuelidate from '@vuelidate/core';
import { numeric, required } from "@vuelidate/validators";
import { onMounted, reactive, ref, watch, watchEffect } from 'vue';
import { collection, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from "@/firebaseConfig";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'vue3-toastify';
import FileUpload from '@/components/FileUpload.vue';
import { useRoute, useRouter } from 'vue-router';
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
    name: { required },
    price: { required, numeric },
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
        data.product_code = docSnap.data().product_code;
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

const editorRef = ref(null)
const quillInstance = ref(null)
onMounted(async () => {
    await getData();

    if (editorRef.value) {
        quillInstance.value = new Quill(editorRef.value, {
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

        if (data.description) {
            quillInstance.value.root.innerHTML = data.description
        }

        quillInstance.value.on('text-change', () => {
            data.description = quillInstance.value.root.innerHTML
        })

    }
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
        router.push({ name: 'Login' });
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
                } else {
                    imageUrls.push(data.images[i]);
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

        toast.success('Produk berhasil disimpan');
        setTimeout(() => {
            router.push({ name: 'Product' });
            loadUpdate.value = false;
        }, 3000);
    } catch (error) {
        toast.error('Gagal menyimpan produk:', error);
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