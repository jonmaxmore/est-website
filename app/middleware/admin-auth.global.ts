export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return

  const isLoginRoute = to.path === '/admin/login'
  const { loggedIn, fetch } = useUserSession()

  if (!loggedIn.value) {
    try {
      await fetch()
    } catch {
      // Treat session fetch failures as logged-out admin visits.
    }
  }

  if (!loggedIn.value && !isLoginRoute) {
    return navigateTo({
      path: '/admin/login',
      query: { redirect: to.fullPath },
    })
  }

  if (loggedIn.value && isLoginRoute) {
    return navigateTo('/admin')
  }
})
