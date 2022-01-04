<template>
  <div
    class="tw-h-full tw-w-full tw-text-primary tw-grid tw-place-content-center tw-text-center tw-py-12"
  >
    <h1 v-if="props.code === 403" class="tw-font-bold tw-text-7xl tw-py-2">
      403 Forbidden
      <q-icon name="do_not_touch" />
    </h1>
    <h1 v-if="props.code === 404" class="tw-font-bold tw-text-7xl tw-py-2">
      404 Not Found
      <q-icon name="search_off" />
    </h1>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    code: {
      type: Number,
      default: 404,
    },
  });
</script>
