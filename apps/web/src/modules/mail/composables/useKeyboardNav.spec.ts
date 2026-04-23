import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useMailStore } from '../stores/useMailStore'
import { useKeyboardNav } from './useKeyboardNav'
import type { MailListItemDto } from '@zhimao/shared-types'

const mk = (id: string, subject: string): MailListItemDto => ({
  id,
  subject,
  from: { address: 'a@b.com' },
  to: [],
  receivedAt: '2026-01-01T00:00:00.000Z',
  isRead: false,
  isStarred: false,
  hasAttachment: false
})

describe('useKeyboardNav', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('ArrowDown selects next email', async () => {
    const store = useMailStore()
    store.emails = [mk('1', 'A'), mk('2', 'B')]
    store.selectEmail('1')

    const C = defineComponent({
      setup() {
        useKeyboardNav()
        return () => null
      }
    })
    mount(C)

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    )

    expect(store.selectedEmailId).toBe('2')
  })

  it('ignores shortcuts when typing in input', async () => {
    const store = useMailStore()
    store.emails = [mk('1', 'A'), mk('2', 'B')]
    store.selectEmail('1')

    const C = defineComponent({
      setup() {
        useKeyboardNav()
        return () => null
      }
    })
    mount(C)

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const ev = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    Object.defineProperty(ev, 'target', { value: input, enumerable: true })
    window.dispatchEvent(ev)

    expect(store.selectedEmailId).toBe('1')
    document.body.removeChild(input)
  })
})
