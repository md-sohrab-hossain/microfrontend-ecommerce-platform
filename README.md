# Microfrontend E-commerce Project

A mini e-commerce application built with microfrontend architecture using React and Vue.js, powered by the Fake Store API.

## Architecture

- **Container (React)**: Main shell application that orchestrates all microfrontends
- **Products (Vue.js)**: Product listing and details microfrontend  
- **Cart (React)**: Shopping cart functionality microfrontend
- **Auth (React)**: Authentication microfrontend
- **Shared**: Common utilities and types

## Technology Stack

- **Frontend**: React 18, Vue.js 3
- **Bundler**: Webpack 5 with Module Federation
- **API**: Fake Store API (https://fakestoreapi.com/)
- **Styling**: Tailwind CSS
- **State Management**: React Context, Vue Pinia

## Getting Started

### Prerequisites

- Node.js >= 16
- npm or yarn

### Installation

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### Development URLs

- Container App: http://localhost:3000
- Products Service: http://localhost:3001  
- Cart Service: http://localhost:3002
- Auth Service: http://localhost:3003

### Build for Production

```bash
npm run build:all
```

## API Endpoints Used

- `GET /products` - Fetch all products
- `GET /products/:id` - Fetch single product
- `GET /products/categories` - Fetch categories
- `GET /products/category/:category` - Fetch products by category
- `POST /auth/login` - User authentication
- `GET /carts` - Fetch carts
- `POST /carts` - Create/update cart

## Project Structure

```
microfrontend/
├── container/          # React container app
├── products/          # Vue.js products microfrontend
├── cart/             # React cart microfrontend  
├── auth/             # React auth microfrontend
├── shared/           # Shared utilities
└── package.json      # Root workspace config
```
