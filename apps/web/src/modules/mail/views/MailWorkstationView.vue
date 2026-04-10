<script setup lang="ts">
import { ref, watch } from 'vue'
import ThreeColumnLayout from '@/components/layout/ThreeColumnLayout.vue'
import { useKeyboardNav } from '../composables/useKeyboardNav'
import { useMailList } from '../composables/useMailList'
import { useMailStore } from '../stores/useMailStore'
import MailContent from '../components/MailContent.vue'
import MailList from '../components/MailList.vue'
import MailToolbar from '../components/MailToolbar.vue'

const store = useMailStore()
const {
  emails,
  loading,
  error,
  hasMore,
  searchQuery,
  onVirtualListScroll,
  refresh,
  selectEmail
} = useMailList()

useKeyboardNav()

const listVariant = ref<'compact' | 'comfortable'>('compact')

watch(
  () => store.emails.length,
  () => {
    if (store.emails.length > 0 && store.selectedEmailId === null) {
      store.selectEmail(store.emails[0].id)
    }
  },
  { immediate: true }
)

function onSelect(id: string) {
  selectEmail(id)
}
</script>

<template>
  <div class="mail-workstation">
    <MailToolbar
      v-model="searchQuery"
      v-model:variant="listVariant"
      @refresh="refresh"
    />
    <div v-if="error" class="mail-workstation__error" role="alert">
      {{ error }}
    </div>
    <ThreeColumnLayout persist-key="mail-workbench-layout" class="mail-workstation__layout">
      <template #left>
        <div class="mail-workstation__col mail-workstation__col--list">
          <MailList
            :emails="emails"
            :selected-email-id="store.selectedEmailId"
            :loading="loading"
            :has-more="hasMore"
            :variant="listVariant"
            :scroll-handler="onVirtualListScroll"
            @select="onSelect"
          />
        </div>
      </template>
      <template #center>
        <div class="mail-workstation__col mail-workstation__col--content">
          <MailContent :email-id="store.selectedEmailId" />
        </div>
      </template>
      <template #right>
        <div class="mail-workstation__sidebar">
          <p class="mail-workstation__sidebar-title">Customer context</p>
          <p class="mail-workstation__sidebar-placeholder">Placeholder for Epic 3</p>
        </div>
      </template>
    </ThreeColumnLayout>
  </div>
</template>

<style scoped>
.mail-workstation {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
  background: #f5f7fa;
}
.mail-workstation__layout {
  flex: 1;
  min-height: 0;
}
.mail-workstation__col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}
.mail-workstation__col--list {
  padding: 0;
}
.mail-workstation__col--content {
  padding: 0;
}
.mail-workstation__error {
  padding: 8px 16px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 14px;
}
.mail-workstation__sidebar {
  padding: 16px;
  font-size: 14px;
  color: #6b7280;
}
.mail-workstation__sidebar-title {
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px;
}
.mail-workstation__sidebar-placeholder {
  margin: 0;
}
</style>
