import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminHomePage from './pages/admin/AdminHomePage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminHomePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
