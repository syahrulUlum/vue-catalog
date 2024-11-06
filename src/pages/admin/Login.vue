<template>
    <v-container class="login-container">
        <v-card class="pa-5">
            <v-card-title>Admin Login</v-card-title>
            <v-card-text>
                <v-text-field label="Username" v-model="email" />
                <v-text-field label="Password" type="password" v-model="password" />
            </v-card-text>
            <v-card-actions>
                <v-btn @click="login" color="primary">Login</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '@/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const email = ref('');
const password = ref('');
const router = useRouter();

const login = async () => {
    try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        router.push('/dashboard');
    } catch (error) {
        alert('Login failed');
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
</style>