<template>
  <SiteCmsPageRenderer v-if="page" :page="page" />
</template>

<!--
  ═══ Story Page ═══
  หน้าเนื้อเรื่อง — ดึงข้อมูลจาก CMS (admin สร้างผ่าน Pages)
  ถ้าไม่เจอ → แสดง 404
  ใช้ SiteCmsPageRenderer เพื่อ render content blocks
-->
<script setup lang="ts">
import type { CmsPageData } from '../shared/types/cms-page'

const { data: page } = await useFetch<CmsPageData>('/api/public/pages/story')

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
</script>
