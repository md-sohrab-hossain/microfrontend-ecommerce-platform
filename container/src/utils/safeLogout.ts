/**
 * Safe logout utility to avoid cross-origin errors
 */
export const safeLogout = async () => {
  try {
    // Clear any timers or pending operations
    if (typeof window !== "undefined") {
      // Clear any existing timeouts that might interfere
      let highestTimeoutId = setTimeout(";");
      for (let i = highestTimeoutId; i >= 0; i--) {
        clearTimeout(i);
      }
    }

    // Use replace instead of href to avoid back button issues
    if (typeof window !== "undefined" && window.location) {
      window.location.replace("/");
    }
  } catch (error) {
    // Fallback: try regular navigation
    try {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (fallbackError) {
      // Last resort: reload the page
      window.location.reload();
    }
  }
};

/**
 * Safe EventBus emission with error handling
 */
export const safeEventBusEmit = (eventName: string, data?: any) => {
  return new Promise<void>((resolve) => {
    try {
      // Use dynamic import to avoid issues
      import("@microfrontend-ecommerce/shared")
        .then((sharedModule) => {
          const eventBus = sharedModule.EventBus.getInstance();
          if (eventBus && typeof eventBus.emit === "function") {
            // Add source identification to prevent loops
            const eventData = { ...data, source: "container" };
            eventBus.emit(eventName, eventData);
          }
          resolve();
        })
        .catch((error) => {
          resolve(); // Don't reject, just resolve
        });
    } catch (error) {
      resolve(); // Don't reject, just resolve
    }
  });
};
