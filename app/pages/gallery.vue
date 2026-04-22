<template>
  <SiteCmsPageRenderer :page="page" />
</template>

<script setup lang="ts">
const { data: page } = await useFetch('/api/public/pages/gallery')

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
</script>
