<script setup lang="ts">
import { NConfigProvider, NMessageProvider, zhCN } from 'naive-ui';
</script>

<template>
  <n-config-provider :locale="zhCN">
    <n-message-provider>
      <slot />
    </n-message-provider>
  </n-config-provider>
</template>
