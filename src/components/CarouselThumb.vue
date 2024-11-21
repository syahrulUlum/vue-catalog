<template>
    <swiper 
        :style="{
            '--swiper-navigation-color': '#fff',
            '--swiper-pagination-color': '#fff',
        }" 
        :loop="true" 
        :spaceBetween="10" 
        :navigation="true" 
        :thumbs="{ swiper: thumbsSwiper }" 
        :modules="modules"
        class="mySwiper2"
    >
        <swiper-slide v-for="(image, index) in images" :key="index" class="aspect-square">
            <img 
                :src="image" 
                :alt="`Nature image ${index + 1}`" 
                class="w-full h-full object-cover"
            />
        </swiper-slide>
    </swiper>

    <swiper 
        @swiper="setThumbsSwiper" 
        :loop="true" 
        :spaceBetween="10" 
        :slidesPerView="4" 
        :freeMode="true"
        :watchSlidesProgress="true" 
        :modules="modules" 
        class="mySwiper"
    >
        <swiper-slide v-for="(image, index) in images" :key="index" class="aspect-square">
            <img 
                :src="image" 
                :alt="`Thumbnail ${index + 1}`" 
                class="w-full h-full object-cover"
            />
        </swiper-slide>
    </swiper>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import '@/style.css';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';

const props = defineProps({
    img: Array,
});

const images = ref([]);
onMounted(() => {
    images.value = props.img;
})

const thumbsSwiper = ref(null);

const setThumbsSwiper = (swiper) => {
    thumbsSwiper.value = swiper;
};

const modules = [FreeMode, Navigation, Thumbs];
</script>

<style scoped>
.aspect-square {
    aspect-ratio: 1 / 1;
}
</style>