<template>
    <v-app-bar :elevation="2" prominent>
        <v-app-bar-title class="font-weight-bold">Katalog</v-app-bar-title>
    </v-app-bar>
    <v-main class="h-auto">
        <div class="pa-6 h-auto">
            <slot />
        </div>
    </v-main>
</template>