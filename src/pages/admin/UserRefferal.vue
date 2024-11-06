<template>
    <main-layout>
        <h2>User Refferal</h2>
        <v-card class="mx-auto mt-2 pa-3" elevation="6">
            <v-btn class="text-none font-weight-regular" color="blue-darken-3" prepend-icon="mdi-plus"
                variant="flat">Tambah User Refferal</v-btn>
        </v-card>
    </main-layout>
</template>
<script setup>
import MainLayout from '@/layouts/MainLayout.vue';
import { ref } from 'vue';

const dialog = ref(false);
</script>