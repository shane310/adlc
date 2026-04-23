import { computed, onMounted, ref } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import { useMailStore } from '../stores/useMailStore'

export function useMailList() {
  const store = useMailStore()
  const searchQuery = ref('')

  const filteredEmails = computed(() => {
    if (!searchQuery.value) return store.emails

    const query = searchQuery.value.toLowerCase()
    return store.emails.filter(
      (email) =>
        email.subject.toLowerCase().includes(query) ||
        email.from.name?.toLowerCase().includes(query) ||
        email.from.address.toLowerCase().includes(query)
    )
  })

  const tryLoadMore = useThrottleFn(() => {
    if (!store.hasMore || store.loading) return
    void store.loadMore()
  }, 400)

  function onVirtualListScroll(e: Event) {
    const el = e.target as HTMLElement
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
    if (remaining < 120) {
      tryLoadMore()
    }
  }

  onMounted(async () => {
    if (store.emails.length === 0) {
      await store.fetchEmails()
    }
  })

  return {
    emails: filteredEmails,
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    hasMore: computed(() => store.hasMore),
    searchQuery,
    onVirtualListScroll,
    selectEmail: store.selectEmail,
    toggleStar: store.toggleStar,
    markAsRead: store.markAsRead,
    refresh: () => store.fetchEmails()
  }
}
