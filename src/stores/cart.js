import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
    state: () => ({
        // Ambil data dari localStorage
        cart: JSON.parse(localStorage.getItem('cart')) || [], 
    }),
    getters: {
        totalItems: (state) => state.cart.length,
    },
    actions: {
        addToCart(product) {
            const index = this.cart.findIndex((item) => item.id === product.id);
            if (index !== -1) {
                // Tambah qty jika produk sudah ada
                this.cart[index].qty += product.qty; 
            } else {
                // Tambah produk baru ke keranjang
                this.cart.push({ ...product }); 
            }
            this.saveCart();
        },
        removeFromCart(productId) {
            // Hapus produk dari keranjang
            this.cart = this.cart.filter((item) => item.id !== productId); 
            this.saveCart();
        },
        updateQuantity(productId, qty) {
            const index = this.cart.findIndex((item) => item.id === productId);
            if (index !== -1 && qty > 0) {
                // Perbarui qty
                this.cart[index].qty = qty; 
                this.saveCart();
            } else if (qty <= 0) {
                // Hapus jika qty <= 0
                this.removeFromCart(productId); 
            }
        },
        saveCart() {
            // Simpan ke localStorage
            localStorage.setItem('cart', JSON.stringify(this.cart));
        },
        async validateCart(products) {
            // Cek apakah produk di keranjang masih ada di database
            this.cart = this.cart.filter((item) =>
                products.some((product) => product.id === item.id)
            );
            this.saveCart();
        },
    },
});
