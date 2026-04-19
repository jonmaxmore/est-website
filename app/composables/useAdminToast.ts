/**
 * Simple toast notification composable for admin pages.
 * Usage:
 *   const { toast, showToast } = useAdminToast()
 *   showToast('Settings saved!')
 *   showToast('Error occurred', 'error')
 */
export function useAdminToast() {
  const toast = reactive({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  })

  let timeoutId: ReturnType<typeof setTimeout> | null = null

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) {
    if (timeoutId) clearTimeout(timeoutId)
    toast.message = message
    toast.type = type
    toast.show = true
    timeoutId = setTimeout(() => {
      toast.show = false
    }, duration)
  }

  return { toast, showToast }
}
