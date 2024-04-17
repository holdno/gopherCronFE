<template>
  <router-view />
</template>

<script setup lang="ts"></script>
<style lang="scss">
  $borderRadius: 0.5rem;

  .q-btn {
    border-radius: $borderRadius !important;
  }
  .q-field__control {
    border-radius: $borderRadius !important;
  }
  .q-menu {
    border-radius: $borderRadius !important;
    overflow: hidden !important;
  }
  .q-field {
    border-radius: $borderRadius !important;
    overflow: hidden !important;
  }
  .q-card {
    border-radius: $borderRadius !important;
    overflow: hidden !important;
  }
</style>
