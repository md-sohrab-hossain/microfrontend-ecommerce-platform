<template>
  <div class="product-card p-4 cursor-pointer" @click="goToProduct">
    <div class="relative">
      <img
        :src="product.image"
        :alt="product.title"
        class="product-image"
        @error="handleImageError"
      />
      <div class="absolute top-2 right-2">
        <span class="bg-white px-2 py-1 rounded-md text-xs font-medium text-gray-700 shadow-sm">
          {{ product.category }}
        </span>
      </div>
    </div>
    <div class="mt-4 space-y-2">
      <h3 class="product-title">{{ product.title }}</h3>
      <div class="flex items-center justify-between">
        <span class="product-price">${{ product.price.toFixed(2) }}</span>
        <div class="product-rating">
          <span class="text-yellow-400">★</span>
          <span>{{ product.rating.rate }}</span>
          <span class="text-gray-500">({{ product.rating.count }})</span>
        </div>
      </div>
      <p class="text-gray-600 text-sm line-clamp-2">{{ product.description }}</p>
      <button
        @click.stop="addToCart"
        :disabled="addingToCart"
        :class="[
          'w-full py-2 px-4 rounded-md transition-colors mt-3 font-medium',
          addingToCart 
            ? 'bg-green-500 text-white' 
            : 'bg-primary-600 text-white hover:bg-primary-700'
        ]"
      >
        <span v-if="addingToCart" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Added!
        </span>
        <span v-else>Add to Cart</span>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject, ref } from 'vue';
import { Product, EventBus } from '@microfrontend-ecommerce/shared';
interface Props {
  product: Product;
}
const props = defineProps<Props>();
const router = inject('router') as any;
const eventBus = EventBus.getInstance();
const addingToCart = ref(false);
// Router and product validation (keep minimal logging)
if (process.env.NODE_ENV === 'development') {
}
const goToProduct = () => {
  // Validate product ID first
  if (!props.product?.id) {
    console.error('❌ ProductCard: Invalid product - no ID available');
    return;
  }
  const productId = props.product.id;
  const containerUrl = `/products/product/${productId}`;
  const vueRoute = `/product/${productId}`;
  // Update browser URL (container handles this)
  if (typeof window !== 'undefined') {
    try {
      window.history.pushState({}, '', containerUrl);
      // Trigger popstate event to notify ReactWrapper
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    } catch (error) {
      console.error('❌ ProductCard: Browser URL update failed:', error);
      return; // Don't attempt router navigation if URL update fails
    }
  }
  // Vue router navigation with memory history (safe)
  if (router) {
    router.push(vueRoute).then(() => {
    }).catch((error) => {
      console.error('❌ ProductCard: Vue router navigation failed:', error);
      // Don't worry about router errors with memory history
    });
  } else {
  }
};
const addToCart = () => {
  addingToCart.value = true;
  // Test EventBus functionality
  if (eventBus && typeof eventBus.emit === 'function') {
    // Emit event to container app
    const cartData = {
      product: props.product,
      quantity: 1,
    };
    try {
      eventBus.emit('ADD_TO_CART', cartData);
      // Test immediate response
      setTimeout(() => {
      }, 100);
    } catch (error) {
      console.error('❌ ProductCard: Error emitting ADD_TO_CART:', error);
    }
  } else {
    console.error('❌ ProductCard: EventBus or emit method not available!');
  }
  // Reset button state after animation
  setTimeout(() => {
    addingToCart.value = false;
  }, 1500);
};
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iMC4zZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
};
</script>
