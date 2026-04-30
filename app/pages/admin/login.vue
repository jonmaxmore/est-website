<template>
  <NuxtLayout name="blank">
    <div class="flex min-h-dvh items-center justify-center bg-surface-primary bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,168,67,0.03),transparent_60%)] p-8">
      <div class="w-full max-w-[400px] rounded-2xl border border-white/6 bg-white/4 p-10 backdrop-blur-xl" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }">
        <div class="mb-8 text-center">
          <img src="/images/logo.webp" alt="ETS" class="mx-auto mb-4 h-16" />
          <h1 class="text-xl font-bold">Admin Login</h1>
          <p class="mt-1 text-sm text-white/40">Eternal Tower Saga — Control Panel</p>
        </div>
        <form
          data-testid="admin-login-form"
          :data-ready="hydrated ? 'true' : 'false'"
          @submit.prevent="handleLogin"
          class="flex flex-col gap-5"
        >
          <UFormField label="Email">
            <UInput v-model="form.email" type="email" placeholder="admin@example.com" size="lg" required icon="i-heroicons-envelope" />
          </UFormField>
          <UFormField label="Password">
            <UInput v-model="form.password" type="password" placeholder="••••••••" size="lg" required icon="i-heroicons-lock-closed" />
          </UFormField>
          <p v-if="error" class="text-center text-sm text-red-400">{{ error }}</p>
          <UButton
            type="submit"
            size="lg"
            block
            :loading="loading"
            :disabled="!hydrated || loading"
            class="bg-gradient-to-br from-gold to-gold-light font-bold text-black"
          >
            Sign In
          </UButton>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>
<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute()
const { fetch: fetchUserSession } = useUserSession()
const form = reactive({ email: '', password: '' })
const loading = ref(false); const error = ref('')
const hydrated = ref(false)

function getRedirectTarget() {
  const redirect = route.query.redirect
  if (typeof redirect !== 'string') return '/admin'
  if (!redirect.startsWith('/admin') || redirect.startsWith('/admin/login')) return '/admin'
  return redirect
}

async function handleLogin() {
  loading.value = true; error.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: form })
    await fetchUserSession()
    await navigateTo(getRedirectTarget())
  } catch (e: unknown) { const err = e as { data?: { message?: string } }; error.value = err?.data?.message || 'Login failed' }
  finally { loading.value = false }
}

onMounted(() => {
  hydrated.value = true
})
</script>
