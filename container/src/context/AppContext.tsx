import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { storage } from '@microfrontend-ecommerce/shared';
import { User, Product, CartItem, EventBus } from '@microfrontend-ecommerce/shared';

// State interface
interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  cart: CartItem[];
  cartCount: number;
  products: { [key: number]: Product }; // Store products by ID for quick lookup
  loading: boolean;
  error: string | null;
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TO_CART'; payload: { productId: number; quantity: number; product: Product } }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }  // New action for initialization
  | { type: 'STORE_PRODUCT'; payload: Product };

// Initial state
const initialState: AppState = {
  isAuthenticated: false,
  user: null,
  cart: [],
  cartCount: 0,
  products: {},
  loading: false,
  error: null,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        cart: [],
        cartCount: 0,
      };
    
    case 'STORE_PRODUCT':
      return {
        ...state,
        products: {
          ...state.products,
          [action.payload.id]: action.payload,
        },
      };
    
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.productId === action.payload.productId);
      let newCart: CartItem[];
      
      if (existingItem) {
        newCart = state.cart.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newCart = [...state.cart, { productId: action.payload.productId, quantity: action.payload.quantity }];
      }
      
      return {
        ...state,
        cart: newCart,
        cartCount: newCart.reduce((total, item) => total + item.quantity, 0),
        products: {
          ...state.products,
          [action.payload.productId]: action.payload.product,
        },
      };
    
    case 'REMOVE_FROM_CART':
      const filteredCart = state.cart.filter(item => item.productId !== action.payload);
      return {
        ...state,
        cart: filteredCart,
        cartCount: filteredCart.reduce((total, item) => total + item.quantity, 0),
      };
    
    case 'UPDATE_QUANTITY':
      const updatedCart = state.cart.map(item =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      return {
        ...state,
        cart: updatedCart,
        cartCount: updatedCart.reduce((total, item) => total + item.quantity, 0),
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
        cartCount: 0,
      };
    
    case 'LOAD_CART':
      // Load cart from localStorage - REPLACE not ADD quantities
      const loadedProducts: Record<string, Product> = {};
      action.payload.forEach((item: any) => {
        if (item.product) {
          loadedProducts[item.productId] = item.product;
        }
      });
      
      return {
        ...state,
        cart: action.payload.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity // Use exact quantity from localStorage, don't add
        })),
        cartCount: action.payload.reduce((total: number, item: any) => total + item.quantity, 0),
        products: {
          ...state.products,
          ...loadedProducts
        }
      };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (user: User) => void;
  logout: () => void;
  addToCart: (productId: number, quantity: number, product?: Product) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const eventBus = EventBus.getInstance();

  // Initialize authentication state from localStorage
  React.useEffect(() => {
    // Check for stored authentication data (Auth microfrontend uses 'authUser' and 'authToken' keys)
    const storedUser = storage.get('authUser');
    const storedToken = storage.get('authToken');
    
    if (storedUser && storedToken) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: storedUser });
    }
    
    // Load cart data - Use LOAD_CART to REPLACE quantities, not ADD
    const storedCart = storage.get('cart');
    if (storedCart && Array.isArray(storedCart) && storedCart.length > 0) {
      console.log('🔄 Container: Loading cart from localStorage:', storedCart.length, 'items');
      console.log('🔄 Container: Cart data:', storedCart);
      
      // Use LOAD_CART action to restore exact quantities from localStorage
      dispatch({ type: 'LOAD_CART', payload: storedCart });
      
      console.log('✅ Container: Cart loaded with exact quantities (no doubling)');
    } else {
      console.log('🔄 Container: No saved cart found or empty cart');
    }
  }, []); // Run once on mount

  // Action creators
  const login = (user: User) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    
    // Emit login event to other microfrontends
    eventBus.emit('USER_LOGIN', { user, token: 'dummy-token' });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    
    // Clear Auth microfrontend's localStorage data
    storage.remove('authToken');
    storage.remove('authUser');
    
    // Clear cart data as well on logout
    storage.remove('cart');
    
    // Emit logout event to other microfrontends
    eventBus.emit('USER_LOGOUT');
    
    // Redirect to home page after logout (same as Auth microfrontend behavior)
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }, 100);
  };

  const addToCart = (productId: number, quantity: number, product?: Product) => {
    if (product) {
      dispatch({ type: 'ADD_TO_CART', payload: { productId, quantity, product } });
      
      // CRITICAL: Also save to localStorage immediately for persistence
      const currentCart = storage.get('cart') || [];
      const existingIndex = currentCart.findIndex((item: any) => item.productId === productId);
      
      let newCart;
      if (existingIndex >= 0) {
        newCart = currentCart.map((item: any, index: number) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...currentCart, { productId, quantity, product }];
      }
      
      storage.set('cart', newCart);
      
    } else {
      // If product not provided, try to get from stored products
      const storedProduct = state.products[productId];
      if (storedProduct) {
        dispatch({ type: 'ADD_TO_CART', payload: { productId, quantity, product: storedProduct } });
      }
    }
  };

  const removeFromCart = (productId: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    
    // Also remove from localStorage
    const currentCart = storage.get('cart') || [];
    const filteredCart = currentCart.filter((item: any) => item.productId !== productId);
    storage.set('cart', filteredCart);
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    
    // Also update localStorage
    const currentCart = storage.get('cart') || [];
    const updatedCart = currentCart.map((item: any) =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ).filter((item: any) => item.quantity > 0);
    
    storage.set('cart', updatedCart);
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    storage.remove('cart');
  };

  // Subscribe to microfrontend events  
  React.useEffect(() => {
    // Check for buffered events
    const bufferedEvents = (window as any).__CART_EVENT_BUFFER__ || [];
    
    const handleAddToCart = (data: { product: Product; quantity: number }) => {
      // Store product details and add to container cart
      addToCart(data.product.id, data.quantity, data.product);
      
      // Debug EventBus before emitting
      if (typeof eventBus.listeners === 'function') {
        const listeners = eventBus.listeners('ADD_TO_CART_FORWARD');
        if (listeners.length === 0) {
          // Store event for later when Cart loads
          const bufferedEvents = (window as any).__CART_EVENT_BUFFER__ || [];
          bufferedEvents.push({ type: 'ADD_TO_CART_FORWARD', data, timestamp: Date.now() });
          (window as any).__CART_EVENT_BUFFER__ = bufferedEvents;
        } else {
          eventBus.emit('ADD_TO_CART_FORWARD', data);
        }
      } else {
        // Fallback - buffer the event
        const bufferedEvents = (window as any).__CART_EVENT_BUFFER__ || [];
        bufferedEvents.push({ type: 'ADD_TO_CART_FORWARD', data, timestamp: Date.now() });
        (window as any).__CART_EVENT_BUFFER__ = bufferedEvents;
      }
    };

    const handleUserLogin = (data: { user: User; token: string }) => {
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
    };

    // Note: Removed handleUserLogout to prevent loops - Container initiates logout via Header button

    const handleCartItemRemoved = (data: { productId: number; remainingItems: any[] }) => {
      removeFromCart(data.productId);
    };

    const handleCartQuantityUpdated = (data: { productId: number; quantity: number; updatedCart: any[] }) => {
      updateCartQuantity(data.productId, data.quantity);
    };

    const handleCartCleared = () => {
      clearCart();
    };

    // Subscribe to all events
    eventBus.on('ADD_TO_CART', handleAddToCart);
    eventBus.on('USER_LOGIN', handleUserLogin);
    // Note: Not listening to USER_LOGOUT to prevent loops - Container initiates logout
    eventBus.on('CART_ITEM_REMOVED', handleCartItemRemoved);
    eventBus.on('CART_QUANTITY_UPDATED', handleCartQuantityUpdated);
    eventBus.on('CART_CLEARED', handleCartCleared);

    return () => {
      eventBus.off('ADD_TO_CART', handleAddToCart);
      eventBus.off('USER_LOGIN', handleUserLogin);
      // Note: No USER_LOGOUT cleanup needed since we don't listen to it
      eventBus.off('CART_ITEM_REMOVED', handleCartItemRemoved);
      eventBus.off('CART_QUANTITY_UPDATED', handleCartQuantityUpdated);
      eventBus.off('CART_CLEARED', handleCartCleared);
    };
  }, []); // FIXED: Empty dependency array to prevent useEffect infinite loops

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook to use context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
