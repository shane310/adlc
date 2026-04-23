<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    axis?: 'horizontal' | 'vertical'
  }>(),
  {
    min: 0,
    max: 2000,
    axis: 'horizontal'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: number): void
}>()

const dragging = ref(false)
const startPos = ref(0)
const startSize = ref(0)

const style = computed(() =>
  props.axis === 'horizontal'
    ? { width: `${props.modelValue}px`, minWidth: `${props.min}px`, maxWidth: `${props.max}px` }
    : { height: `${props.modelValue}px`, minHeight: `${props.min}px`, maxHeight: `${props.max}px` }
)

function clamp(n: number) {
  return Math.min(props.max, Math.max(props.min, n))
}

function onMove(e: MouseEvent) {
  if (!dragging.value) return
  const delta = props.axis === 'horizontal' ? e.clientX - startPos.value : e.clientY - startPos.value
  emit('update:modelValue', clamp(startSize.value + delta))
}

function onUp() {
  dragging.value = false
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onUp)
}

function onDown(e: MouseEvent) {
  dragging.value = true
  startPos.value = props.axis === 'horizontal' ? e.clientX : e.clientY
  startSize.value = props.modelValue
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

</script>

<template>
  <div class="resizable-panel" :class="`resizable-panel--${axis}`" :style="style">
    <slot />
    <div
      class="resizable-panel__handle"
      :class="`resizable-panel__handle--${axis}`"
      role="separator"
      aria-orientation="vertical"
      @mousedown.prevent="onDown"
    />
  </div>
</template>

<style scoped>
.resizable-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.resizable-panel__handle {
  position: absolute;
  z-index: 2;
  background: transparent;
}
.resizable-panel--horizontal .resizable-panel__handle {
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
}
.resizable-panel--vertical .resizable-panel__handle {
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 8px;
  cursor: row-resize;
}
</style>
