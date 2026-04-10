import { onMounted, onUnmounted } from 'vue'
import { useMailStore } from '../stores/useMailStore'

export function useKeyboardNav() {
  const store = useMailStore()

  const scrollToSelected = () => {
    const selectedEl = document.querySelector('.mail-item--selected')
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return
    }

    const currentIndex = store.emails.findIndex(
      (e) => e.id === store.selectedEmailId
    )

    switch (event.key) {
      case 'ArrowUp':
      case 'k':
        event.preventDefault()
        if (currentIndex > 0) {
          store.selectEmail(store.emails[currentIndex - 1].id)
          scrollToSelected()
        }
        break

      case 'ArrowDown':
      case 'j':
        event.preventDefault()
        if (currentIndex < store.emails.length - 1 && currentIndex >= 0) {
          store.selectEmail(store.emails[currentIndex + 1].id)
          scrollToSelected()
        }
        break

      case 'Enter':
        event.preventDefault()
        if (store.selectedEmailId) {
          store.markAsRead(store.selectedEmailId)
        }
        break

      case 'Escape':
        event.preventDefault()
        store.selectEmail(null)
        break

      default:
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
