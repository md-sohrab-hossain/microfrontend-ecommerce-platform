import React, { createContext, useContext, useReducer, ReactNode } from 'react';
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
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
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
    
    case 'UPDATE_CART_QUANTITY':
      const updatedCart = state.cart.map(item =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
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
  addToCart: (productId: number, quantity: number) => void;
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

  // Action creators
  const login = (user: User) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    // Emit login event to other microfrontends
    eventBus.emit('USER_LOGIN', { user, token: 'dummy-token' });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    // Emit logout event to other microfrontends
    eventBus.emit('USER_LOGOUT');
  };

  const addToCart = (productId: number, quantity: number, product?: Product) => {
    if (product) {
      dispatch({ type: 'ADD_TO_CART', payload: { productId, quantity, product } });
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
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Subscribe to microfrontend events
  React.useEffect(() => {
    console.log('🔧 Container: Setting up event listeners...');
    console.log('🚌 Container: EventBus instance:', eventBus);
    
    const handleAddToCart = (data: { product: Product; quantity: number }) => {
      console.log('🎯 Container: Received ADD_TO_CART event:', data.product.title);
      console.log('📦 Container: Event data:', data);
      console.log('🔢 Container: Current cart count before add:', state.cartCount);
      
      // Store product details and add to container cart
      addToCart(data.product.id, data.quantity, data.product);
      console.log('💾 Container: Added to local cart, new cart count:', state.cartCount + data.quantity);
      console.log('🏪 Container: Current state after add:', { 
        cartCount: state.cartCount, 
        cartItems: state.cart.length 
      });
      
      // Forward to cart microfrontend with full product details
      console.log('📤 Container: Forwarding to Cart microfrontend...');
      eventBus.emit('ADD_TO_CART_FORWARD', data);
      console.log('✅ Container: ADD_TO_CART_FORWARD event emitted successfully');
    };

    const handleUserLogin = (data: { user: User; token: string }) => {
      console.log('Container received login event:', data);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
    };

    const handleUserLogout = () => {
      console.log('Container received logout event');
      dispatch({ type: 'LOGOUT' });
    };

    // Subscribe to all events
    eventBus.on('ADD_TO_CART', handleAddToCart);
    eventBus.on('USER_LOGIN', handleUserLogin);
    eventBus.on('USER_LOGOUT', handleUserLogout);

    return () => {
      eventBus.off('ADD_TO_CART', handleAddToCart);
      eventBus.off('USER_LOGIN', handleUserLogin);
      eventBus.off('USER_LOGOUT', handleUserLogout);
    };
  }, [eventBus]);

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
