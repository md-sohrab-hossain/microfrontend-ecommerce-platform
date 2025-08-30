import React, { useEffect, useRef } from 'react';
import { createApp } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import App from './App.vue';
import ProductList from './components/ProductList.vue';
import ProductDetail from './components/ProductDetail.vue';
import './style.css';

// Module Federation type declaration
declare global {
  interface Window {
    __POWERED_BY_MODULE_FEDERATION__?: boolean;
  }
}

const routes = [
  { 
    path: '/', 
    component: ProductList,
    name: 'ProductList'
  },
  { 
    path: '/products', 
    component: ProductList,
    name: 'ProductsPage'
  },
  { 
    path: '/product/:id', 
    component: ProductDetail, 
    props: true,
    name: 'ProductDetail'
  },
  { 
    path: '/category/:category', 
    component: ProductList, 
    props: true,
    name: 'CategoryProducts'
  },
];

// Route and component validation (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('🗺️ ReactWrapper: Routes defined:', routes.map(r => ({ path: r.path, name: r.name })));
}

const ReactWrapper: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    if (ref.current && !appRef.current) {
      // Create router with memory history to isolate from browser URL
      const router = createRouter({
        history: createMemoryHistory(), // Use memory history to prevent browser URL conflicts
        routes,
      });
      
      console.log('🛤️ ReactWrapper: Using memory history to prevent URL conflicts');
      
      console.log('🛤️ ReactWrapper: Router created with routes:', router.getRoutes().map(r => ({ path: r.path, name: r.name })));

      const pinia = createPinia();
      
      console.log('📦 ReactWrapper: Creating Vue app instance...');
      appRef.current = createApp(App);
      
      console.log('🛤️ ReactWrapper: Adding router to Vue app...');
      console.log('  Router initial route:', router.currentRoute.value.path);
      appRef.current.use(router);
      
      // Provide router for injection
      appRef.current.provide('router', router);
      console.log('✅ ReactWrapper: Router provided for injection');
      
      console.log('🏪 ReactWrapper: Adding pinia to Vue app...');
      appRef.current.use(pinia);
      appRef.current.provide('pinia', pinia);
      
      console.log('🎯 ReactWrapper: Mounting Vue app to DOM element...');
      appRef.current.mount(ref.current);
      console.log('✅ ReactWrapper: Vue app mounted successfully!');
      console.log('🔍 ReactWrapper: Router current route after mount:', router.currentRoute.value.path);

      // Sync with container URL
      const syncUrl = () => {
        const currentPath = window.location.pathname;
        console.log('syncUrl called, currentPath:', currentPath);
        
        // Safety check: Make sure router is available and ready
        if (!router) {
          console.error('❌ ReactWrapper: Router not available');
          return;
        }
        
        // Log router state for debugging
        console.log('🔍 ReactWrapper: Router check passed');
        console.log('  Router available:', !!router);
        console.log('  Current route available:', !!router.currentRoute);
        console.log('  Push method available:', !!router.push);
        
        if (currentPath === '/products' || currentPath === '/products/') {
          console.log('🏠 ReactWrapper: Browser URL shows /products');
          console.log('🚀 ReactWrapper: Updating Vue memory router to /products');
          
          if (router.currentRoute.value.path !== '/products') {
            router.replace('/products').then(() => {
              console.log('✅ ReactWrapper: Vue memory router updated to /products');
              console.log('🎯 ReactWrapper: ProductList should now render');
            }).catch((err) => {
              console.error('❌ ReactWrapper: Memory router update failed:', err);
            });
          } else {
            console.log('✅ ReactWrapper: Vue memory router already on /products');
          }
        } else if (currentPath.startsWith('/products/')) {
          console.log('🔄 ReactWrapper: Processing products sub-route');
          console.log('  Full container path:', currentPath);
          
          // More robust route extraction
          let vueRoute = '/';
          try {
            if (currentPath.includes('/products/product/')) {
              const productId = currentPath.split('/products/product/')[1];
              if (productId && productId.match(/^\d+$/)) {
                vueRoute = `/product/${productId}`;
                console.log('📄 ReactWrapper: Product detail route detected:', vueRoute);
              } else {
                console.warn('⚠️ ReactWrapper: Invalid product ID format:', productId);
              }
            } else {
              // Other products routes
              vueRoute = currentPath.replace('/products', '') || '/';
            }
          } catch (error) {
            console.error('❌ ReactWrapper: Error parsing route:', error);
            vueRoute = '/'; // Safe fallback
          }
          
          console.log('🎯 ReactWrapper: Final Vue route:', vueRoute);
          console.log('🔍 ReactWrapper: Current Vue route:', router.currentRoute.value.path);
          
          // Update memory router to match browser URL
          if (vueRoute && typeof vueRoute === 'string' && vueRoute.startsWith('/') && vueRoute !== 'undefined') {
            if (router.currentRoute.value.path !== vueRoute) {
              console.log('🚀 ReactWrapper: Syncing memory router to:', vueRoute);
              router.replace(vueRoute).then(() => {
                console.log('✅ ReactWrapper: Memory router sync successful');
              }).catch((error) => {
                console.error('❌ ReactWrapper: Memory router sync failed:', error);
                console.log('🔍 ReactWrapper: Attempting root fallback');
                router.replace('/').catch(() => {
                  console.error('❌ ReactWrapper: Root fallback failed');
                });
              });
            } else {
              console.log('✅ ReactWrapper: Memory router already synced');
            }
          } else {
            console.error('❌ ReactWrapper: Invalid Vue route:', vueRoute);
            console.log('🏠 ReactWrapper: Defaulting to root');
            router.replace('/').catch(() => {
              console.error('❌ ReactWrapper: Root default failed');
            });
          }
        }
      };

      // Initial sync with longer delay to ensure app is fully mounted
      setTimeout(() => {
        console.log('🚀 ReactWrapper: Initial URL sync after app mount');
        console.log('🏠 ReactWrapper: Current window location:', window.location.pathname);
        console.log('🔍 ReactWrapper: Current Vue route before sync:', router.currentRoute.value.path);
        console.log('📋 ReactWrapper: Available routes:', router.getRoutes().map(r => r.path));
        
        // Let Vue router handle the initial route automatically
        console.log('🎯 ReactWrapper: Letting Vue router handle initial route');
        console.log('🔍 ReactWrapper: Router should auto-redirect /products to /');
        
        // Map browser URL to Vue router internal state (memory history)
        const currentPath = window.location.pathname;
        console.log('🎯 ReactWrapper: Mapping browser URL to Vue memory router');
        console.log('  Browser URL:', currentPath);
        
        let vueRoute = '/';
        try {
          if (currentPath === '/products' || currentPath === '/products/') {
            vueRoute = '/products';
          } else if (currentPath.startsWith('/products/product/')) {
            const productId = currentPath.split('/products/product/')[1];
            if (productId && productId.match(/^\d+$/)) {
              vueRoute = `/product/${productId}`;
            }
          } else if (currentPath.startsWith('/products/')) {
            vueRoute = currentPath.replace('/products', '') || '/';
          }
        } catch (error) {
          console.error('❌ ReactWrapper: Error mapping route:', error);
          vueRoute = '/';
        }
        
        console.log('🚀 ReactWrapper: Setting Vue memory route to:', vueRoute);
        
        // Use replace for memory history (won't affect browser URL)
        router.replace(vueRoute).then(() => {
          console.log('✅ ReactWrapper: Memory router updated successfully');
          console.log('🔍 ReactWrapper: Vue internal route:', router.currentRoute.value.path);
          console.log('🔍 ReactWrapper: Browser URL unchanged:', window.location.pathname);
        }).catch(error => {
          console.error('❌ ReactWrapper: Memory router update failed:', error);
          console.log('💡 ReactWrapper: Falling back to root route');
          router.replace('/').catch(() => {
            console.error('❌ ReactWrapper: Even fallback failed');
          });
        });
      }, 300);

      // Listen to browser navigation
      window.addEventListener('popstate', syncUrl);

      return () => {
        window.removeEventListener('popstate', syncUrl);
        if (appRef.current) {
          appRef.current.unmount();
          appRef.current = null;
        }
      };
    }

    return () => {
      if (appRef.current) {
        appRef.current.unmount();
        appRef.current = null;
      }
    };
  }, []);

  return <div ref={ref} />;
};

export default ReactWrapper;
