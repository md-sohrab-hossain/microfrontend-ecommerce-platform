<template>
  <div class="product-detail">
    <!-- Loading state -->
    <div v-if="loading" class="animate-pulse">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="skeleton h-96"></div>
        <div class="space-y-4">
          <div class="skeleton-title h-8"></div>
          <div class="skeleton-text h-6 w-1/3"></div>
          <div class="skeleton-text h-4"></div>
          <div class="skeleton-text h-4"></div>
          <div class="skeleton-text h-4 w-3/4"></div>
        </div>
      </div>
    </div>

    <!-- Debug info -->
    <div v-if="showDebugInfo" class="mb-4 p-4 bg-yellow-50 rounded border border-yellow-200">
      <p><strong>🔍 ProductDetail Debug:</strong></p>
      <p>Loading: {{ loading }}</p>
      <p>Error: {{ error || 'None' }}</p>
      <p>Product ID from props: {{ props.id }}</p>
      <p>Product ID from route: {{ route.params.id }}</p>
      <p>Route path: {{ route.path }}</p>
      <p>Current product: {{ product?.title || 'None' }}</p>
      <div class="mt-2 flex gap-2">
        <button 
          @click="testDirectAPI" 
          class="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          🧪 Test API
        </button>
        <button 
          @click="testRouterNavigation" 
          class="bg-purple-500 text-white px-3 py-1 rounded text-sm"
        >
          🧪 Test Router
        </button>
        <button 
          @click="showDebugInfo = false" 
          class="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
        >
          Hide Debug
        </button>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 text-lg font-semibold mb-2">{{ error }}</div>
      <button
        @click="retry"
        class="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Product detail -->
    <div v-else-if="product" class="space-y-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-sm text-gray-500">
        <button @click="goBack" class="hover:text-primary-600">← Back to Products</button>
        <span>/</span>
        <span class="text-gray-900">{{ product.title }}</span>
      </nav>

      <!-- Product content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Product image -->
        <div class="space-y-4">
          <div class="aspect-square bg-white rounded-lg shadow-sm border p-8">
            <img
              :src="product.image"
              :alt="product.title"
              class="w-full h-full object-contain"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- Product info -->
        <div class="space-y-6">
          <div>
            <div class="flex items-center space-x-2 mb-2">
              <span class="bg-primary-100 text-primary-800 px-2 py-1 rounded-md text-sm font-medium">
                {{ formatCategory(product.category) }}
              </span>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.title }}</h1>
            
            <!-- Rating -->
            <div class="flex items-center space-x-2 mb-4">
              <div class="flex items-center">
                <span v-for="star in 5" :key="star" class="text-yellow-400">
                  {{ star <= Math.round(product.rating.rate) ? '★' : '☆' }}
                </span>
              </div>
              <span class="text-gray-600">{{ product.rating.rate }}</span>
              <span class="text-gray-500">({{ product.rating.count }} reviews)</span>
            </div>

            <!-- Price -->
            <div class="text-4xl font-bold text-primary-600 mb-6">
              ${{ product.price.toFixed(2) }}
            </div>

            <!-- Description -->
            <div class="prose max-w-none">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p class="text-gray-600 leading-relaxed">{{ product.description }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-4 pt-6 border-t">
            <div class="flex items-center space-x-4">
              <label for="quantity" class="text-sm font-medium text-gray-700">Quantity:</label>
              <select
                v-model="quantity"
                id="quantity"
                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option v-for="i in 10" :key="i" :value="i">{{ i }}</option>
              </select>
            </div>
            
            <button
              @click="addToCart"
              :disabled="addingToCart"
              :class="[
                'w-full py-3 px-6 rounded-md transition-all font-medium text-lg',
                addingToCart 
                  ? 'bg-green-500 text-white cursor-not-allowed' 
                  : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg'
              ]"
            >
              <span v-if="addingToCart" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Added to Cart!
              </span>
              <span v-else>Add to Cart - ${{ (product.price * quantity).toFixed(2) }}</span>
            </button>
            
            <button
              @click="buyNow"
              class="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Buy Now
            </button>
          </div>

          <!-- Product features -->
          <div class="grid grid-cols-2 gap-4 pt-6 border-t">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl mb-2">🚚</div>
              <div class="text-sm font-medium text-gray-900">Free Shipping</div>
              <div class="text-xs text-gray-500">On orders over $50</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl mb-2">↩️</div>
              <div class="text-sm font-medium text-gray-900">Easy Returns</div>
              <div class="text-xs text-gray-500">30-day return policy</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related products -->
      <div v-if="relatedProducts.length > 0" class="pt-12 border-t">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct.id"
            :product="relatedProduct"
          />
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="text-center py-12">
      <div class="text-gray-500 text-lg mb-4">Product not found</div>
      <p class="text-gray-400 mb-4">The requested product could not be found.</p>
      <button
        @click="goBack"
        class="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
      >
        ← Back to Products
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, inject, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProductsStore } from '../stores/products';
import { EventBus } from '@microfrontend-ecommerce/shared';
import ProductCard from './ProductCard.vue';

interface Props {
  id?: string;
}

const props = defineProps<Props>();
const showDebugInfo = ref(false); // Clean UI - set to true for debugging if needed
const route = useRoute();
const router = inject('router') as any;
const productsStore = useProductsStore();
const eventBus = EventBus.getInstance();

// Component setup validation (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 ProductDetail: Setup - Router:', !!router, 'Route:', route.path, 'Params:', route.params);
}

// Reactive refs
const quantity = ref(1);
const addingToCart = ref(false);

// Computed properties
const loading = computed(() => productsStore.loading);
const error = computed(() => productsStore.error);
const product = computed(() => productsStore.currentProduct);
const relatedProducts = computed(() => {
  if (!product.value) return [];
  return productsStore.products
    .filter(p => p.category === product.value?.category && p.id !== product.value?.id)
    .slice(0, 4);
});

// Methods
const formatCategory = (category: string) => {
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/'/g, '');
};

const addToCart = () => {
  if (product.value) {
    addingToCart.value = true;
    
    eventBus.emit('ADD_TO_CART', {
      product: product.value,
      quantity: quantity.value,
    });
    console.log(`Added ${quantity.value} ${product.value.title} to cart`);
    
    // Reset button state after animation
    setTimeout(() => {
      addingToCart.value = false;
    }, 2000);
  }
};

const buyNow = () => {
  addToCart();
  // Navigate to cart
  if (router) {
    router.push('/cart');
  } else {
    // If router is not available, emit event to container
    eventBus.emit('NAVIGATE', { path: '/cart' });
  }
};

const goBack = () => {
  // Update container URL directly for microfrontend compatibility
  const productsUrl = '/products';
  
  if (typeof window !== 'undefined') {
    // Update browser URL
    window.history.pushState({}, '', productsUrl);
    
    // Trigger popstate event to notify other components
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }
  
  // Also update Vue router
  if (router) {
    console.log('🔄 ProductDetail: Navigating back to Vue root');
    router.push('/').catch((error) => {
      console.error('❌ ProductDetail: Vue router navigation to root failed:', error);
      // If even root navigation fails, force reload as last resort
      if (typeof window !== 'undefined') {
        console.log('🔄 ProductDetail: Force reloading page as last resort');
        window.location.href = '/products';
      }
    });
  } else {
    console.error('❌ ProductDetail: Router not available');
    if (typeof window !== 'undefined') {
      window.location.href = '/products';
    }
  }
};

const retry = () => {
  const productId = parseInt(props.id || route.params.id as string);
  if (productId) {
    productsStore.clearError();
    productsStore.fetchProduct(productId);
  }
};

const testDirectAPI = async () => {
  const productId = parseInt(props.id || route.params.id as string) || 3;
  console.log('🧪 Testing direct API call for product:', productId);
  
  try {
    const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
    const data = await response.json();
    console.log('✅ Direct API test successful:', data);
    alert(`API Test Success: ${data.title}`);
  } catch (error) {
    console.error('❌ Direct API test failed:', error);
    alert('API Test Failed - Check console for details');
  }
};

const testRouterNavigation = () => {
  console.log('🧪 Testing router navigation...');
  console.log('Router available:', !!router);
  console.log('Current route:', router?.currentRoute?.value);
  
  if (router) {
    console.log('🚀 Testing navigation to root');
    router.push('/').then(() => {
      console.log('✅ Navigation to root successful');
    }).catch((error) => {
      console.error('❌ Navigation to root failed:', error);
    });
  }
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iMC4zZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OTk5OSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
};

// Watch for route changes
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      const productId = parseInt(newId as string);
      productsStore.fetchProduct(productId);
    }
  }
);

// Initialize on mount
onMounted(async () => {
  console.log('🔍 ProductDetail: Component mounted');
  console.log('  Props ID:', props.id);
  console.log('  Route params:', route.params);
  console.log('  Route path:', route.path);
  
  const productId = parseInt(props.id || route.params.id as string);
  console.log('  Parsed product ID:', productId);
  
  if (productId && !isNaN(productId)) {
    console.log('📡 ProductDetail: Fetching product with ID:', productId);
    try {
      await productsStore.fetchProduct(productId);
      console.log('✅ ProductDetail: Product fetched successfully');
    } catch (error) {
      console.error('❌ ProductDetail: Failed to fetch product:', error);
    }
  } else {
    console.error('❌ ProductDetail: Invalid product ID:', productId);
  }
  
  // Ensure we have all products for related products
  if (productsStore.products.length === 0) {
    console.log('📡 ProductDetail: Fetching all products for related products');
    await productsStore.fetchProducts();
  }
});
</script>
