<template>
  <main-layout>
    <h2>Produk</h2>
    <v-card class="mx-auto mt-2 pa-3 overflow-x-auto" elevation="6">
      <v-btn class="text-none font-weight-regular" color="blue-darken-3" prepend-icon="mdi-plus" variant="flat"
        :to="{ name: 'ProductCreate' }">Tambah Produk</v-btn>
    </v-card>
  </main-layout>
</template>
<script setup>
import MainLayout from '@/layouts/MainLayout.vue';

</script>