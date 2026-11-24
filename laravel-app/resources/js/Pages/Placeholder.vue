<script setup lang="ts">
import { computed } from 'vue';

const title = computed(() => {
  const segment = window.location.pathname.split('/').filter(Boolean).pop() ?? 'Marketplace';
  return segment.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
});
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
    <section class="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">BuyHive Marketplace</p>
      <h1 class="mt-3 text-3xl font-semibold">{{ title }}</h1>
      <p class="mt-4 leading-7 text-slate-600">
        This page is connected to the Laravel application. Its dedicated customer or seller workflow
        is being completed; no order, payment, inspection, or account action is performed on this screen.
      </p>
      <a href="/" class="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Return to marketplace</a>
    </section>
  </main>
</template>
