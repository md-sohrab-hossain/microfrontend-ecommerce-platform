# 🛒 Microfrontend E-commerce Application

## 📖 Table of Contents

- [What is Microfrontend Architecture?](#what-is-microfrontend-architecture)
- [Project Overview](#project-overview)
- [Architecture Diagram](#architecture-diagram)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Troubleshooting](#troubleshooting)

---

## 🤔 What is Microfrontend Architecture?

**Simple Explanation:**
Imagine building a house where different rooms are built by different teams of specialists:

- Kitchen team builds the kitchen
- Bedroom team builds the bedrooms
- Bathroom team builds the bathrooms

Each team works independently, uses their preferred tools, and can deploy their rooms separately. But when combined, they form one complete house.

**Technical Explanation:**
Microfrontend architecture breaks down a large frontend application into smaller, independent applications that can be:

- Developed by different teams
- Built with different technologies (React, Vue, Angular)
- Deployed independently
- Combined into a single user experience

### 🔄 Traditional vs Microfrontend Architecture

| Traditional (Monolith)     | Microfrontend               |
| -------------------------- | --------------------------- |
| ⚠️ One large codebase      | ✅ Multiple small codebases |
| ⚠️ Single technology stack | ✅ Mixed technologies       |
| ⚠️ Entire app deployment   | ✅ Independent deployments  |
| ⚠️ Team dependencies       | ✅ Independent teams        |

---

## 🏢 Project Overview

This is a **full-featured e-commerce application** built using microfrontend architecture. It demonstrates how different parts of an online shopping website can work together seamlessly while being developed independently.

### 🎯 What This Application Does:

1. **Product Browsing** - Users can browse products by category
2. **Product Details** - View detailed information about products
3. **Shopping Cart** - Add/remove items, update quantities
4. **User Authentication** - Login/logout functionality
5. **Order Management** - Complete shopping experience

### 🔧 How It's Different:

- **4 Independent Applications** working as one
- **Different Technologies** (React + Vue.js)
- **Real-time Communication** between applications
- **Shared State Management** across applications

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    🌐 Browser (localhost:3000)                 │
├─────────────────────────────────────────────────────────────────┤
│                    📦 Container App (React)                     │
│                          Port: 3000                            │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │  Header | Navigation | Layout | Event Coordination    │  │
│    └─────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  🛍️ Products App (Vue.js)  │  🛒 Cart App (React)             │
│        Port: 3001          │       Port: 3002                 │
│  ┌─────────────────────┐    │  ┌──────────────────────────┐    │
│  │ Product List        │    │  │ Shopping Cart            │    │
│  │ Product Details     │    │  │ Item Management          │    │
│  │ Category Filter     │    │  │ Quantity Updates         │    │
│  │ Add to Cart         │    │  │ Checkout Process         │    │
│  └─────────────────────┘    │  └──────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│            🔐 Auth App (React) - Port: 3003                    │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │  Login | Register | Profile | Session Management      │  │
│    └─────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│              📚 Shared Library (TypeScript)                    │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │  EventBus | APIs | Types | Utils | Storage            │  │
│    └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 🔄 Communication Flow:

```
Products App → EventBus → Container → EventBus → Cart App
     ↓                                                ↑
  Add Item                                    Update UI
     ↓                                                ↑
LocalStorage ← → Shared State Management ← → Container State
```

---

## 💻 Technologies Used

### **Frontend Frameworks:**

- **React 18** - Container, Cart, and Auth applications
- **Vue.js 3** - Products application
- **TypeScript** - Type safety across all applications

### **Build Tools & Module Federation:**

- **Webpack 5** - Module bundling and federation
- **Webpack Module Federation** - Micro-app integration
- **Vite** (for Vue.js) - Fast development server

### **State Management:**

- **React Context API** - React applications state
- **Pinia** - Vue.js application state
- **Custom EventBus** - Inter-app communication

### **Styling:**

- **Tailwind CSS** - Utility-first CSS framework
- **CSS Modules** - Component-scoped styles

### **APIs & Data:**

- **Fake Store API** - Product and user data
- **Local Storage** - Cart and session persistence
- **Custom API Layer** - Abstracted data access

---

## 📁 Project Structure

```
microfrontend/
├── 📦 container/                # Main React app (Port: 3000)
│   ├── src/
│   │   ├── components/          # Header, Navigation, Remote loaders
│   │   ├── context/             # Global state management
│   │   ├── pages/               # Home and other pages
│   │   └── App.tsx              # Main container component
│   ├── webpack.config.js        # Module federation config
│   └── package.json
│
├── 🛍️ products/                # Vue.js app (Port: 3001)
│   ├── src/
│   │   ├── components/          # ProductList, ProductCard, ProductDetail
│   │   ├── stores/              # Pinia store for products
│   │   ├── router/              # Vue router configuration
│   │   └── App.vue              # Main Vue component
│   ├── webpack.config.js        # Module federation config
│   └── package.json
│
├── 🛒 cart/                     # React app (Port: 3002)
│   ├── src/
│   │   ├── components/          # CartItem, EmptyCart, CartSummary
│   │   ├── contexts/            # Cart state management
│   │   └── App.tsx              # Main cart component
│   ├── webpack.config.js        # Module federation config
│   └── package.json
│
├── 🔐 auth/                     # React app (Port: 3003)
│   ├── src/
│   │   ├── components/          # LoginForm, SignupForm, ProfileView
│   │   ├── contexts/            # Authentication context
│   │   └── App.tsx              # Main auth component
│   ├── webpack.config.js        # Module federation config
│   └── package.json
│
├── 📚 shared/                   # Shared library
│   ├── src/
│   │   ├── utils/               # EventBus, storage utilities
│   │   ├── api/                 # API clients
│   │   ├── types/               # TypeScript interfaces
│   │   └── index.ts             # Main exports
│   ├── webpack.config.js
│   └── package.json
│
├── 🚀 start-dev.bat            # Windows development script
├── 🚀 start-dev.sh             # Linux/Mac development script
└── 📖 README.md                # This file
```

---

## ⚙️ How It Works

### 1. **Module Federation Magic**

```javascript
// Container webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "container",
      remotes: {
        products: "products@http://localhost:3001/remoteEntry.js",
        cart: "cart@http://localhost:3002/remoteEntry.js",
        auth: "auth@http://localhost:3003/remoteEntry.js",
      },
    }),
  ],
};
```

### 2. **EventBus Communication**

```typescript
// Shared EventBus for inter-app communication
class EventBus {
  private listeners: { [key: string]: Function[] } = {};

  emit(event: string, data: any) {
    // Broadcast to all listening apps
  }

  on(event: string, callback: Function) {
    // Subscribe to events from other apps
  }
}
```

### 3. **State Synchronization Flow**

**Step 1:** User clicks "Add to Cart" in Products App (Vue.js)

```vue
<!-- Products App -->
<script>
const addToCart = () => {
  eventBus.emit("ADD_TO_CART", {
    product: selectedProduct,
    quantity: 1,
  });
};
</script>
```

**Step 2:** Container App (React) receives the event

```typescript
// Container App
useEffect(() => {
  eventBus.on("ADD_TO_CART", (data) => {
    // Update container state
    addToCart(data.product.id, data.quantity, data.product);

    // Forward to Cart App
    eventBus.emit("ADD_TO_CART_FORWARD", data);
  });
}, []);
```

**Step 3:** Cart App (React) updates its state

```typescript
// Cart App
useEffect(() => {
  eventBus.on("ADD_TO_CART_FORWARD", (data) => {
    // Add item to cart
    dispatch({ type: "ADD_ITEM", payload: data });

    // Save to localStorage
    storage.set("cart", updatedCart);
  });
}, []);
```

**Step 4:** Header updates cart count automatically

```tsx
// Header Component
const Header = () => {
  const { state } = useApp(); // Container context

  return (
    <div className="cart-icon">
      Cart ({state.cartCount}) {/* Updates automatically */}
    </div>
  );
};
```

---

## 🚀 Setup Instructions

### **Prerequisites (Required Software):**

1. **Node.js** (Version 16 or higher)

   ```bash
   # Check if installed
   node --version
   # Should show v16.0.0 or higher
   ```

2. **npm** (Comes with Node.js)
   ```bash
   # Check if installed
   npm --version
   # Should show 8.0.0 or higher
   ```

### **Step-by-Step Installation:**

#### **Step 1: Download the Project**

```bash
# Option A: Clone from repository
git clone [your-repo-url]
cd microfrontend

# Option B: Download and extract ZIP file
# Then navigate to the extracted folder
```

#### **Step 2: Install Dependencies**

**⚡ Manual Installation:**

```bash
# Install shared library first (IMPORTANT!)
cd shared
npm install
npm run build
cd ..

# Install container app
cd container
npm install
cd ..

# Install products app
cd products
npm install
cd ..

# Install cart app
cd cart
npm install
cd ..

# Install auth app
cd auth
npm install
cd ..
```

---

## 🎮 Running the Application

### **Manual Startup (Recommended)**

Open **5 separate terminals** and run these commands:

```bash
# Terminal 1: Shared Library
cd shared && npm run dev

# Terminal 2: Container (Main App) - WAIT FOR SHARED TO BUILD FIRST
cd container && npm start

# Terminal 3: Products App
cd products && npm run dev

# Terminal 4: Cart App
cd cart && npm start

# Terminal 5: Auth App
cd auth && npm start
```

### **🌐 Application URLs:**

After successful startup, open these URLs:

- **Main Application:** http://localhost:3000 ⭐ (Start here!)
- **Products App:** http://localhost:3001 (standalone)
- **Cart App:** http://localhost:3002 (standalone)
- **Auth App:** http://localhost:3003 (standalone)

### **⏱️ Startup Time:**

- First time: **2-3 minutes** (dependency installation + building)
- Subsequent runs: **30-60 seconds**

### **✅ Success Indicators:**

You'll know everything is working when you see:

```bash
✅ Shared library built successfully
✅ Container running on http://localhost:3000
✅ Products running on http://localhost:3001
✅ Cart running on http://localhost:3002
✅ Auth running on http://localhost:3003
```

---

## ✨ Features

### **🛍️ Product Management**

- ✅ Browse products by categories (electronics, clothing, jewelry)
- ✅ Search and filter products
- ✅ View detailed product information with images
- ✅ Product ratings and reviews display
- ✅ Price and availability information

### **🛒 Shopping Cart**

- ✅ Add products to cart from any page
- ✅ Update item quantities with +/- buttons
- ✅ Remove items from cart
- ✅ Real-time cart total calculation
- ✅ Persistent cart (saves on page refresh)
- ✅ Cart count in header updates instantly

### **🔐 User Authentication**

- ✅ User login with demo accounts
- ✅ User registration form
- ✅ Session persistence across page reloads
- ✅ User profile management
- ✅ Secure logout functionality

### **🎨 User Interface**

- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Modern, clean Tailwind CSS interface
- ✅ Smooth animations and transitions
- ✅ Loading states for better UX
- ✅ Comprehensive error handling

### **⚡ Technical Features**

- ✅ Real-time communication between all microfrontends
- ✅ Independent deployment capability
- ✅ Shared state management with EventBus
- ✅ Type safety with TypeScript
- ✅ Hot module replacement for fast development

### **🎮 Demo Features**

- ✅ **Demo Login Credentials:**
  - Username: `mor_2314`
  - Password: `83r5^_`
- ✅ **Test Products** from Fake Store API
- ✅ **Sample Categories** to explore

---

## 🚨 Troubleshooting

### **Common Issues & Solutions:**

#### **🔴 Problem: "Port already in use"**

```bash
# Windows - Kill process on specific port
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Linux/Mac - Kill process on specific port
lsof -ti:3000 | xargs kill -9
```

#### **🔴 Problem: "Module federation failed to load"**

**Solution:**

1. Ensure ALL 5 applications are running
2. Check browser console for specific error details
3. Clear browser cache: `Ctrl+Shift+R`
4. Restart all development servers

#### **🔴 Problem: "Shared library not found"**

**Solution:**

```bash
cd shared
npm run build
# Then restart all other apps
```

#### **🔴 Problem: "Cart not persisting after refresh"**

**Solution:**

1. Check if localStorage is enabled in browser
2. Clear browser data and try again
3. Check browser console for localStorage errors

### **📱 Browser Compatibility:**

- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 📞 Need Help?

- **Check Troubleshooting section** above
- **Open an issue** with detailed error information
- **Include:** OS, Node version, browser, error messages

---

## 📜 License

This project is licensed under the MIT License.

---

**⭐ If this project helped you understand microfrontends, please give it a star! ⭐**

**🚀 Happy coding with microfrontends! 🚀**
