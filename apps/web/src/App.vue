<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
</script>

<template>
  <NConfigProvider>
    <router-view />
  </NConfigProvider>
</template>

<style>
html,
body,
#app {
  margin: 0;
  height: 100%;
}
</style>
