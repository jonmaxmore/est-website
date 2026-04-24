<template>
  <SiteCmsPageRenderer v-if="page" :page="page as any" />
</template>

<script setup lang="ts">
const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : String(route.params.slug || '')

const { data: page } = await useFetch(`/api/public/pages/${slug}`)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
</script>
