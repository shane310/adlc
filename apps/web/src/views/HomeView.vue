<script setup lang="ts">
import { ZmTable } from '@/shared/components/zm';

const appName = import.meta.env.VITE_APP_NAME ?? '智贸';
</script>

<template>
  <main class="home">
    <ZmTable>
      <h1>{{ appName }}</h1>
      <p>Vue 3 + Naive UI（Zm 包装层）</p>
    </ZmTable>
  </main>
</template>

<style scoped>
.home {
  padding: 2rem;
  font-family: system-ui, sans-serif;
}
</style>
