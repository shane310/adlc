<script setup lang="ts">
import { NSpin, NVirtualList } from 'naive-ui'
import { computed } from 'vue'
import type { MailListItemDto } from '@zhimao/shared-types'
import MailListItem from './MailListItem.vue'

const props = withDefaults(
  defineProps<{
    emails: MailListItemDto[]
    selectedEmailId?: string | null
    loading?: boolean
    hasMore?: boolean
    variant?: 'compact' | 'comfortable'
    showPreview?: boolean
    showAiBadge?: boolean
    scrollHandler?: (e: Event) => void
  }>(),
  {
    selectedEmailId: null,
    loading: false,
    hasMore: true,
    variant: 'compact',
    showPreview: true,
    showAiBadge: true,
    scrollHandler: undefined
  }
)

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

const rowHeight = computed(() => {
  let h = props.variant === 'comfortable' ? 72 : 60
  if (props.showPreview) h += 20
  return h
})

const listItems = computed(() => props.emails)
</script>

<template>
  <div class="mail-list" role="listbox" aria-label="Email list">
    <NVirtualList
      :items="listItems"
      key-field="id"
      :item-size="rowHeight"
      class="mail-list__virtual"
      :scrollbar-props="{ trigger: 'none' }"
      :on-scroll="scrollHandler"
    >
      <template #default="{ item }">
        <MailListItem
          v-memo="[item.id, item.isRead, item.isStarred, item.id === selectedEmailId]"
          :email="(item as MailListItemDto)"
          :selected="item.id === selectedEmailId"
          :variant="variant"
          :show-preview="showPreview"
          :show-ai-badge="showAiBadge"
          @click="emit('select', item.id)"
        />
      </template>
    </NVirtualList>
    <div class="mail-list__footer">
      <NSpin v-if="loading && emails.length > 0" size="small" />
      <span v-else-if="!hasMore && emails.length > 0" class="mail-list__end">No more emails</span>
    </div>
  </div>
</template>

<style scoped>
.mail-list {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  background: #fff;
}
.mail-list__virtual {
  flex: 1;
  min-height: 0;
  max-height: 100%;
}
.mail-list__footer {
  padding: 8px;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
}
.mail-list__end {
  display: inline-block;
  padding: 4px;
}
</style>
