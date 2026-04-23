<script setup lang="ts">
import { NButton, NInput, NSpace } from 'naive-ui'
import { useDebounceFn } from '@vueuse/core'
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    selectedCount?: number
    modelValue?: string
  }>(),
  {
    selectedCount: 0,
    modelValue: ''
  }
)

const variant = defineModel<'compact' | 'comfortable'>('variant', { default: 'compact' })

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'refresh'): void
}>()

const localSearch = ref(props.modelValue)

const debouncedEmit = useDebounceFn((q: string) => {
  emit('update:modelValue', q)
}, 300)

watch(localSearch, (v) => {
  debouncedEmit(v)
})

watch(
  () => props.modelValue,
  (v) => {
    if (v !== localSearch.value) localSearch.value = v
  }
)

function toggleVariant() {
  variant.value = variant.value === 'compact' ? 'comfortable' : 'compact'
}
</script>

<template>
  <div class="mail-toolbar">
    <NSpace align="center" justify="space-between" style="width: 100%">
      <NInput
        v-model:value="localSearch"
        placeholder="Search mail"
        clearable
        style="max-width: 320px"
        aria-label="Search mail"
      />
      <NSpace>
        <NButton size="small" @click="toggleVariant">
          {{ variant === 'compact' ? 'Comfortable' : 'Compact' }}
        </NButton>
        <NButton size="small" @click="emit('refresh')">Refresh</NButton>
      </NSpace>
    </NSpace>
    <div v-if="selectedCount > 0" class="mail-toolbar__batch">
      {{ selectedCount }} selected
    </div>
  </div>
</template>

<style scoped>
.mail-toolbar {
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}
.mail-toolbar__batch {
  margin-top: 8px;
  font-size: 13px;
  color: #2f6feb;
}
</style>
