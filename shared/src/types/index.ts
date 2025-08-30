// Product types
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

// Cart types
export interface CartItem {
  productId: number;
  quantity: number;
}

export interface Cart {
  id: number;
  userId: number;
  date: string;
  products: CartItem[];
}

// User types
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

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Event types for microfrontend communication
export interface MicrofrontendEvent {
  type: string;
  payload?: any;
}

export interface AddToCartEvent extends MicrofrontendEvent {
  type: 'ADD_TO_CART';
  payload: {
    product: Product;
    quantity: number;
  };
}

export interface LoginEvent extends MicrofrontendEvent {
  type: 'USER_LOGIN';
  payload: {
    token: string;
    user: Partial<User>;
  };
}

export interface LogoutEvent extends MicrofrontendEvent {
  type: 'USER_LOGOUT';
}
