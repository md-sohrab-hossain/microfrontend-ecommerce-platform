import { useEffect, useState, useCallback } from "react";
import {
  GlobalStore,
  GlobalState,
  GlobalAction,
  globalStore,
} from "@microfrontend-ecommerce/shared";
import { Product, User, CartItem } from "@microfrontend-ecommerce/shared";
import { safeLogout, safeEventBusEmit } from "../utils/safeLogout";

/**
 * React hook to use RxJS global store in Container app
 */
export const useGlobalStore = () => {
  const [state, setState] = useState<GlobalState>(globalStore.getState());

  useEffect(() => {
    const unsubscribe = globalStore.subscribe(setState);
    return unsubscribe;
  }, []);

  const dispatch = useCallback((action: GlobalAction) => {
    globalStore.dispatch(action);
  }, []);

  return { state, dispatch };
};

/**
 * Hook to select specific slice of global state
 */
export const useGlobalSelector = <K extends keyof GlobalState>(
  key: K
): GlobalState[K] => {
  const [value, setValue] = useState<GlobalState[K]>(
    globalStore.getState()[key]
  );

  useEffect(() => {
    const subscription = globalStore.select(key).subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [key]);

  return value;
};

/**
 * Container-specific cart hook with enhanced functionality
 */
export const useCart = () => {
  const cart = useGlobalSelector("cart");
  const products = useGlobalSelector("products");
  const loading = useGlobalSelector("loading");
  const error = useGlobalSelector("error");

  // Get cart with full product details
  const cartWithProducts = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  // Calculate cart count and total
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartWithProducts.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const addToCart = useCallback(
    (productId: number, quantity: number, product: Product) => {
      // Store product info first if not already stored
      if (!products.find((p) => p.id === productId)) {
        globalStore.setProducts([...products, product]);
      }

      // Then add to cart
      globalStore.addToCart(product, quantity);
    },
    [products]
  );

  const removeFromCart = useCallback((productId: number) => {
    globalStore.removeFromCart(productId);
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    globalStore.updateCartQuantity(productId, quantity);
  }, []);

  const clearCart = useCallback(() => {
    globalStore.clearCart();
  }, []);

  return {
    cart: cartWithProducts,
    cartCount,
    total,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};

/**
 * Container-specific auth hook
 */
export const useAuth = () => {
  const user = useGlobalSelector("user");
  const loading = useGlobalSelector("loading");
  const error = useGlobalSelector("error");

  const login = useCallback((user: User) => {
    globalStore.setUser(user);
  }, []);

  // Internal logout - doesn't emit events (used by AuthBridge)
  const internalLogout = useCallback(async (skipRedirect = false) => {
    try {
      // Update RxJS global store
      globalStore.setUser(null);
      globalStore.clearCart();

      if (!skipRedirect) {
        // Use safe redirect method
        setTimeout(async () => {
          await safeLogout();
        }, 100);
      }
    } catch (error) {
      globalStore.setUser(null);
      globalStore.clearCart();

      if (!skipRedirect) {
        await safeLogout();
      }
    }
  }, []);

  // User-initiated logout - emits events to notify Auth app
  const logout = useCallback(async () => {
    try {
      // Perform internal logout first
      await internalLogout(true); // Skip redirect initially

      // Safely emit EventBus event to notify Auth app
      await safeEventBusEmit("USER_LOGOUT");

      // Now redirect
      setTimeout(async () => {
        await safeLogout();
      }, 200);
    } catch (error) {
      // Fallback to internal logout
      await internalLogout();
    }
  }, [internalLogout]);

  return {
    isAuthenticated: !!user,
    user,
    loading,
    error,
    login,
    logout,
    internalLogout, // For AuthBridge to use
  };
};

/**
 * Container-specific products hook
 */
export const useProducts = () => {
  const products = useGlobalSelector("products");
  const loading = useGlobalSelector("loading");
  const error = useGlobalSelector("error");

  const storeProduct = useCallback((product: Product) => {
    const existingProducts = globalStore.getState().products;
    if (!existingProducts.find((p) => p.id === product.id)) {
      globalStore.setProducts([...existingProducts, product]);
    }
  }, []);

  const setProducts = useCallback((products: Product[]) => {
    globalStore.setProducts(products);
  }, []);

  const getProduct = useCallback(
    (id: number): Product | undefined => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  return {
    products,
    loading,
    error,
    storeProduct,
    setProducts,
    getProduct,
  };
};
