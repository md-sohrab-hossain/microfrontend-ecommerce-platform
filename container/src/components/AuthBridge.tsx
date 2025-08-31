import React, { useEffect } from "react";
import { EventBus } from "@microfrontend-ecommerce/shared";
import { useAuth } from "../hooks/useRxJSStore";

/**
 * Bridge component to sync auth events between EventBus (Auth app) and RxJS Global Store
 */
const AuthBridge: React.FC = () => {
  const { login, internalLogout } = useAuth();

  useEffect(() => {
    const eventBus = EventBus.getInstance();

    // Listen for login events from Auth app
    const handleUserLogin = (data: any) => {
      if (data.user) {
        // Update RxJS global store with logged in user
        login(data.user);
      }
    };

    // Listen for logout events from Auth app (not from Container!)
    const handleUserLogout = (data: any) => {
      // Check if this logout came from Auth app (external) or Container (internal)
      // We only want to handle logouts from Auth app, not from Container
      if (data?.source !== "container") {
        // Use internal logout to avoid infinite loop
        internalLogout();
      } else {
      }
    };

    // Subscribe to EventBus events
    eventBus.on("USER_LOGIN", handleUserLogin);
    eventBus.on("USER_LOGOUT", handleUserLogout);

    // Cleanup
    return () => {
      eventBus.off("USER_LOGIN", handleUserLogin);
      eventBus.off("USER_LOGOUT", handleUserLogout);
    };
  }, [login, internalLogout]);

  // This component renders nothing - it's just for event handling
  return null;
};

export default AuthBridge;
