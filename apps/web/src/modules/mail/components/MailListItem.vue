<script setup lang="ts">
import type { MailListItemDto } from '@zhimao/shared-types'
import dayjs from 'dayjs'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    email: MailListItemDto
    selected?: boolean
    variant?: 'compact' | 'comfortable'
    showPreview?: boolean
    showAiBadge?: boolean
  }>(),
  {
    selected: false,
    variant: 'compact',
    showPreview: true,
    showAiBadge: true
  }
)

const emit = defineEmits<{
  click: []
}>()

const timeLabel = computed(() => dayjs(props.email.receivedAt).format('MMM D, HH:mm'))
</script>

<template>
  <div
    class="mail-item"
    :class="{
      'mail-item--unread': !email.isRead,
      'mail-item--read': email.isRead,
      'mail-item--selected': selected,
      'mail-item--starred': email.isStarred,
      [`mail-item--${variant}`]: true
    }"
    role="option"
    :aria-selected="selected"
    tabindex="0"
    @click="emit('click')"
  >
    <div class="mail-item__row1">
      <span v-if="!email.isRead" class="mail-item__dot" aria-hidden="true" />
      <span v-else class="mail-item__dot mail-item__dot--placeholder" />
      <span class="mail-item__star" :class="{ 'mail-item__star--on': email.isStarred }" aria-hidden="true"
        >★</span
      >
      <span class="mail-item__sender">{{ email.from.name || email.from.address }}</span>
      <span
        v-if="showAiBadge && email.aiCategory"
        class="mail-item__badge"
        >{{ email.aiCategory }}</span
      >
      <span class="mail-item__time">{{ timeLabel }}</span>
    </div>
    <div class="mail-item__subject">{{ email.subject }}</div>
    <div v-if="showPreview && email.previewText" class="mail-item__preview">
      {{ email.previewText }}
    </div>
  </div>
</template>

<style scoped>
.mail-item {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif;
  padding: 8px 16px;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
  box-sizing: border-box;
}
.mail-item--compact {
  min-height: 60px;
}
.mail-item--comfortable {
  min-height: 72px;
}
.mail-item--unread .mail-item__sender,
.mail-item--unread .mail-item__subject {
  font-weight: 600;
}
.mail-item--read .mail-item__sender,
.mail-item--read .mail-item__subject {
  font-weight: 400;
}
.mail-item--selected {
  background-color: #2f6feb;
  color: #fff;
}
.mail-item--selected .mail-item__preview,
.mail-item--selected .mail-item__time {
  color: rgba(255, 255, 255, 0.85);
}
.mail-item:not(.mail-item--selected):hover {
  background: #f3f4f6;
}
.mail-item:focus-visible {
  outline: 2px solid #2f6feb;
  outline-offset: 2px;
}
.mail-item__row1 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.mail-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2f6feb;
  flex-shrink: 0;
}
.mail-item__dot--placeholder {
  visibility: hidden;
}
.mail-item__star {
  color: #9ca3af;
  flex-shrink: 0;
}
.mail-item__star--on {
  color: #d97706;
}
.mail-item--selected .mail-item__star--on {
  color: #fcd34d;
}
.mail-item__sender {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mail-item__badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f0f4ff;
  color: #6366f1;
  border: 1px solid #c7d2fe;
  flex-shrink: 0;
}
.mail-item--selected .mail-item__badge {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
}
.mail-item__time {
  margin-left: auto;
  font-size: 13px;
  color: #9ca3af;
  flex-shrink: 0;
}
.mail-item__subject {
  font-size: 14px;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mail-item__preview {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
