import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mailApi } from '../api/mail.api'
import { useMailStore } from './useMailStore'
import type { MailListItemDto } from '@zhimao/shared-types'

vi.mock('../api/mail.api', () => ({
  mailApi: {
    findAll: vi.fn(),
    markAsRead: vi.fn(),
    toggleStar: vi.fn()
  }
}))

const sample: MailListItemDto = {
  id: 'a1',
  subject: 'Hello',
  from: { address: 'a@b.com', name: 'A' },
  to: [{ address: 'c@d.com' }],
  receivedAt: '2026-01-01T00:00:00.000Z',
  isRead: false,
  isStarred: false,
  hasAttachment: false
}

describe('useMailStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(mailApi.findAll).mockReset()
    vi.mocked(mailApi.markAsRead).mockReset()
    vi.mocked(mailApi.toggleStar).mockReset()
  })

  it('fetchEmails replaces list on first load and sets pagination', async () => {
    vi.mocked(mailApi.findAll).mockResolvedValue({
      success: true,
      data: [sample],
      pagination: { cursor: 'next', hasMore: true, totalCount: 1 }
    })

    const store = useMailStore()
    await store.fetchEmails()

    expect(store.emails).toHaveLength(1)
    expect(store.currentCursor).toBe('next')
    expect(store.hasMore).toBe(true)
    expect(store.totalCount).toBe(1)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchEmails appends when cursor is passed', async () => {
    const second = { ...sample, id: 'b2', subject: 'Two' }
    vi.mocked(mailApi.findAll)
      .mockResolvedValueOnce({
        success: true,
        data: [sample],
        pagination: { cursor: 'c1', hasMore: true, totalCount: 2 }
      })
      .mockResolvedValueOnce({
        success: true,
        data: [second],
        pagination: { cursor: 'c2', hasMore: false, totalCount: 2 }
      })

    const store = useMailStore()
    await store.fetchEmails()
    await store.fetchEmails({ cursor: 'c1', limit: 50 })

    expect(store.emails).toHaveLength(2)
    expect(store.hasMore).toBe(false)
  })

  it('loadMore uses current cursor', async () => {
    vi.mocked(mailApi.findAll).mockResolvedValue({
      success: true,
      data: [sample],
      pagination: { cursor: 'next', hasMore: true, totalCount: 10 }
    })

    const store = useMailStore()
    await store.fetchEmails()
    vi.mocked(mailApi.findAll).mockResolvedValue({
      success: true,
      data: [{ ...sample, id: 'x' }],
      pagination: { cursor: null, hasMore: false, totalCount: 10 }
    })
    await store.loadMore()

    expect(mailApi.findAll).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'next', limit: 50 })
    )
  })

  it('selectEmail accepts null to clear selection', () => {
    const store = useMailStore()
    store.selectEmail('a1')
    store.selectEmail(null)
    expect(store.selectedEmailId).toBeNull()
  })

  it('toggleStar reverts on API failure', async () => {
    vi.mocked(mailApi.findAll).mockResolvedValue({
      success: true,
      data: [sample],
      pagination: { cursor: null, hasMore: false, totalCount: 1 }
    })
    vi.mocked(mailApi.toggleStar).mockRejectedValue(new Error('network'))

    const store = useMailStore()
    await store.fetchEmails()
    await expect(store.toggleStar('a1')).rejects.toThrow('network')
    expect(store.emails[0].isStarred).toBe(false)
  })

  it('markAsRead reverts on API failure', async () => {
    vi.mocked(mailApi.findAll).mockResolvedValue({
      success: true,
      data: [sample],
      pagination: { cursor: null, hasMore: false, totalCount: 1 }
    })
    vi.mocked(mailApi.markAsRead).mockRejectedValue(new Error('network'))

    const store = useMailStore()
    await store.fetchEmails()
    await expect(store.markAsRead('a1')).rejects.toThrow('network')
    expect(store.emails[0].isRead).toBe(false)
  })
})
