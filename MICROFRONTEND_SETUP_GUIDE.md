# 🏗️ Microfrontend Setup Guide - Step by Step

আপনি নিজে থেকে একটা complete microfrontend application বানাতে চান? এই guide follow করুন!

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Shared Library Setup](#shared-library-setup)
4. [Container App Setup](#container-app-setup)
5. [Products Microfrontend (Vue.js)](#products-microfrontend-vuejs)
6. [Cart Microfrontend (React)](#cart-microfrontend-react)
7. [Auth Microfrontend (React)](#auth-microfrontend-react)
8. [Module Federation Configuration](#module-federation-configuration)
9. [RxJS Global Store Implementation](#rxjs-global-store-implementation)
10. [Communication Setup](#communication-setup)
11. [Testing & Deployment](#testing--deployment)

---

## 🛠️ Prerequisites

### Required Software:

```bash
# Node.js (Version 16+)
node --version  # Should be 16.0.0+

# NPM or Yarn
npm --version   # Should be 8.0.0+

# Git
git --version
```

### Knowledge Requirements:
- ✅ Basic JavaScript/TypeScript
- ✅ React fundamentals 
- ✅ Vue.js basics (for Products app)
- ✅ Webpack basics
- ✅ npm/package.json understanding

---

## 📁 Project Structure

### 1. Create Root Directory:

```bash
mkdir my-microfrontend-app
cd my-microfrontend-app

# Initialize root package.json
npm init -y
```

### 2. Create Folder Structure:

```bash
mkdir container products cart auth shared
mkdir docs scripts configs

# Your structure should look like:
my-microfrontend-app/
├── container/        # Host application (React)
├── products/         # Products app (Vue.js)  
├── cart/            # Cart app (React)
├── auth/            # Auth app (React)
├── shared/          # Shared utilities
├── docs/            # Documentation
├── scripts/         # Build scripts
└── configs/         # Global configs
```

---

## 📚 Shared Library Setup

### 1. Initialize Shared Library:

```bash
cd shared
npm init -y
```

### 2. Install Dependencies:

```bash
npm install rxjs typescript

# Dev dependencies
npm install --save-dev @types/node webpack webpack-cli ts-loader typescript
```

### 3. Create package.json:

```json
{
  "name": "@my-app/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "webpack --mode=production",
    "build:dev": "webpack --mode=development",
    "build:watch": "webpack --mode=development --watch"
  },
  "dependencies": {
    "rxjs": "^7.8.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "vue": "^3.0.0"
  }
}
```

### 4. TypeScript Configuration (tsconfig.json):

```json
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["es2020", "dom"],
    "module": "esnext",
    "moduleResolution": "node",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 5. Webpack Configuration (webpack.config.js):

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'SharedLib',
      type: 'umd',
    },
    globalObject: 'this',
  },
  externals: {
    'react': 'React',
    'vue': 'Vue',
  },
};
```

### 6. Create Core Files:

**src/types/index.ts:**
```typescript
export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
  address: {
    city: string;
    street: string;
    number: number;
    zipcode: string;
    geolocation: {
      lat: string;
      long: string;
    };
  };
  phone: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface GlobalState {
  user: User | null;
  cart: CartItem[];
  products: Product[];
  loading: boolean;
  error: string | null;
}
```

**src/utils/EventBus.ts:**
```typescript
export class EventBus {
  private static instance: EventBus;
  private events: { [key: string]: Function[] } = {};

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event: string, callback: Function): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}
```

**src/utils/storage.ts:**
```typescript
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error);
      return null;
    }
  },

  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error);
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error);
    }
  }
};
```

**src/store/GlobalStore.ts:**
```typescript
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { GlobalState, User, Product, CartItem } from '../types';
import { storage } from '../utils/storage';

export type GlobalAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: GlobalState = {
  user: null,
  cart: [],
  products: [],
  loading: false,
  error: null,
};

class GlobalStore {
  private static instance: GlobalStore;
  private state$ = new BehaviorSubject<GlobalState>(initialState);

  private constructor() {
    this.loadFromStorage();
    this.setupStoragePersistence();
  }

  static getInstance(): GlobalStore {
    if (!GlobalStore.instance) {
      GlobalStore.instance = new GlobalStore();
    }
    return GlobalStore.instance;
  }

  // Get current state
  getState(): GlobalState {
    return this.state$.value;
  }

  // Subscribe to state changes
  subscribe(callback: (state: GlobalState) => void): () => void {
    const subscription = this.state$.subscribe(callback);
    return () => subscription.unsubscribe();
  }

  // Select specific part of state
  select<K extends keyof GlobalState>(key: K): Observable<GlobalState[K]> {
    return this.state$.pipe(
      map(state => state[key]),
      distinctUntilChanged()
    );
  }

  // Dispatch actions
  dispatch(action: GlobalAction): void {
    const currentState = this.state$.value;
    const newState = this.reducer(currentState, action);
    this.state$.next(newState);
  }

  private reducer(state: GlobalState, action: GlobalAction): GlobalState {
    switch (action.type) {
      case 'SET_USER':
        return { ...state, user: action.payload };
      
      case 'SET_PRODUCTS':
        return { ...state, products: action.payload };
      
      case 'ADD_TO_CART':
        const existingItem = state.cart.find(item => item.productId === action.payload.product.id);
        if (existingItem) {
          return {
            ...state,
            cart: state.cart.map(item =>
              item.productId === action.payload.product.id
                ? { ...item, quantity: item.quantity + action.payload.quantity }
                : item
            )
          };
        } else {
          return {
            ...state,
            cart: [...state.cart, { productId: action.payload.product.id, quantity: action.payload.quantity }]
          };
        }
      
      case 'REMOVE_FROM_CART':
        return {
          ...state,
          cart: state.cart.filter(item => item.productId !== action.payload)
        };
      
      case 'UPDATE_CART_QUANTITY':
        return {
          ...state,
          cart: state.cart.map(item =>
            item.productId === action.payload.productId
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
        };
      
      case 'CLEAR_CART':
        return { ...state, cart: [] };
      
      case 'SET_LOADING':
        return { ...state, loading: action.payload };
      
      case 'SET_ERROR':
        return { ...state, error: action.payload };
      
      default:
        return state;
    }
  }

  // Convenience methods
  setUser(user: User | null): void {
    this.dispatch({ type: 'SET_USER', payload: user });
  }

  setProducts(products: Product[]): void {
    this.dispatch({ type: 'SET_PRODUCTS', payload: products });
  }

  addToCart(product: Product, quantity: number): void {
    this.dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
  }

  removeFromCart(productId: number): void {
    this.dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  }

  updateCartQuantity(productId: number, quantity: number): void {
    this.dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity } });
  }

  clearCart(): void {
    this.dispatch({ type: 'CLEAR_CART' });
  }

  private loadFromStorage(): void {
    try {
      const user = storage.get('user') || storage.get('authUser');
      const cart = storage.get('cart');
      
      if (user) this.setUser(user);
      if (cart) this.dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }

  private setupStoragePersistence(): void {
    this.select('user').subscribe(user => {
      if (user) {
        storage.set('user', user);
        storage.set('authUser', user); // Legacy compatibility
      } else {
        storage.remove('user');
        storage.remove('authUser');
      }
    });

    this.select('cart').subscribe(cart => {
      storage.set('cart', cart);
    });
  }
}

export const globalStore = GlobalStore.getInstance();
export { GlobalStore };
```

**src/index.ts:**
```typescript
// Types
export * from './types';

// Store
export { GlobalStore, globalStore } from './store/GlobalStore';
export type { GlobalAction } from './store/GlobalStore';

// Utils
export { EventBus } from './utils/EventBus';
export { storage } from './utils/storage';
```

---

## 🏠 Container App Setup

### 1. Initialize Container:

```bash
cd ../container
npm init -y
```

### 2. Install Dependencies:

```bash
# React dependencies
npm install react react-dom react-router-dom

# Development dependencies
npm install --save-dev @types/react @types/react-dom typescript webpack webpack-cli webpack-dev-server html-webpack-plugin ts-loader css-loader style-loader

# Local shared library
npm install ../shared
```

### 3. Create package.json:

```json
{
  "name": "container",
  "version": "1.0.0",
  "scripts": {
    "start": "webpack serve --mode=development",
    "build": "webpack --mode=production",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@my-app/shared": "file:../shared"
  }
}
```

### 4. Webpack Configuration (webpack.config.js):

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  devServer: {
    port: 4000,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'container',
      remotes: {
        products: 'products@http://localhost:4001/remoteEntry.js',
        cart: 'cart@http://localhost:4002/remoteEntry.js',
        auth: 'auth@http://localhost:4003/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-router-dom': { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
```

### 5. Create Core Files:

**public/index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Microfrontend E-commerce</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

**src/App.tsx:**
```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';

// Lazy load microfrontends
const ProductsApp = React.lazy(() => import('products/App'));
const CartApp = React.lazy(() => import('cart/App'));
const AuthApp = React.lazy(() => import('auth/App'));

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products/*" element={<ProductsApp />} />
                <Route path="/cart" element={<CartApp />} />
                <Route path="/auth/*" element={<AuthApp />} />
              </Routes>
            </React.Suspense>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
```

**src/contexts/AppContext.tsx:**
```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { globalStore, GlobalState, User } from '@my-app/shared';

interface AppContextType {
  user: User | null;
  cartCount: number;
  isAuthenticated: boolean;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalState>(globalStore.getState());

  useEffect(() => {
    const unsubscribe = globalStore.subscribe(setState);
    return unsubscribe;
  }, []);

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  const value: AppContextType = {
    user: state.user,
    cartCount,
    isAuthenticated: !!state.user,
    loading: state.loading,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
```

**src/components/Header.tsx:**
```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const Header: React.FC = () => {
  const { user, cartCount, isAuthenticated } = useApp();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              🛒 E-commerce
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link 
              to="/products" 
              className="text-gray-600 hover:text-gray-900"
            >
              Products
            </Link>
            
            <Link 
              to="/cart" 
              className="relative text-gray-600 hover:text-gray-900"
            >
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  👤 {user?.name?.firstname}
                </span>
                <button className="text-red-600 hover:text-red-800">
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

**src/index.tsx:**
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 🛍️ Products Microfrontend (Vue.js)

### 1. Initialize Products App:

```bash
cd ../products
npm init -y
```

### 2. Install Dependencies:

```bash
# Vue dependencies
npm install vue@^3.2.0 vue-router@^4.0.0

# Development dependencies  
npm install --save-dev @vitejs/plugin-vue typescript webpack webpack-cli webpack-dev-server html-webpack-plugin vue-loader vue-template-compiler ts-loader css-loader style-loader

# Shared library
npm install ../shared
```

### 3. Webpack Configuration (webpack.config.js):

```javascript
const ModuleFederationPlugin = require('@module-federation/webpack');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: {
    port: 4001,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.vue', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new ModuleFederationPlugin({
      name: 'products',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.vue',
      },
      shared: {
        vue: { singleton: true },
      },
    }),
  ],
};
```

### 4. Create Vue App:

**src/App.vue:**
```vue
<template>
  <div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { useGlobalStore } from './composables/useRxJSStore';

// Provide global store to all child components
const { state } = useGlobalStore();
provide('globalStore', state);
</script>
```

**src/composables/useRxJSStore.ts:**
```typescript
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { globalStore, GlobalState, Product } from '@my-app/shared';

export const useGlobalStore = () => {
  const state = ref<GlobalState>(globalStore.getState());

  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    unsubscribe = globalStore.subscribe((newState) => {
      state.value = newState;
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  return {
    state: computed(() => state.value),
  };
};

export const useCart = () => {
  const { state } = useGlobalStore();
  
  const cart = computed(() => state.value.cart);
  
  const addToCart = (product: Product, quantity: number = 1) => {
    globalStore.addToCart(product, quantity);
  };

  const removeFromCart = (productId: number) => {
    globalStore.removeFromCart(productId);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    globalStore.updateCartQuantity(productId, quantity);
  };

  const isInCart = (productId: number) => {
    return computed(() => cart.value.some(item => item.productId === productId));
  };

  const getProductQuantity = (productId: number) => {
    return computed(() => {
      const item = cart.value.find(item => item.productId === productId);
      return item ? item.quantity : 0;
    });
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    isInCart,
    getProductQuantity,
  };
};
```

---

## 🛒 Cart Microfrontend (React)

### 1. Initialize Cart App:

```bash
cd ../cart
npm init -y
```

### 2. Install Dependencies:

```bash
npm install react react-dom
npm install --save-dev @types/react @types/react-dom typescript webpack webpack-cli webpack-dev-server ts-loader css-loader style-loader
npm install ../shared
```

### 3. Webpack Configuration:

```javascript
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  devServer: {
    port: 4002,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'cart',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

### 4. Create React Components:

**src/App.tsx:**
```tsx
import React from 'react';
import { CartProvider } from './contexts/CartContext';
import CartPage from './pages/CartPage';

const App: React.FC = () => {
  return (
    <CartProvider>
      <CartPage />
    </CartProvider>
  );
};

export default App;
```

**src/contexts/CartContext.tsx:**
```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { globalStore, GlobalState, Product } from '@my-app/shared';

interface CartContextType {
  cart: Array<{ productId: number; quantity: number; product?: Product }>;
  total: number;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalState>(globalStore.getState());

  useEffect(() => {
    const unsubscribe = globalStore.subscribe(setState);
    return unsubscribe;
  }, []);

  const cartWithProducts = state.cart.map(item => {
    const product = state.products.find(p => p.id === item.productId);
    return { ...item, product };
  });

  const total = cartWithProducts.reduce((sum, item) => {
    return sum + ((item.product?.price || 0) * item.quantity);
  }, 0);

  const removeFromCart = (productId: number) => {
    globalStore.removeFromCart(productId);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    globalStore.updateCartQuantity(productId, quantity);
  };

  const clearCart = () => {
    globalStore.clearCart();
  };

  return (
    <CartContext.Provider value={{
      cart: cartWithProducts,
      total,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
```

---

## 🔧 Module Federation Configuration

### Key Concepts:

1. **Host Application (Container):**
   - Consumes other microfrontends
   - Provides routing and layout
   - Manages global state

2. **Remote Applications (Products, Cart, Auth):**
   - Expose components/apps
   - Can be developed independently
   - Have their own webpack dev server

3. **Shared Dependencies:**
   - Prevent duplicate libraries
   - Ensure version compatibility
   - Optimize bundle size

### Configuration Best Practices:

```javascript
// Host Configuration
new ModuleFederationPlugin({
  name: 'container',
  remotes: {
    products: 'products@http://localhost:4001/remoteEntry.js',
    cart: 'cart@http://localhost:4002/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
  },
});

// Remote Configuration
new ModuleFederationPlugin({
  name: 'products',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App.vue',
    './ProductCard': './src/components/ProductCard.vue',
  },
  shared: {
    vue: { singleton: true, requiredVersion: '^3.2.0' },
  },
});
```

---

## 📡 Communication Setup

### 1. RxJS Store Integration:

```typescript
// In each microfrontend
import { globalStore } from '@my-app/shared';

// React Hook
export const useGlobalStore = () => {
  const [state, setState] = useState(globalStore.getState());
  
  useEffect(() => {
    const unsubscribe = globalStore.subscribe(setState);
    return unsubscribe;
  }, []);
  
  return state;
};

// Vue Composable  
export const useGlobalStore = () => {
  const state = ref(globalStore.getState());
  
  onMounted(() => {
    globalStore.subscribe((newState) => {
      state.value = newState;
    });
  });
  
  return { state };
};
```

### 2. EventBus for Legacy Support:

```typescript
import { EventBus } from '@my-app/shared';

const eventBus = EventBus.getInstance();

// Emit events
eventBus.emit('USER_LOGIN', { user });
eventBus.emit('CART_UPDATE', { cart });

// Listen to events
eventBus.on('USER_LOGOUT', () => {
  // Handle logout
});
```

---

## 🧪 Testing & Deployment

### 1. Development Testing:

```bash
# Terminal 1 - Shared
cd shared && npm run build:watch

# Terminal 2 - Container  
cd container && npm start

# Terminal 3 - Products
cd products && npm start

# Terminal 4 - Cart
cd cart && npm start
```

### 2. Production Build:

```bash
# Build all apps
npm run build:all

# Or individually
cd shared && npm run build
cd container && npm run build  
cd products && npm run build
cd cart && npm run build
```

### 3. Deployment Strategies:

**Option 1: Same Domain**
```
https://myapp.com/          (Container)
https://myapp.com/products  (Products MF)
https://myapp.com/cart      (Cart MF)
```

**Option 2: Separate Domains**
```  
https://app.mycompany.com/       (Container)
https://products.mycompany.com/  (Products MF)  
https://cart.mycompany.com/      (Cart MF)
```

---

## 📝 Script Automation

### Create Root Scripts:

**package.json (Root):**
```json
{
  "scripts": {
    "install:all": "npm install && npm run install:apps",
    "install:apps": "cd shared && npm install && cd ../container && npm install && cd ../products && npm install && cd ../cart && npm install",
    "build:shared": "cd shared && npm run build",
    "start:all": "concurrently \"npm run start:shared\" \"npm run start:container\" \"npm run start:products\" \"npm run start:cart\"",
    "start:shared": "cd shared && npm run build:watch",
    "start:container": "cd container && npm start",
    "start:products": "cd products && npm start", 
    "start:cart": "cd cart && npm start"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

---

## 🎯 Success Checklist

✅ **Project Structure Created**  
✅ **Shared Library Setup**  
✅ **Container App Running (Port 4000)**  
✅ **Products App Running (Port 4001)**  
✅ **Cart App Running (Port 4002)**  
✅ **Module Federation Working**  
✅ **RxJS Global Store Implemented**  
✅ **Cross-App Communication Working**  
✅ **State Persistence Working**  

---

## 🚀 Next Steps

### Advanced Features:

1. **Add Testing:**
   ```bash
   npm install --save-dev jest @testing-library/react
   ```

2. **Add Styling System:**
   ```bash
   npm install tailwindcss postcss autoprefixer
   ```

3. **Add Error Boundaries:**
   ```tsx
   class MicrofrontendErrorBoundary extends React.Component {
     // Error handling for microfrontends
   }
   ```

4. **Add Performance Monitoring:**
   ```typescript
   // Monitor microfrontend loading times
   performance.mark('mf-start');
   // Load microfrontend
   performance.mark('mf-end');
   ```

5. **Add CI/CD Pipeline:**
   ```yaml
   # .github/workflows/deploy.yml
   - name: Build and Deploy
     run: |
       npm run build:all
       # Deploy to S3/CDN
   ```

---

## 🎓 Learning Resources

### Documentation:
- [Module Federation Docs](https://webpack.js.org/concepts/module-federation/)
- [RxJS Guide](https://rxjs.dev/)
- [React 18 Features](https://reactjs.org/blog/2022/03/29/react-v18.html)
- [Vue 3 Composition API](https://vuejs.org/guide/composition-api-introduction.html)

### Best Practices:
- Keep microfrontends small and focused
- Share state, not components
- Handle errors gracefully  
- Monitor performance
- Test integration points

---

## 💡 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   ```javascript
   headers: {
     'Access-Control-Allow-Origin': '*',
   }
   ```

2. **Module Not Found:**
   ```bash
   cd shared && npm run build
   ```

3. **Version Conflicts:**
   ```javascript
   shared: {
     react: { singleton: true, strictVersion: true }
   }
   ```

4. **Hot Reload Issues:**
   ```bash
   # Restart dev servers
   ```

---

## 🏆 Congratulations!

আপনি এখন একটা complete microfrontend application বানাতে পারেন! 🎉

এই setup দিয়ে আপনি:
- ✅ Multiple frameworks একসাথে use করতে পারবেন
- ✅ Independent deployment করতে পারবেন  
- ✅ Team অনুযায়ী কাজ ভাগ করতে পারবেন
- ✅ Scalable architecture তৈরি করতে পারবেন

**Happy Coding!** 🚀✨
