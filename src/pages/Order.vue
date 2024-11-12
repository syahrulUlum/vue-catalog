<template>
    <user-layout>
        <v-btn class="text-none font-weight-regular" color="blue-darken-3" prepend-icon="mdi-arrow-left" variant="flat"
            :to="{ name: 'CatalogDetail', params: { id: id } }">Kembali</v-btn>
    </user-layout>
</template>
<script setup>
import UserLayout from '@/layouts/UserLayout.vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()
const id = route.params.id;
</script>