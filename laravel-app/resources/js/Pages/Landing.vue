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
  featuredProducts: ProductItem[];
  bestSelling: ProductItem[];
  deals: ProductItem[];
  occasions: OccasionItem[];
  counties: CountyItem[];
  trending: ProductItem[];
  newArrivals: ProductItem[];
  categories: CategoryItem[];
}>();
</script>

<template>
  <Head title="BuyHive — Inspected Multi-Vendor Marketplace" />
  <div class="min-h-screen bg-[#FAF9F6] text-[#141619]">
    <main class="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-12">
      <HorizontalCarousel
        title="Featured Products"
        subtitle="Stage-1 physically verified items across electronics, craft, home, and solar."
        view-all-href="/shop?featured=1"
        view-all-label="View All Featured"
      >
        <Link
          v-for="product in featuredProducts"
          :key="product.id"
          :href="`/products/${product.id}`"
          class="snap-start shrink-0 w-64 sm:w-72 bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-700/60 transition-all"
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
        title="Shop by Category"
        subtitle="All 17 BuyHive approved categories with structured subcategories."
        view-all-href="/categories"
        view-all-label="All 17 Categories"
      >
        <Link
          v-for="cat in categories"
          :key="cat.id"
          :href="`/categories/${cat.slug}`"
          class="snap-start shrink-0 w-56 bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-700/60 transition-all"
        >
          <div class="aspect-[4/3] bg-stone-100">
            <img v-if="cat.image_path" :src="cat.image_path" :alt="cat.name" class="w-full h-full object-cover" />
          </div>
          <div class="p-3.5">
            <div class="text-sm font-semibold text-[#141619] line-clamp-1">{{ cat.name }}</div>
            <div class="text-xs text-stone-500 mt-0.5">{{ cat.subcategories?.length ?? 0 }} subcategories</div>
          </div>
        </Link>
      </HorizontalCarousel>

      <HorizontalCarousel
        title="Best-Selling Products"
        subtitle="Ranked by genuine verified marketplace units sold — private seller identities remain protected."
        view-all-href="/shop?sort=best_selling"
        view-all-label="Shop Best Sellers"
      >
        <Link
          v-for="product in bestSelling"
          :key="product.id"
          :href="`/products/${product.id}`"
          class="snap-start shrink-0 w-64 sm:w-72 bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-700/60 transition-all"
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
        title="Deals and Offers"
        subtitle="Valid, backend-verified promotional prices."
        view-all-href="/deals"
        view-all-label="All Deals"
      >
        <Link
          v-for="product in deals"
          :key="product.id"
          :href="`/products/${product.id}`"
          class="snap-start shrink-0 w-64 sm:w-72 bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-700/60 transition-all"
        >
          <div class="aspect-[4/3] bg-stone-100">
            <img v-if="product.images[0]" :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover" />
          </div>
          <div class="p-4 space-y-1">
            <div class="text-xs text-amber-800 font-medium">Verified Deal</div>
            <div class="text-sm font-semibold text-[#141619] line-clamp-1">{{ product.name }}</div>
            <div class="font-mono text-sm font-bold text-[#141619]">KSh {{ Math.round(product.price).toLocaleString() }}</div>
          </div>
        </Link>
      </HorizontalCarousel>

      <HorizontalCarousel
        title="Shop by Occasion"
        subtitle="Curated gifts and essentials for milestones and celebrations."
        view-all-href="/occasions"
        view-all-label="Explore Occasions"
      >
        <Link
          v-for="occ in occasions"
          :key="occ.id"
          :href="`/occasions?occasion=${occ.slug}`"
          class="snap-start shrink-0 w-56 bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-700/60 transition-all"
        >
          <div class="aspect-[4/3] bg-stone-100">
            <img v-if="occ.image_path" :src="occ.image_path" :alt="occ.name" class="w-full h-full object-cover" />
          </div>
          <div class="p-3.5">
            <div class="text-sm font-semibold text-[#141619]">{{ occ.name }}</div>
            <div class="text-xs text-stone-500 mt-0.5 line-clamp-1">{{ occ.description }}</div>
          </div>
        </Link>
      </HorizontalCarousel>

      <HorizontalCarousel
        title="Shop by Location"
        subtitle="Discover inspected products available across all 47 Kenyan counties and collection hubs."
        view-all-href="/locations"
        view-all-label="All 47 Counties"
      >
        <Link
          v-for="county in counties"
          :key="county.id"
          :href="`/locations?county=${county.slug}`"
          class="snap-start shrink-0 w-56 bg-white border border-stone-200 rounded-xl p-4 hover:border-amber-700/60 transition-all space-y-2"
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
        title="Trending Products"
        subtitle="Products receiving genuine marketplace views and verified buyer demand."
        view-all-href="/trending"
        view-all-label="View All Trending"
      >
        <Link
          v-for="product in trending"
          :key="product.id"
          :href="`/products/${product.id}`"
          class="snap-start shrink-0 w-64 sm:w-72 bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-700/60 transition-all"
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
        title="New Arrivals"
        subtitle="Recently Stage-1 inspected and newly published marketplace products."
        view-all-href="/new-arrivals"
        view-all-label="View All New Arrivals"
      >
        <Link
          v-for="product in newArrivals"
          :key="product.id"
          :href="`/products/${product.id}`"
          class="snap-start shrink-0 w-64 sm:w-72 bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-700/60 transition-all"
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
