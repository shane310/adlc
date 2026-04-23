<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { NDrawer, NButton } from 'naive-ui'
import ResizablePanel from './ResizablePanel.vue'

const props = withDefaults(
  defineProps<{
    leftWidth?: number
    rightWidth?: number
    leftMinWidth?: number
    rightMinWidth?: number
    centerMinWidth?: number
    resizable?: boolean
    persistKey?: string
  }>(),
  {
    leftWidth: 280,
    rightWidth: 320,
    leftMinWidth: 240,
    rightMinWidth: 280,
    centerMinWidth: 520,
    resizable: true,
    persistKey: ''
  }
)

const leftW = ref(props.leftWidth)
const rightW = ref(props.rightWidth)
const drawerOpen = ref(false)

function initMq() {
  if (typeof window === 'undefined') return { tablet: false, mobile: false }
  return {
    tablet: window.matchMedia('(max-width: 1024px)').matches,
    mobile: window.matchMedia('(max-width: 768px)').matches
  }
}

const mq = initMq()
const mqTablet = ref(mq.tablet)
const mqMobile = ref(mq.mobile)

function readPersist() {
  if (!props.persistKey || typeof localStorage === 'undefined') return
  try {
    const raw = localStorage.getItem(props.persistKey)
    if (!raw) return
    const j = JSON.parse(raw) as { left?: number; right?: number }
    if (typeof j.left === 'number') leftW.value = j.left
    if (typeof j.right === 'number') rightW.value = j.right
  } catch {
    /* ignore */
  }
}

function writePersist() {
  if (!props.persistKey || typeof localStorage === 'undefined') return
  localStorage.setItem(
    props.persistKey,
    JSON.stringify({ left: leftW.value, right: rightW.value })
  )
}

function updateMq() {
  mqTablet.value = window.matchMedia('(max-width: 1024px)').matches
  mqMobile.value = window.matchMedia('(max-width: 768px)').matches
}

onMounted(() => {
  readPersist()
  updateMq()
  window.addEventListener('resize', updateMq)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMq)
})

watch([leftW, rightW], writePersist)

const showRightInline = computed(() => !mqTablet.value && !mqMobile.value)
const stackMobile = computed(() => mqMobile.value)
</script>

<template>
  <div
    class="three-col"
    :class="{
      'three-col--tablet': mqTablet && !mqMobile,
      'three-col--mobile': stackMobile
    }"
  >
    <template v-if="stackMobile">
      <div class="three-col__stack">
        <slot name="left" />
        <slot name="center" />
      </div>
    </template>
    <template v-else>
      <div class="three-col__row" :style="{ minWidth: `${centerMinWidth}px` }">
        <ResizablePanel
          v-if="resizable"
          v-model="leftW"
          :min="leftMinWidth"
          :max="480"
          class="three-col__left"
        >
          <slot name="left" />
        </ResizablePanel>
        <div
          v-else
          class="three-col__left three-col__left--fixed"
          :style="{ width: `${leftW}px`, minWidth: `${leftMinWidth}px` }"
        >
          <slot name="left" />
        </div>

        <div class="three-col__center" :style="{ minWidth: `${centerMinWidth}px` }">
          <slot name="center" />
        </div>

        <div
          v-if="showRightInline"
          class="three-col__right three-col__right--fixed"
          :style="{ width: `${rightW}px`, minWidth: `${rightMinWidth}px` }"
        >
          <slot name="right" />
        </div>

        <div v-if="mqTablet && !mqMobile" class="three-col__drawer-toggle">
          <NButton size="small" @click="drawerOpen = true">Context</NButton>
        </div>
      </div>
    </template>

    <NDrawer v-model:show="drawerOpen" :width="rightW" placement="right" v-if="mqTablet && !mqMobile">
      <slot name="right" />
    </NDrawer>
  </div>
</template>

<style scoped>
.three-col {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.three-col__row {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 16px;
  padding: 16px;
}
.three-col__left,
.three-col__center,
.three-col__right {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.three-col__center {
  flex: 1;
}
.three-col__drawer-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
}
.three-col--tablet .three-col__row {
  position: relative;
}
.three-col__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  flex: 1;
  min-height: 0;
}
</style>
