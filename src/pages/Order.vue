<template>
    Order
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()
const id = route.params.id;
</script>