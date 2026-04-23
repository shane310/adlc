<script setup lang="ts">
import { ZmAppProvider } from '@/shared/components/zm';
</script>

<template>
  <ZmAppProvider>
    <router-view />
  </ZmAppProvider>
</template>
