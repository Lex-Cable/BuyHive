<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import HorizontalCarousel from '@/Components/HorizontalCarousel.vue';

interface ProductItem {
  id: number;
  name: string;
  brand?: string | null;
  price: number;
  original_price?: number | null;
  county_name?: string | null;
  town: string;
  inspection_badge: string;
  images: string[];
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  image_path?: string | null;
  subcategories?: { id: number }[];
}

interface OccasionItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_path?: string | null;
}

interface CountyItem {
  id: number;
  county_code: number;
  county_name: string;
  slug: string;
  has_collection_hub: boolean;
}

defineProps<{
  categories: CategoryItem[];
  occasions: OccasionItem[];
  counties: CountyItem[];
  deals: ProductItem[];
  trending: ProductItem[];
  newArrivals: ProductItem[];
}>();
</script>

<template>
  <Head title="Shopping Dashboard" />
  <div class="min-h-screen bg-[#FAF9F6] text-[#141619]">
    <main class="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 space-y-12">
      <HorizontalCarousel
        title="1. Shop by Category"
        subtitle="All 17 verified marketplace categories."
        view-all-href="/categories"
        view-all-label="All 17 Categories"
      >
        <Link
          v-for="cat in categories"
          :key="cat.id"
          :href="`/categories/${cat.slug}`"
          class="snap-start shrink-0 w-52 bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-700 transition-all"
        >
          <div class="aspect-[4/3] bg-stone-100">
            <img v-if="cat.image_path" :src="cat.image_path" :alt="cat.name" class="w-full h-full object-cover" />
          </div>
          <div class="p-3">
            <div class="text-sm font-semibold text-[#141619] line-clamp-1">{{ cat.name }}</div>
            <div class="text-xs text-stone-500 mt-0.5">{{ cat.subcategories?.length ?? 0 }} subcategories</div>
          </div>
        </Link>
      </HorizontalCarousel>

      <HorizontalCarousel
        title="2. Deals and Offers"
        subtitle="Backend-validated promotional markdowns and limited-time offers."
        view-all-href="/deals"
        view-all-label="All Deals"
      >
        <Link
          v-for="product in deals"
          :key="product.id"
          :href="`/products/${product.id}`"
          class="snap-start shrink-0 w-64 sm:w-72 bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-700 transition-all"
        >
          <div class="aspect-[4/3] bg-stone-100">
            <img v-if="product.images[0]" :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover" />
          </div>
          <div class="p-4 space-y-1">
            <div class="text-xs text-emerald-700 font-medium">{{ product.inspection_badge }}</div>
            <div class="text-sm font-semibold text-[#141619] line-clamp-1">{{ product.name }}</div>
            <div class="font-mono text-sm font-bold text-[#141619]">KSh {{ Math.round(product.price).toLocaleString() }}</div>
          </div>
        </Link>
      </HorizontalCarousel>

      <HorizontalCarousel
        title="3. Shop by Occasion"
        subtitle="Birthdays, weddings, graduations, housewarming, and corporate gifting."
        view-all-href="/occasions"
        view-all-label="All Occasions"
      >
        <Link
          v-for="occ in occasions"
          :key="occ.id"
          :href="`/occasions?occasion=${occ.slug}`"
          class="snap-start shrink-0 w-52 bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-700 transition-all"
        >
          <div class="aspect-[4/3] bg-stone-100">
            <img v-if="occ.image_path" :src="occ.image_path" :alt="occ.name" class="w-full h-full object-cover" />
          </div>
          <div class="p-3">
            <div class="text-sm font-semibold text-[#141619]">{{ occ.name }}</div>
            <div class="text-xs text-stone-500 mt-0.5 line-clamp-1">{{ occ.description }}</div>
          </div>
        </Link>
      </HorizontalCarousel>

      <HorizontalCarousel
        title="4. Shop by Location"
        subtitle="Discover inspected stock across all 47 Kenyan counties and collection hubs."
        view-all-href="/locations"
        view-all-label="All 47 Counties"
      >
        <Link
          v-for="county in counties"
          :key="county.id"
          :href="`/locations?county=${county.slug}`"
          class="snap-start shrink-0 w-56 bg-white border border-stone-200 rounded-xl p-4 hover:border-amber-700 transition-all space-y-2"
        >
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-amber-800">County</span>
            <span class="font-mono text-stone-400">#{{ String(county.county_code).padStart(2, '0') }}</span>
          </div>
          <div class="text-base font-bold text-[#141619]">{{ county.county_name }}</div>
          <div class="text-xs font-medium text-emerald-700">
            {{ county.has_collection_hub ? 'BuyHive Hub Available' : 'County Delivery Ready' }}
          </div>
        </Link>
      </HorizontalCarousel>

      <HorizontalCarousel
        title="5. Trending"
        subtitle="Products receiving strong buyer views and verified orders."
        view-all-href="/trending"
        view-all-label="Trending Page"
      >
        <Link
          v-for="product in trending"
          :key="product.id"
          :href="`/products/${product.id}`"
          class="snap-start shrink-0 w-64 sm:w-72 bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-700 transition-all"
        >
          <div class="aspect-[4/3] bg-stone-100">
            <img v-if="product.images[0]" :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover" />
          </div>
          <div class="p-4 space-y-1">
            <div class="text-xs text-emerald-700 font-medium">{{ product.inspection_badge }}</div>
            <div class="text-sm font-semibold text-[#141619] line-clamp-1">{{ product.name }}</div>
            <div class="font-mono text-sm font-bold text-[#141619]">KSh {{ Math.round(product.price).toLocaleString() }}</div>
          </div>
        </Link>
      </HorizontalCarousel>

      <HorizontalCarousel
        title="6. New Arrivals"
        subtitle="Recently Stage-1 inspected and newly published listings."
        view-all-href="/new-arrivals"
        view-all-label="New Arrivals"
      >
        <Link
          v-for="product in newArrivals"
          :key="product.id"
          :href="`/products/${product.id}`"
          class="snap-start shrink-0 w-64 sm:w-72 bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-700 transition-all"
        >
          <div class="aspect-[4/3] bg-stone-100">
            <img v-if="product.images[0]" :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover" />
          </div>
          <div class="p-4 space-y-1">
            <div class="text-xs text-emerald-700 font-medium">{{ product.inspection_badge }}</div>
            <div class="text-sm font-semibold text-[#141619] line-clamp-1">{{ product.name }}</div>
            <div class="font-mono text-sm font-bold text-[#141619]">KSh {{ Math.round(product.price).toLocaleString() }}</div>
          </div>
        </Link>
      </HorizontalCarousel>
    </main>
  </div>
</template>
