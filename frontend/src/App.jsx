import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import About from "./pages/About";
import Contacts from "./pages/Contacts";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminCreateProduct from "./pages/AdminCreateProduct";
import AdminCreateCategory from "./pages/AdminCreateCategory";
import AdminEditProduct from "./pages/AdminEditProduct";
import AdminEditCategory from "./pages/AdminEditCategory";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products/create"
            element={
              <AdminRoute>
                <AdminCreateProduct />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/categories/create"
            element={
              <AdminRoute>
                <AdminCreateCategory />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
           <AdminRoute>
           <AdminEditProduct />
           </AdminRoute>
             }
          />
          <Route
            path="/admin/categories/edit/:id"
            element={
            <AdminRoute>
           <AdminEditCategory />
          </AdminRoute>
              }
          />
          <Route
            path="/admin"
            element={
            <AdminRoute>
             <AdminDashboard />
             </AdminRoute>
                }
          />
          <Route
           path="/admin/orders"
            element={
            <AdminRoute>
            <AdminOrders />
            </AdminRoute>
                  }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;