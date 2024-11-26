<template>
    <main-layout>
        <div class="d-flex align-center text-subtitle-1 text-medium-emphasis">
            <span>Referral</span>
            <v-icon icon="mdi-chevron-right"></v-icon>
            <span>List</span>
        </div>
        <div class="d-flex align-center justify-space-between">
            <h4 class="text-h4 font-weight-bold">Referral</h4>
            <v-btn class="text-none font-weight-medium" color="orange-accent-4" variant="flat"
                @click="openAddModal()">Tambah Referral</v-btn>
        </div>

        <!-- Table -->
        <div class="d-flex align-center pe-2 mt-5 mb-2">
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>

            <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
                variant="outlined" class="bg-white" flat hide-details single-line></v-text-field>
        </div>

        <v-data-table :loading="loading" :headers="headerTable" :items="items" class="border rounded-lg overflow-hidden" v-model:search="search" :filter-keys="['name', 'link']">
            <template v-slot:loading>
                <v-skeleton-loader v-for="j in 5" :key="j" type="text"></v-skeleton-loader>
            </template>

            <template v-slot:item.no="{ item }">
                {{ items.indexOf(item) + 1 }}
            </template>


            <template v-slot:item.action="{ item }">
                <div class="d-inline">
                    <button class="ma-1" @click="openEditModal(item)">
                        <span class="text-orange-darken-3">
                            <v-icon icon="mdi-square-edit-outline"></v-icon>
                        </span>
                    </button>
                    |
                    <button class="ma-1" @click="openDeleteModal(item.id, item.name)">
                        <span class="text-red-darken-3">
                            <v-icon icon="mdi-delete"></v-icon>
                        </span>
                    </button>

                </div>
            </template>
        </v-data-table>
        <!-- End Table -->


        <!-- Start Modal -->
        <v-dialog v-model="dialog" max-width="600" persistent>
            <v-card :title="`${textModal} Referral`">
                <v-card-text>
                    <v-text-field v-model="data.name" :error-messages="v$.name.$errors.map((e) => e.$message)"
                        label="Nama" required @blur="v$.name.$touch" @input="v$.name.$touch"
                        class="mb-3"></v-text-field>

                    <v-text-field v-model="data.email" :error-messages="v$.email.$errors.map((e) => e.$message)"
                        label="Email" required @blur="v$.email.$touch" @input="v$.email.$touch"
                        class="mb-3"></v-text-field>

                    <v-text-field v-model="data.telp" :error-messages="v$.telp.$errors.map((e) => e.$message)"
                        label="No Hp" required @blur="v$.telp.$touch" @input="v$.telp.$touch"
                        class="mb-3"></v-text-field>

                    <v-textarea v-model="data.address" :error-messages="v$.address.$errors.map((e) => e.$message)"
                        label="Alamat" required @blur="v$.address.$touch" @input="v$.address.$touch"
                        class="mb-3"></v-textarea>

                    <!-- disable jika edit -->
                    <v-text-field label="Link Referral" v-model="data.link" :prefix="getDomain" readonly
                        v-if="data.id"></v-text-field>
                    <!-- aktif jika tambah -->
                    <v-text-field label="Link Referral" v-model="data.link"
                        :error-messages="v$.link.$errors.map((e) => e.$message)" required @blur="convertSlug('link')"
                        @input="v$.link.$touch" :prefix="getDomain" v-else></v-text-field>

                </v-card-text>
                <v-card-actions class="px-6 pb-4">
                    <v-spacer></v-spacer>

                    <v-btn text="Batal" variant="plain" @click="closeModal" :disabled="loadSave"></v-btn>

                    <v-btn color="amber-darken-4" :loading="loadSave" text="Simpan" variant="flat"
                        @click="saveUserReferral" :disabled="loadSave"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- End Modal -->

        <!-- Start Modal Delete -->
        <v-dialog v-model="deleteModal" max-width="600" persistent>
            <v-card>
                <v-card-text>
                    <div class="text-center pa-2">
                        <v-icon color="warning" icon="mdi-alert-circle" size="60"></v-icon>
                        <p class="mt-2">Apakah anda yakin ingin menghapus Referral <strong>{{ nameDel
                                }}</strong> ?</p>
                    </div>
                </v-card-text>
                <v-card-actions class="pa-6">
                    <v-spacer></v-spacer>

                    <v-btn text="tidak" variant="plain" @click="closeDeleteModal" :disabled="loadDelete"></v-btn>

                    <v-btn color="deep-orange-accent-4" :loading="loadDelete" text="ya" variant="flat"
                        @click="deleteUserReferral" :disabled="loadDelete"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- End Modal Delete -->
    </main-layout>
</template>
<script setup>
import MainLayout from "@/layouts/MainLayout.vue";
import { computed, onMounted, reactive, ref } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { email, required, numeric } from "@vuelidate/validators";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { toast } from "vue3-toastify";
import useAuth from "@/composables/useAuth";
import { useRouter } from "vue-router";

const { user, checkSessionExpiration, checkAuthStatus } = useAuth();

// Start Data
const dialog = ref(false);

const data = reactive({
    id: null,
    name: "",
    email: "",
    telp: "",
    address: "",
    link: ""
});

const rules = reactive({
    name: { required },
    email: { required, email },
    telp: { required, numeric },
    address: { required },
    link: { required },
});

const v$ = useVuelidate(rules, data);

const textModal = ref("")
const openAddModal = () => {
    dialog.value = true;
    textModal.value = "Tambah"
    v$.value.$reset();
    data.id = null;
    data.name = "";
    data.email = "";
    data.telp = "";
    data.address = "";
    data.link = generateLinkRef();
};

const openEditModal = (item) => {
    data.name = item.name;
    data.email = item.email;
    data.telp = item.telp;
    data.address = item.address;
    data.link = item.link;
    data.id = item.id

    textModal.value = "Edit"
    dialog.value = true;
};

const nameDel = ref("");
const idDel = ref(null)
const deleteModal = ref(false)
const openDeleteModal = (id, name) => {
    nameDel.value = name;
    idDel.value = id;
    deleteModal.value = true
}

const closeDeleteModal = () => {
    nameDel.value = "";
    idDel.value = null
    deleteModal.value = false
}

const closeModal = () => {
    dialog.value = false;
    v$.value.$reset();
    data.id = null;
    data.name = "";
    data.email = "";
    data.telp = "";
    data.address = "";
    data.link = "";
}

const convertSlug = (type) => {
    const str = data.link;

    const convert = str
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .replace(/^-+/, '')
        .replace(/-+$/, '');


    data.link = convert

    if (data.link == "") {
        v$.value.link.$touch();
    }
}

const getDomain = computed(() => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    const fullDomain = `${protocol}//${hostname}${port ? `:${port}` : ''}/referral/`;
    return fullDomain;
})

const generateLinkRef = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}
// End Data
//----------------------------------------------

// Start CUD
const router = useRouter()

const loadSave = ref(false);
const saveUserReferral = async () => {
    const isValid = await v$.value.$validate();
    if (!isValid) return

    loadSave.value = true;
    await checkSessionExpiration();
    await checkAuthStatus();


    if (!user.value) {
        loadSave.value = false;
        router.push({ name: 'Login' });
    }
    try {
        if (data.id) {
            const UserRef = doc(db, 'user_referrals', data.id);
            await updateDoc(UserRef, {
                name: data.name,
                email: data.email,
                telp: data.telp,
                address: data.address
            });
            toast.success('Referral berhasil diperbarui');
        } else {
            const queryUserLink = query(collection(db, 'user_referrals'), where('link', '==', data.link));
            const getUserLink = await getDocs(queryUserLink);

            // cek apakah link sudah ada yang menggunakan
            if (getUserLink.empty) {
                await addDoc(collection(db, 'user_referrals'), {
                    name: data.name,
                    email: data.email,
                    telp: data.telp,
                    address: data.address,
                    link: data.link,
                    created_at: serverTimestamp(),
                });
                toast.success('Referral berhasil ditambahkan');
                closeModal();
                fetchUserRef();
            } else {
                toast.error('Link referral sudah digunakan');
            }

        }
    } catch (error) {
        toast.error('Gagal menyimpan Referral');
    } finally {
        loadSave.value = false;
    }
};

const loadDelete = ref(false);
const deleteUserReferral = async () => {
    if (idDel.value) {
        loadDelete.value = true;
        await checkSessionExpiration();
        await checkAuthStatus();


        if (!user.value) {
            loadDelete.value = false;
            router.push({ name: 'Login' });
        }
        try {
            await deleteDoc(doc(db, 'user_referrals', idDel.value));
            toast.success('Referral berhasil dihapus');
            fetchUserRef();
            deleteModal.value = false
        } catch (error) {
            toast.error('Gagal menghapus Referral');
        } finally {
            loadDelete.value = false;
        }
    } else {
        toast.error('Referral tidak ditemukan');
        loadDelete.value = false;
        deleteModal.value = false
    }
}

// End CUD

//----------------------------------------------
// Start Get Data
const search = ref("");
const loading = ref(false);
const headerTable = ref([
    { key: 'no', sortable: false, title: 'No' },
    { key: 'name', title: 'Nama' },
    { key: 'telp', title: 'No Hp' },
    { key: 'link', title: 'Id Link Referral' },
    { key: 'action', title: 'Aksi', sortable: false, align: 'end' },

])

const items = ref([]);
const fetchUserRef = async () => {
    loading.value = true;
    try {
        const q = query(collection(db, 'user_referrals'), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);

        items.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loading.value = false;
    } catch (error) {
        toast.error('Gagal mengambil data Referral');
        loading.value = false;
    }
};

onMounted(() => {
    fetchUserRef();
})
// End Get Data
</script>