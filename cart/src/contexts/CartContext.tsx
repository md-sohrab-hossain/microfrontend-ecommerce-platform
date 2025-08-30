import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
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

// Initial state
const initialState: CartState = {
  items: [],
  loading: false,
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
      
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
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
      
      return {
        ...state,
        items: action.payload,
        total,
        itemCount,
      };
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
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const eventBus = EventBus.getInstance();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    storage.set('cart', state.items);
  }, [state.items]);

  // Load product details for cart items
  const loadProductDetails = async (items: CartItemWithProduct[]) => {
    const itemsWithoutProducts = items.filter(item => !item.product);
    
    if (itemsWithoutProducts.length === 0) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const productPromises = itemsWithoutProducts.map(item =>
        productsApi.getProduct(item.productId)
      );
      
      const products = await Promise.all(productPromises);
      
      products.forEach((product, index) => {
        const item = itemsWithoutProducts[index];
        dispatch({
          type: 'UPDATE_PRODUCT_DETAILS',
          payload: { productId: item.productId, product },
        });
      });
    } catch (error) {
      console.error('Failed to load product details:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load product details' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Action creators
  const addItem = (product: Product, quantity: number) => {
    console.log('🔄 Cart Context: Adding item to cart:', product.title, 'quantity:', quantity);
    
    const cartItem: CartItemWithProduct = {
      productId: product.id,
      quantity,
      product,
    };
    
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
    console.log('📊 Cart Context: Item added, cart will be updated');
  };

  const removeItem = (productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    storage.remove('cart');
  };

  const loadCart = async () => {
    const savedCart = storage.get('cart') || [];
    dispatch({ type: 'LOAD_CART', payload: savedCart });
    
    if (savedCart.length > 0) {
      await loadProductDetails(savedCart);
    }
  };

  // Subscribe to events from other microfrontends
  useEffect(() => {
    console.log('🔧 Cart: Setting up event listeners...');
    console.log('🚌 Cart: EventBus instance:', eventBus);
    
    const handleAddToCart = (data: { product: Product; quantity: number }) => {
      console.log('🛍️ Cart: Received ADD_TO_CART_FORWARD event:', data.product.title);
      console.log('📦 Cart: Event data:', data);
      console.log('🔢 Cart: Current item count before add:', state.itemCount);
      
      addItem(data.product, data.quantity);
      console.log('✨ Cart: Product added to cart successfully!');
      console.log('🏪 Cart: New item count:', state.itemCount + data.quantity);
      console.log('📝 Cart: Current cart items:', state.items.length);
    };

    // Listen to forwarded events from container
    console.log('👂 Cart: Listening for ADD_TO_CART_FORWARD events...');
    eventBus.on('ADD_TO_CART_FORWARD', handleAddToCart);

    return () => {
      eventBus.off('ADD_TO_CART_FORWARD', handleAddToCart);
    };
  }, [eventBus]);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

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
