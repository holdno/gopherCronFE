<template>
  <div :class="props.class + ' tw-flex tw-items-center tw-flex-col'">
    <img :src="src" alt="logo" />
    <div class="tw-font-bold tw-text-md tw-text-center">GOPHERCRON</div>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps({
    class: {
      type: String,
      default: '',
    },
    src: {
      type: String,
      default: '/logo.png',
    },
  });
</script>
