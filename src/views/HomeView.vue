<script setup lang="ts">
import NavBar from '../components/NavBar.vue'
import HeroSection from '../components/HeroSection.vue'
import HighlightsSection from '../components/HighlightsSection.vue'
import FaqSection from '../components/FaqSection.vue'
import DownloadSection from '../components/DownloadSection.vue'
import FooterSection from '../components/FooterSection.vue'
</script>

<template>
  <NavBar />
  <main id="main">
    <HeroSection />
    <HighlightsSection />
    <FaqSection />
    <DownloadSection />
  </main>
  <FooterSection />
</template>
