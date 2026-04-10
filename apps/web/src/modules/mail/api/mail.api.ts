import { apiClient } from '@/api/client'
import type { MailDetailDto, MailListItemDto, PaginationMeta, PaginationQuery } from '@zhimao/shared-types'

type ListSuccess = {
  success: true
  data: MailListItemDto[]
  pagination?: PaginationMeta
}

type DetailSuccess = {
  success: true
  data: MailDetailDto
}

export const mailApi = {
  async findAll(params: PaginationQuery) {
    const res = (await apiClient.get('/emails', { params })) as unknown
    return res as ListSuccess
  },

  async findOne(id: string) {
    const res = (await apiClient.get(`/emails/${id}`)) as unknown
    return res as DetailSuccess
  },

  async markAsRead(id: string) {
    return apiClient.patch(`/emails/${id}`, { isRead: true })
  },

  async toggleStar(id: string, isStarred: boolean) {
    return apiClient.patch(`/emails/${id}`, { isStarred })
  },

  async batchMarkAsRead(ids: string[]) {
    return apiClient.post('/emails/batch/mark-read', { ids })
  },

  async search(query: string, params?: PaginationQuery) {
    const res = (await apiClient.get('/emails/search', {
      params: { q: query, ...params }
    })) as unknown
    return res as ListSuccess
  }
}
