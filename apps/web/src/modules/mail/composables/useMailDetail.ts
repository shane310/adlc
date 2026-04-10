import { ref, watch, type Ref } from 'vue'
import type { MailDetailDto } from '@zhimao/shared-types'
import { mailApi } from '../api/mail.api'

export function useMailDetail(emailId: Ref<string | null | undefined>) {
  const detail = ref<MailDetailDto | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  watch(
    emailId,
    async (raw) => {
      const id = raw ?? null
      if (!id) {
        detail.value = null
        error.value = null
        return
      }
      loading.value = true
      error.value = null
      try {
        const res = await mailApi.findOne(id)
        detail.value = res.data
      } catch (e: unknown) {
        const err = e as { response?: { data?: { error?: { message?: string } } } }
        error.value = err.response?.data?.error?.message || 'Failed to load email'
        detail.value = null
      } finally {
        loading.value = false
      }
    },
    { immediate: true }
  )

  return { detail, loading, error }
}
