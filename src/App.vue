<script setup lang="ts">
import { Analytics } from "@vercel/analytics/vue"
</script>

<template>
  <router-view />
  <Analytics />
</template>
