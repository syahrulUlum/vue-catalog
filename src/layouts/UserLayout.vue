<template>
    <v-app-bar :elevation="2" prominent>
        <v-app-bar-title class="font-weight-bold">
            <router-link class="text-decoration-none text-black" :to="{ name: 'Catalogs' }">Katalog</router-link>
        </v-app-bar-title>

        <template v-slot:append>
            <router-link class="text-decoration-none text-black mx-3" :to="{ name: 'Cart' }" stacked>
                <v-badge v-if="totalCart > 0" color="error" :content="totalCart">
                    <v-icon size="x-large">mdi-cart-variant</v-icon>
                </v-badge>

                <v-icon size="x-large" v-else>mdi-cart-variant</v-icon>
            </router-link>

            <v-btn class="text-none" stacked>
                <v-icon size="x-large">mdi-face-agent</v-icon>
            </v-btn>
        </template>
    </v-app-bar>
    <v-main class="h-auto">
        <div class="pa-6 h-auto">
            <slot />
        </div>
    </v-main>
</template>
<script setup>
import { useCartStore } from '@/stores/cart';
import { ref, watch } from 'vue';

const cartStore = useCartStore();
const totalCart = ref(cartStore.totalItems)

watch(() => cartStore.totalItems, () => {
    totalCart.value = cartStore.totalItems
})
</script>