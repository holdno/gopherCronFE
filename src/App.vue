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
  }
  .q-field {
    border-radius: $borderRadius !important;
    overflow: hidden !important;
  }
  .q-card {
    border-radius: $borderRadius !important;
    overflow: hidden !important;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    /* display: none; <- Crashes Chrome on hover */
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
  }

  input[type='number'] {
    -moz-appearance: textfield; /* Firefox */
  }
</style>
