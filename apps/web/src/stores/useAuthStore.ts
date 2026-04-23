import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)

  async function refreshToken() {
    return Promise.resolve()
  }

  function logout() {
    accessToken.value = null
  }

  return { accessToken, refreshToken, logout }
})
