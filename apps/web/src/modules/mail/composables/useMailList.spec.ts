import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { mailApi } from '../api/mail.api'
import { useMailStore } from '../stores/useMailStore'
import { useMailList } from './useMailList'
import type { MailListItemDto } from '@zhimao/shared-types'

vi.mock('../api/mail.api', () => ({
  mailApi: {
    findAll: vi.fn()
  }
}))

const sample: MailListItemDto = {
  id: 'a1',
  subject: 'Alpha',
  from: { address: 'a@b.com' },
  to: [],
  receivedAt: '2026-01-01T00:00:00.000Z',
  isRead: true,
  isStarred: false,
  hasAttachment: false
}

describe('useMailList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(mailApi.findAll).mockResolvedValue({
      success: true,
      data: [sample],
      pagination: { cursor: null, hasMore: false, totalCount: 1 }
    })
  })

  it('filters emails by search query', async () => {
    const store = useMailStore()
    store.emails = [
      sample,
      { ...sample, id: 'b1', subject: 'Beta search' }
    ]

    const C = defineComponent({
      setup() {
        const { searchQuery, emails } = useMailList()
        return { searchQuery, emails }
      },
      template: '<div />'
    })
    const w = mount(C)
    const vm = w.vm as {
      searchQuery: string
      emails: MailListItemDto[]
    }
    vm.searchQuery = 'beta'
    await nextTick()

    expect(vm.emails).toHaveLength(1)
    expect(vm.emails[0].subject).toBe('Beta search')
  })
})
