<script setup lang="ts">
import { NSkeleton } from 'naive-ui'
import { computed, toRef } from 'vue'
import { useMailDetail } from '../composables/useMailDetail'
import MailSandbox from './MailSandbox.vue'

const props = defineProps<{
  emailId?: string | null
}>()

const emailIdRef = toRef(props, 'emailId')
const { detail, loading, error } = useMailDetail(emailIdRef)

const hasSelection = computed(() => !!props.emailId)
</script>

<template>
  <div class="mail-content" role="region" aria-live="polite" aria-label="Reading pane">
    <div v-if="!hasSelection" class="mail-content-empty">
      <p class="mail-content-empty__icon" aria-hidden="true">✉</p>
      <p>Select an email to read</p>
    </div>
    <div v-else-if="loading && !detail" class="mail-content-loading">
      <NSkeleton v-for="i in 5" :key="i" style="margin-bottom: 12px" :sharp="false" />
    </div>
    <div v-else-if="error" class="mail-content-error">
      <p>{{ error }}</p>
    </div>
    <template v-else-if="detail">
      <div class="mail-header">
        <h2 class="mail-header__subject">{{ detail.subject }}</h2>
        <div class="mail-meta">
          <span
            >From: {{ detail.from.name || '' }} &lt;{{ detail.from.address }}&gt;</span
          >
          <span>To: {{ detail.to.map((t) => t.address).join(', ') }}</span>
          <span>Date: {{ detail.receivedAt }}</span>
        </div>
      </div>
      <div class="mail-body">
        <MailSandbox :html="detail.bodyHtml || '<p></p>'" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.mail-content {
  padding: 16px 24px;
  min-height: 200px;
  overflow: auto;
}
.mail-content-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  color: #6b7280;
  font-size: 15px;
}
.mail-content-empty__icon {
  font-size: 48px;
  margin: 0 0 8px;
}
.mail-header__subject {
  font-size: 20px;
  margin: 0 0 12px;
  color: #111827;
}
.mail-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}
.mail-body {
  font-size: 15px;
  line-height: 1.65;
}
.mail-content-error {
  color: #b91c1c;
  padding: 16px;
}
</style>
