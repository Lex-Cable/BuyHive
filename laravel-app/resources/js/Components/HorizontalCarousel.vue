<script setup lang="ts">
import { ref } from 'vue';
import { Link } from '@inertiajs/vue3';

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    viewAllHref?: string;
    viewAllLabel?: string;
  }>(),
  {
    viewAllLabel: 'View All',
  }
);

const trackRef = ref<HTMLDivElement | null>(null);

const scrollTrack = (direction: -1 | 1) => {
  if (!trackRef.value) return;
  const width = trackRef.value.clientWidth;
  trackRef.value.scrollBy({
    left: direction * Math.max(280, width * 0.75),
    behavior: 'smooth',
  });
};
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between gap-4">
      <div>
        <Link
          v-if="props.viewAllHref"
          :href="props.viewAllHref"
          class="inline-block text-xl sm:text-2xl font-bold text-[#141619] tracking-tight hover:text-amber-800 transition-colors"
        >
          {{ props.title }}
        </Link>
        <h2 v-else class="text-xl sm:text-2xl font-bold text-[#141619] tracking-tight">
          {{ props.title }}
        </h2>
        <p v-if="props.subtitle" class="text-sm text-stone-600 mt-0.5">
          {{ props.subtitle }}
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          :aria-label="`Previous ${props.title}`"
          class="w-9 h-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-700 hover:bg-stone-50"
          @click="scrollTrack(-1)"
        >
          &lsaquo;
        </button>
        <button
          type="button"
          :aria-label="`Next ${props.title}`"
          class="w-9 h-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-700 hover:bg-stone-50"
          @click="scrollTrack(1)"
        >
          &rsaquo;
        </button>
        <Link
          v-if="props.viewAllHref"
          :href="props.viewAllHref"
          class="hidden sm:inline-flex items-center gap-1.5 ml-1 px-3 py-2 text-xs font-semibold text-[#141619] hover:text-amber-800 whitespace-nowrap"
        >
          <span>{{ props.viewAllLabel }}</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>

    <div
      ref="trackRef"
      class="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory"
    >
      <slot />
    </div>
  </section>
</template>
