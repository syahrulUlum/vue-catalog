<template>
    <div class="my-auto">
        <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="448" rounded="lg">
            <p class="text-h4 text-center mb-4">Katalog</p>
            <v-text-field density="compact" placeholder="Enter your email" prepend-inner-icon="mdi-email-outline"
                variant="outlined" v-model="data.email" :error-messages="v$.email.$errors.map((e) => e.$message)"
                label="Email" required @blur="v$.email.$touch" @input="v$.email.$touch" class="mb-3"></v-text-field>

            <v-text-field :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" :type="visible ? 'text' : 'password'"
                density="compact" placeholder="Enter your password" prepend-inner-icon="mdi-lock-outline"
                variant="outlined" @click:append-inner="visible = !visible" v-model="data.password"
                :error-messages="v$.password.$errors.map((e) => e.$message)" label="Password" required
                @blur="v$.password.$touch" @input="v$.password.$touch" class="mb-3"></v-text-field >

            <v-btn :loading="loading" class="mb-8" color="blue" size="large" variant="flat" block @click="handleLogin">
                Log In
            </v-btn>

        </v-card>
    </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { email, required } from "@vuelidate/validators";
import useAuth from '@/composables/useAuth';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';

const visible = ref(false)
const data = reactive({
    email: "",
    password: ""
});

const rules = reactive({
    email: { required, email },
    password: { required },
});

const v$ = useVuelidate(rules, data);
const router = useRouter()
const loading = ref(false);
const { login } = useAuth()
const handleLogin = async() => {
    const isValid = await v$.value.$validate();
    if (!isValid) return

    loading.value = true;
    try {
        await login(data.email, data.password);
        router.push({ name: 'Dashboard' });
    } catch (error) {
        toast.error("Email atau password salah");
    } finally {
        loading.value = false;
    }
};
</script>