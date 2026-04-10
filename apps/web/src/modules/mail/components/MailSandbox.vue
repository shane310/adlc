<script setup lang="ts">
import DOMPurify from 'dompurify'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  html: string
}>()

const iframeRef = ref<HTMLIFrameElement | null>(null)

const sanitizedHtml = computed(() =>
  DOMPurify.sanitize(props.html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'img', 'div', 'span', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed']
  })
)

function writeBody() {
  const doc = iframeRef.value?.contentDocument
  if (!doc) return
  doc.open()
  doc.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:system-ui,sans-serif;line-height:1.6;} a{word-break:break-all;} img{max-width:100%;height:auto;}</style></head><body>${sanitizedHtml.value}</body></html>`
  )
  doc.close()
  const links = doc.querySelectorAll('a[href]')
  links.forEach((a) => {
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
  })
}

watch(
  () => props.html,
  () => {
    writeBody()
  }
)

function onLoad() {
  writeBody()
}
</script>

<template>
  <iframe
    ref="iframeRef"
    sandbox="allow-same-origin"
    class="mail-sandbox"
    title="Email body"
    @load="onLoad"
  />
</template>

<style scoped>
.mail-sandbox {
  width: 100%;
  min-height: 200px;
  border: none;
  background: #fff;
}
</style>
