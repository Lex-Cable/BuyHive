<script setup lang="ts">
import { computed, ref } from 'vue';
import { useForm, Head } from '@inertiajs/vue3';

interface Subcategory {
  id: number;
  name: string;
  is_restricted: boolean;
}
interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

const props = defineProps<{
  categories: Category[];
  commissionRate: number;
}>();

const form = useForm({
  name: '',
  category_id: props.categories[0]?.id ?? 1,
  subcategory_id: props.categories[0]?.subcategories[0]?.id ?? 1,
  location_id: 47,
  brand: '',
  description: '',
  price: 10000,
  town: 'Westlands',
  save_as_draft: false,
});

const selectedCategory = computed(() =>
  props.categories.find((c) => c.id === form.category_id)
);

const commissionAmount = computed(() =>
  Math.round(((Number(form.price) || 0) * props.commissionRate) / 100)
);
const estimatedProceeds = computed(() => (Number(form.price) || 0) - commissionAmount.value);

const submit = (draft: boolean) => {
  form.save_as_draft = draft;
  form.post('/seller/products');
};
</script>

<template>
  <Head title="List New Product — Seller Portal" />
  <div class="max-w-5xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold text-stone-900">List New Product (Stage-1 Inspection Required)</h1>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <form class="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-6 space-y-4" @submit.prevent="submit(false)">
        <div>
          <label class="block text-xs font-semibold mb-1">Product Name</label>
          <input v-model="form.name" required class="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold mb-1">Main Category</label>
            <select v-model="form.category_id" class="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1">Subcategory</label>
            <select v-model="form.subcategory_id" class="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm">
              <option v-for="sub in selectedCategory?.subcategories ?? []" :key="sub.id" :value="sub.id">
                {{ sub.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold mb-1">Selling Price (KSh)</label>
            <input v-model.number="form.price" type="number" min="50" required class="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm font-mono" />
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1">Brand</label>
            <input v-model="form.brand" class="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1">Description</label>
          <textarea v-model="form.description" rows="4" required class="w-full p-3 border border-stone-200 rounded-lg text-sm" />
        </div>

        <div class="flex gap-3">
          <button type="submit" :disabled="form.processing" class="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg">
            Submit for Stage-1 Inspection
          </button>
          <button type="button" :disabled="form.processing" class="px-5 py-2.5 border border-stone-300 text-xs font-semibold rounded-lg" @click="submit(true)">
            Save Draft
          </button>
        </div>
      </form>

      <aside class="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-6 space-y-3 h-fit">
        <h2 class="font-bold text-sm">Commission & Proceeds Preview</h2>
        <div class="flex justify-between text-xs">
          <span>Advertised Selling Price</span>
          <span class="font-mono font-semibold">KSh {{ form.price.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between text-xs text-amber-800">
          <span>BuyHive Commission ({{ commissionRate }}%)</span>
          <span class="font-mono">-KSh {{ commissionAmount.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between text-sm font-bold text-emerald-700 pt-2 border-t border-stone-100">
          <span>Estimated Seller Proceeds</span>
          <span class="font-mono">KSh {{ estimatedProceeds.toLocaleString() }}</span>
        </div>
      </aside>
    </div>
  </div>
</template>
