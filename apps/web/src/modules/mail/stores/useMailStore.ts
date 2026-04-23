import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { MailListItemDto } from '@zhimao/shared-types'
import { mailApi } from '../api/mail.api'

export const useMailStore = defineStore('mail', () => {
  const emails = ref<MailListItemDto[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentCursor = ref<string | null>(null)
  const hasMore = ref(true)
  const selectedEmailId = ref<string | null>(null)
  const totalCount = ref(0)

  const unreadEmails = computed(() => emails.value.filter((e) => !e.isRead))

  const selectedEmail = computed(() =>
    emails.value.find((e) => e.id === selectedEmailId.value)
  )

  const unreadCount = computed(() => unreadEmails.value.length)

  async function fetchEmails(params?: { cursor?: string; limit?: number }) {
    loading.value = true
    error.value = null
    try {
      const res = await mailApi.findAll({
        cursor: params?.cursor ?? null,
        limit: params?.limit ?? 50,
        sortBy: 'receivedAt',
        order: 'desc'
      })

      if (!params?.cursor) {
        emails.value = res.data
      } else {
        emails.value.push(...res.data)
      }

      currentCursor.value = res.pagination?.cursor ?? null
      hasMore.value = res.pagination?.hasMore ?? false
      totalCount.value = res.pagination?.totalCount ?? 0

      return res.pagination
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } }
      error.value = err.response?.data?.error?.message || 'Failed to load emails'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || loading.value || !currentCursor.value) return
    await fetchEmails({ cursor: currentCursor.value, limit: 50 })
  }

  function selectEmail(id: string | null) {
    selectedEmailId.value = id
  }

  async function toggleStar(id: string) {
    const email = emails.value.find((e) => e.id === id)
    if (!email) return

    email.isStarred = !email.isStarred

    try {
      await mailApi.toggleStar(id, email.isStarred)
    } catch (e) {
      email.isStarred = !email.isStarred
      throw e
    }
  }

  async function markAsRead(id: string) {
    const email = emails.value.find((e) => e.id === id)
    if (!email || email.isRead) return

    email.isRead = true

    try {
      await mailApi.markAsRead(id)
    } catch (e) {
      email.isRead = false
      throw e
    }
  }

  return {
    emails,
    loading,
    error,
    hasMore,
    selectedEmailId,
    totalCount,
    currentCursor,
    unreadEmails,
    selectedEmail,
    unreadCount,
    fetchEmails,
    loadMore,
    selectEmail,
    toggleStar,
    markAsRead
  }
})
