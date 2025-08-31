# 🛒 Microfrontend E-commerce Application

একটি complete modern e-commerce application যেটা microfrontend architecture দিয়ে তৈরি।

## 🌟 What is this Project? (এই প্রজেক্ট কি?)

এটা একটা online shopping website যেটা বিভিন্ন ছোট ছোট apps দিয়ে তৈরি। প্রতিটা app আলাদা কাজ করে কিন্তু সবাই মিলে একসাথে একটা complete website বানায়।

### 🧩 Different Parts (বিভিন্ন অংশ):

1. **🏠 Container** - মূল house যেখানে সব app গুলো থাকে
2. **🛍️ Products** - জিনিসপত্র দেখানোর জন্য
3. **🛒 Cart** - shopping cart, কি কিনবেন তার তালিকা
4. **👤 Auth** - login/logout করার জন্য

## 🎯 How Does It Work? (কিভাবে কাজ করে?)

### 🔄 Data Flow (তথ্যের প্রবাহ):

```
User দেখে Products → Add to Cart → Cart Update হয় → RxJS Store এ Save → সব জায়গায় Update
```

### 🧠 Brain of the System (সিস্টেমের মস্তিষ্ক):

**RxJS Global Store** হলো এই application এর brain। এটা সব information মনে রাখে:

- 👤 কে login করেছে?
- 🛒 Cart এ কি কি আছে?
- 💰 Total price কত?
- 📦 কোন products available আছে?

## 🏗️ Architecture (কাঠামো)

### 🌐 Microfrontend Structure:

```
Container App (React) 🏠
├── Products App (Vue.js) 🛍️
├── Cart App (React) 🛒
├── Auth App (React) 👤
└── Shared Library 📚
```

### 📡 Communication System:

```
RxJS Global Store ← → All Microfrontends
       ↕️
  localStorage (Persistent Storage)
       ↕️
   EventBus (Legacy Support)
```

## 🚀 Technologies Used (ব্যবহৃত প্রযুক্তি)

### Frontend Frameworks:

- **React** - Container, Cart, Auth apps
- **Vue.js** - Products app
- **TypeScript** - Type safety জন্য

### State Management:

- **RxJS** - Reactive state management
- **Pinia** - Vue store (Products app)
- **React Context** - React state

### Module Federation:

- **Webpack 5** - Module sharing
- **Module Federation** - Microfrontend integration

### Styling:

- **Tailwind CSS** - Modern styling
- **CSS Modules** - Component styling

## 🛠️ Features (ফিচারসমূহ)

### 🛍️ Products Features:

- ✅ Product listing with beautiful cards
- ✅ Product details view
- ✅ Smart Add to Cart → Quantity Controls
- ✅ Category filtering
- ✅ Search functionality

### 🛒 Cart Features:

- ✅ Add/Remove items
- ✅ Quantity management (+/-)
- ✅ Price calculation
- ✅ Clear all cart
- ✅ Real-time updates

### 👤 Auth Features:

- ✅ User login/logout
- ✅ Session persistence
- ✅ User profile display
- ✅ Secure authentication

### 🔄 Global Features:

- ✅ Cross-app communication
- ✅ Real-time state sync
- ✅ Data persistence
- ✅ Error handling

## 🎨 Smart UI Features

### 📱 Products Page Enhancement:

আগে: সবসময় "Add to Cart" button দেখাতো

```
[ Add to Cart ]  ← Always this
```

এখন: Smart button states:

```
Product NOT in cart: [ Add to Cart ]
Product IN cart:     [ - ] [ 2 ] [ + ]
                         ↑    ↑   ↑
                    Decrease │ Increase
                           Current Qty
```

### 🎯 User Experience:

- **Green Theme** = Product already in cart
- **Blue Theme** = Add to cart available
- **Real-time Updates** = Instant feedback
- **Quantity Controls** = No need to go to cart page

## 📦 Project Structure

```
microfrontend/
├── 🏠 container/          # Main host application (React)
│   ├── src/
│   │   ├── components/    # Header, Navigation
│   │   ├── hooks/         # useRxJSStore (React hooks)
│   │   ├── contexts/      # AppContextRxJS
│   │   └── utils/         # safeLogout, error handling
│   └── webpack.config.js  # Module Federation config
├── 🛍️ products/           # Products microfrontend (Vue)
│   ├── src/
│   │   ├── components/    # ProductCard, ProductDetail
│   │   ├── composables/   # useRxJSStore (Vue composables)
│   │   ├── stores/        # Pinia store
│   │   └── router/        # Vue router
│   └── webpack.config.js
├── 🛒 cart/               # Cart microfrontend (React)
│   ├── src/
│   │   ├── components/    # Cart items, quantity controls
│   │   ├── contexts/      # CartContextRxJS
│   │   └── hooks/         # useRxJSStore
│   └── webpack.config.js
├── 👤 auth/               # Authentication (React)
│   └── ...
├── 📚 shared/             # Shared library
│   ├── src/
│   │   ├── store/         # RxJS Global Store
│   │   ├── utils/         # EventBus, storage
│   │   └── types/         # TypeScript interfaces
│   └── package.json
└── 📝 README.md
```

## ⚡ How It All Works Together

### 🔄 Data Flow Example:

1. **User visits Products page**

   ```
   Products App loads → Shows all products with "Add to Cart" buttons
   ```

2. **User clicks "Add to Cart"**

   ```
   Products App → RxJS Global Store → Updates cart state → All apps get notified
   ```

3. **Button becomes Quantity Controls**

   ```
   "Add to Cart" transforms to [ - ] [ 1 ] [ + ]
   ```

4. **User increases quantity**

   ```
   Click [ + ] → RxJS Store updates → Cart count in header updates → Total price updates
   ```

5. **User goes to Cart page**
   ```
   Cart App reads from RxJS Store → Shows same items with same quantities
   ```

### 🧩 State Synchronization:

```
Any App Changes Cart → RxJS Global Store → All Apps Update Automatically
                             ↓
                    localStorage (Persistent)
```

## 🚀 How to Run (কিভাবে চালাবেন)

### 1. Install Dependencies:

```bash
# Root directory
npm install

# Each microfrontend
cd container && npm install
cd ../products && npm install
cd ../cart && npm install
cd ../auth && npm install
cd ../shared && npm install
```

### 2. Start All Services:

**Terminal 1 - Shared Library:**

```bash
cd shared
npm run build:watch
```

**Terminal 2 - Container (Port 4000):**

```bash
cd container
npm start
```

**Terminal 3 - Products (Port 4001):**

```bash
cd products
npm start
```

**Terminal 4 - Cart (Port 4002):**

```bash
cd cart
npm start
```

**Terminal 5 - Auth (Port 4003):**

```bash
cd auth
npm start
```

### 3. Open Browser:

```
http://localhost:4000
```

## 🔧 Development Workflow

### Adding New Features:

1. **Products page এ নতুন feature:**

   ```bash
   cd products
   # Edit components or add new ones
   # Use useRxJSStore for state management
   ```

2. **Cart functionality change:**

   ```bash
   cd cart
   # Edit cart components
   # State automatically syncs via RxJS
   ```

3. **Global state change:**

```bash
cd shared
   # Edit store/GlobalStore.ts
   # All apps get the update
```

## 🎯 Key Concepts (গুরুত্বপূর্ণ ধারণা)

### 🔄 Reactive Programming:

- **Observable Streams** - Data flows like water in pipes
- **Automatic Updates** - Change one place, updates everywhere
- **Real-time Sync** - No manual refresh needed

### 🧩 Module Federation:

- **Code Sharing** - Share components between apps
- **Independent Deployment** - Update one app without touching others
- **Runtime Integration** - Apps connect at runtime

### 🏗️ Microfrontend Benefits:

- **Team Independence** - Different teams can work on different apps
- **Technology Freedom** - Use React, Vue, Angular in same project
- **Scalability** - Add new features as separate apps

## 🐛 Troubleshooting (সমস্যা সমাধান)

### Common Issues:

1. **Port Already in Use:**

   ```bash
   # Kill process using the port
   npx kill-port 4000
   ```

2. **Module Not Found:**

   ```bash
   # Rebuild shared library
   cd shared && npm run build
   ```

3. **State Not Syncing:**

   ```bash
   # Check RxJS store implementation
   # Verify store.dispatch() calls
   ```

4. **Hot Reload Issues:**
   ```bash
   # Restart the specific microfrontend
   ```

## 🎉 Success Metrics

When everything works correctly, you should see:

✅ **Products load instantly**  
✅ **Add to Cart works seamlessly**  
✅ **Quantity controls appear after adding**  
✅ **Cart count updates in header**  
✅ **Prices calculate correctly**  
✅ **Login/logout works smoothly**  
✅ **No console errors**  
✅ **Data persists on refresh**

## 🏆 Achievement Unlocked!

আপনি এখন একটা complete modern microfrontend application চালাতে পারেন! 🎊

এই system এ:

- 4টা আলাদা app একসাথে কাজ করছে
- Modern reactive state management আছে
- Real-time data synchronization আছে
- Professional user experience আছে

## 📚 Further Learning

### Next Steps:

1. **Add new microfrontend** (Orders, Reviews, etc.)
2. **Implement caching** for better performance
3. **Add testing** for quality assurance
4. **Deploy to production** with CI/CD

### Resources:

- [Module Federation Documentation](https://webpack.js.org/concepts/module-federation/)
- [RxJS Guide](https://rxjs.dev/guide/overview)
- [Microfrontend Architecture](https://micro-frontends.org/)

---

## 👨‍💻 Made with ❤️

This project demonstrates modern frontend architecture with:

- **Clean Code** practices
- **Scalable Architecture**
- **Developer Experience** focus
- **User Experience** priority

**Happy Coding!** 🚀✨
