<template>
  <div id="app-root" class="min-h-screen bg-surface-primary text-white">
    <SiteNavigation />
    <main id="main-content">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
