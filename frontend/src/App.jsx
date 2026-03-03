import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Orders from "./pages/Orders";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import Cart from "./pages/Cart";
import Product from "./pages/Product";
import Checkout from "./pages/Checkout";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/products/:id" element={<Product />} />
      <Route path="/checkout" element={<Checkout />} />

      {/* Protected pages */}
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        }
      />

      {/* Admin-only pages */}
      <Route
        path="/admin/product/new"
        element={
          <PrivateRoute adminOnly>
            <AddProduct />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/edit-product/:productId"
        element={
          <PrivateRoute adminOnly>
            <EditProduct />
          </PrivateRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
