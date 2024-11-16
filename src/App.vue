<template>
  <v-app class="bg-grey-lighten-5">
    <router-view :key="$route.fullPath"></router-view>
  </v-app>
</template>

<script setup>
</script>

<style>
@import url('https://cdn.jsdelivr.net/npm/@mdi/font/css/materialdesignicons.min.css');

#app>div>div>main>div>div.v-table.v-table--has-top.v-table--has-bottom.v-theme--light.v-table--density-default.v-data-table>div.v-table__wrapper>table>thead>tr {
    background-color: #FAFAFA;
}

.v-data-table-header__content {
    font-weight: 600;
}
</style>

