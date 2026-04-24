<template>
  <SiteCmsPageRenderer v-if="page" :page="page" />
</template>

<script setup lang="ts">
import type { CmsPageData } from '../shared/types/cms-page'

const { data: page } = await useFetch<CmsPageData>('/api/public/pages/terms')

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
</script>
