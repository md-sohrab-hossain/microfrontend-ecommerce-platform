import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { Product, CartItem, EventBus, productsApi, storage } from '@microfrontend-ecommerce/shared';
// Extended cart item with product details
export interface CartItemWithProduct extends CartItem {
  product?: Product;
}
// State interface
interface CartState {
  items: CartItemWithProduct[];
  loading: boolean;
  error: string | null;
  total: number;
  itemCount: number;
}
// Action types
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ITEM'; payload: CartItemWithProduct }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItemWithProduct[] }
  | { type: 'UPDATE_PRODUCT_DETAILS'; payload: { productId: number; product: Product } };
// Initial state - START with loading = true to prevent empty cart flash
const initialState: CartState = {
  items: [],
  loading: true, // Start with loading to prevent showing empty cart immediately
  error: null,
  total: 0,
  itemCount: 0,
};
// Helper function to calculate totals
const calculateTotals = (items: CartItemWithProduct[]) => {
  const total = items.reduce((sum, item) => {
    return sum + ((item.product?.price || 0) * item.quantity);
  }, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};
// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId
      );
      let newItems: CartItemWithProduct[];
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      const { total, itemCount } = calculateTotals(newItems);
      const newState = {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
      return newState;
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.productId !== action.payload);
      const { total, itemCount } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      const { total, itemCount } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      };
    case 'LOAD_CART': {
      const { total, itemCount } = calculateTotals(action.payload);
      console.log('🔧 Cart Reducer: LOAD_CART action triggered');
      console.log('  Current loading state:', state.loading);
      console.log('  Payload items:', action.payload.length);
      console.log('  Calculated total:', total);
      console.log('  Calculated itemCount:', itemCount);
      
      const newState = {
        ...state,
        items: action.payload,
        total,
        itemCount,
        loading: false, // Set loading to false when cart data is loaded
      };
      
      console.log('🔧 Cart Reducer: LOAD_CART returning state with', action.payload.length, 'items and loading =', newState.loading);
      return newState;
    }
    case 'UPDATE_PRODUCT_DETAILS': {
      const newItems = state.items.map(item =>
        item.productId === action.payload.productId
          ? { ...item, product: action.payload.product }
          : item
      );
      const { total, itemCount } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }
    default:
      return state;
  }
};
// Context
interface CartContextType {
  state: CartState;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  loadCart: () => Promise<void>;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
// Provider component
interface CartProviderProps {
  children: ReactNode;
}
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Prevent multiple providers by checking global flag - FIX: Don't return null
  if ((window as any).__CART_PROVIDER_ACTIVE__) {
    console.log('⚠️ Cart Provider: Already active, but continuing to render provider');
  } else {
    console.log('✅ Cart Provider: First provider instance, setting active flag');
    (window as any).__CART_PROVIDER_ACTIVE__ = true;
  }
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const eventBus = EventBus.getInstance();
  // Track state changes
  useEffect(() => {
    // State updated
  }, [state.items.length, state.itemCount, state.total]);
  // Track if initial load is complete to prevent premature saves
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  // Save cart to localStorage whenever it changes - ONLY after initialization
  useEffect(() => {
    // Don't save until cart has been loaded from localStorage at least once
    if (!isInitialized) {
      console.log('🚫 Cart: Skipping localStorage save - not initialized yet');
      return;
    }
    
    console.log('💾 Cart: Saving cart to localStorage:', state.items.length, 'items');
    storage.set('cart', state.items);
  }, [state.items, isInitialized]);
  // Load product details for cart items
  const loadProductDetails = async (items: CartItemWithProduct[]) => {
    const itemsWithoutProducts = items.filter(item => !item.product);
    console.log('🔍 LoadProductDetails: Items without products:', itemsWithoutProducts.length);
    
    if (itemsWithoutProducts.length === 0) {
      console.log('✅ LoadProductDetails: All items have product details, skipping API calls');
      return;
    }
    
    console.log('⏳ LoadProductDetails: Setting loading = true for API calls');
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      console.log('📡 LoadProductDetails: Making API calls for', itemsWithoutProducts.length, 'items');
      const productPromises = itemsWithoutProducts.map(item =>
        productsApi.getProduct(item.productId)
      );
      const products = await Promise.all(productPromises);
      
      products.forEach((product, index) => {
        const item = itemsWithoutProducts[index];
        console.log('✅ LoadProductDetails: Got product details for', product.title);
        dispatch({
          type: 'UPDATE_PRODUCT_DETAILS',
          payload: { productId: item.productId, product },
        });
      });
    } catch (error) {
      console.error('❌ LoadProductDetails: Failed to load product details:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load product details' });
    } finally {
      console.log('🏁 LoadProductDetails: Setting loading = false (API calls complete)');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  // Action creators
  const addItem = useCallback((product: Product, quantity: number) => {
    const cartItem: CartItemWithProduct = {
      productId: product.id,
      quantity,
      product,
    };
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
  }, []);
  const removeItem = useCallback((productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    // Also remove from localStorage immediately
    const currentCart = storage.get('cart') || [];
    const filteredCart = currentCart.filter((item: any) => item.productId !== productId);
    storage.set('cart', filteredCart);
    // Notify Container of the change
    const eventBus = EventBus.getInstance();
    eventBus.emit('CART_ITEM_REMOVED', { productId, remainingItems: filteredCart });
  }, []);
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    // Also update localStorage immediately
    const currentCart = storage.get('cart') || [];
    const updatedCart = currentCart.map((item: any) =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ).filter((item: any) => item.quantity > 0);
    storage.set('cart', updatedCart);
    // Notify Container of the change
    const eventBus = EventBus.getInstance();
    eventBus.emit('CART_QUANTITY_UPDATED', { productId, quantity, updatedCart });
  }, []);
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    storage.remove('cart');
    // Notify Container of cart clear
    const eventBus = EventBus.getInstance();
    eventBus.emit('CART_CLEARED', {});
  }, []);
  const loadCart = useCallback(async () => {
    console.log('🔄 Cart: Loading cart from localStorage...');
    const savedCart = storage.get('cart') || [];
    console.log('🔄 Cart: Found saved cart:', savedCart.length, 'items');
    console.log('🔄 Cart: Saved cart data:', savedCart);
    
    // ALWAYS dispatch LOAD_CART - even for empty cart to set loading = false
    console.log('📤 Cart: Dispatching LOAD_CART with', savedCart.length, 'items');
    console.log('📤 Cart: About to dispatch - current loading state:', JSON.stringify(state.loading));
    console.log('📤 Cart: Dispatch action payload:', JSON.stringify(savedCart));
    dispatch({ type: 'LOAD_CART', payload: savedCart });
    console.log('📤 Cart: Dispatch completed - state should change now');
    
    if (savedCart.length > 0) {
      // Check if products already have details
      const itemsWithoutProducts = savedCart.filter((item: any) => !item.product);
      console.log('🔄 Cart: Items without product details:', itemsWithoutProducts.length);
      
      if (itemsWithoutProducts.length > 0) {
        console.log('🔄 Cart: Loading missing product details...');
        await loadProductDetails(savedCart);
      } else {
        console.log('🔄 Cart: All items have product details, no API calls needed');
      }
    } else {
      console.log('🔄 Cart: No saved items found - cart is empty');
    }
    
    console.log('🔄 Cart: Cart load complete!');
    
    // Mark as initialized to allow localStorage saves
    console.log('✅ Cart: Marking as initialized - localStorage saves now enabled');
    setIsInitialized(true);
  }, []); // Empty dependency - setIsInitialized is stable
  // Subscribe to events from other microfrontends - AGGRESSIVE FIX
  useEffect(() => {
    // Prevent multiple subscriptions
    if ((window as any).__CART_EVENT_HANDLER_SETUP__) {
      return;
    }
    (window as any).__CART_EVENT_HANDLER_SETUP__ = true;
    const handleAddToCart = (data: { product: Product; quantity: number }) => {
      console.log('🛒 Cart: Handling ADD_TO_CART_FORWARD:', data.product.title, 'qty:', data.quantity);
      
      // Check if Container has already saved to localStorage
      const currentStorage = storage.get('cart') || [];
      const existingInStorage = currentStorage.find((item: any) => item.productId === data.product.id);
      
      if (existingInStorage) {
        console.log('✅ Cart: Item already in localStorage with quantity:', existingInStorage.quantity);
        console.log('🚫 Cart: Skipping ADD_ITEM action - Container already handled this');
        
        // Just dispatch LOAD_CART to sync state with localStorage (no doubling)
        dispatch({ type: 'LOAD_CART', payload: currentStorage });
        return;
      }
      
      console.log('➕ Cart: New item - dispatching ADD_ITEM');
      const cartItem: CartItemWithProduct = {
        productId: data.product.id,
        quantity: data.quantity,
        product: data.product,
      };
      dispatch({ type: 'ADD_ITEM', payload: cartItem });
      
      // Don't manually save to localStorage - let the save useEffect handle it after initialization
      console.log('💾 Cart: Let save useEffect handle localStorage after initialization');
    };
    // Listen to forwarded events from container
    eventBus.on('ADD_TO_CART_FORWARD', handleAddToCart);
    // Process buffered events that occurred before Cart was ready
    const bufferedEvents = (window as any).__CART_EVENT_BUFFER__ || [];
    if (bufferedEvents.length > 0) {
      bufferedEvents.forEach((event: any) => {
        if (event.type === 'ADD_TO_CART_FORWARD') {
          handleAddToCart(event.data);
        }
      });
      // Clear processed events
      (window as any).__CART_EVENT_BUFFER__ = [];
    }
    return () => {
      eventBus.off('ADD_TO_CART_FORWARD', handleAddToCart);
      (window as any).__CART_EVENT_HANDLER_SETUP__ = false;
      (window as any).__CART_PROVIDER_ACTIVE__ = false;
    };
  }, []); // Empty dependency array - run ONLY once
  // Load cart on mount with delay to allow buffered events to process first
  useEffect(() => {
    // Delay loadCart to allow buffered events to process and save to localStorage first
    setTimeout(() => {
      const directStorageCheck = localStorage.getItem('cart');
      loadCart();
    }, 100); // Small delay to ensure buffered events are processed first
  }, [loadCart]);
  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
// Hook to use context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
