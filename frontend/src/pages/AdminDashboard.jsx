import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminDashboard.css";
import AdminNav from "../components/AdminNav";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);

      setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
      setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
    } catch (err) {
      console.error("Ошибка загрузки админ-дашборда:", err);
      setError("Не удалось загрузить данные админки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm("Удалить товар?");
    if (!confirmed) return;

    try {
      setDeletingProductId(productId);
      await api.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((item) => item.id !== productId));
      toast.success("Товар удалён");
    } catch (err) {
      console.error("Ошибка удаления товара:", err);
      toast.error("Не удалось удалить товар");
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmed = window.confirm("Удалить категорию?");
    if (!confirmed) return;

    try {
      setDeletingCategoryId(categoryId);
      await api.delete(`/categories/${categoryId}`);
      setCategories((prev) => prev.filter((item) => item.id !== categoryId));
      toast.success("Категория удалена");
    } catch (err) {
      console.error("Ошибка удаления категории:", err);
      toast.error("Не удалось удалить категорию");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  if (loading) {
    return (
      <section className="admin-dashboard-page">
        <div className="admin-dashboard-shell">
          <div className="admin-dashboard-hero">
            <div className="admin-dashboard-badge">Admin panel</div>
            <div className="admin-dashboard-skeleton admin-dashboard-skeleton--title" />
            <div className="admin-dashboard-skeleton admin-dashboard-skeleton--text" />
          </div>

          <div className="admin-dashboard-top-actions">
            <div className="admin-dashboard-skeleton admin-dashboard-skeleton--action" />
            <div className="admin-dashboard-skeleton admin-dashboard-skeleton--action" />
            <div className="admin-dashboard-skeleton admin-dashboard-skeleton--action" />
            <div className="admin-dashboard-skeleton admin-dashboard-skeleton--action" />
          </div>

          <div className="admin-dashboard-grid">
            {[1, 2].map((card) => (
              <div className="admin-dashboard-card" key={card}>
                <div className="admin-dashboard-skeleton admin-dashboard-skeleton--card-title" />
                <div className="admin-dashboard-list">
                  {[1, 2, 3].map((item) => (
                    <div className="admin-dashboard-item" key={item}>
                      <div className="admin-dashboard-item__info">
                        <div className="admin-dashboard-skeleton admin-dashboard-skeleton--item-title" />
                        <div className="admin-dashboard-skeleton admin-dashboard-skeleton--item-text" />
                      </div>
                      <div className="admin-dashboard-item__actions">
                        <div className="admin-dashboard-skeleton admin-dashboard-skeleton--small-btn" />
                        <div className="admin-dashboard-skeleton admin-dashboard-skeleton--small-btn" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-dashboard-page">
        <div className="admin-dashboard-shell">
          <div className="admin-dashboard-state">
            <h1 className="admin-dashboard-state__title">Ошибка загрузки</h1>
            <p className="admin-dashboard-state__text">{error}</p>
            <button className="admin-dashboard-btn" onClick={loadDashboard}>
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <div className="admin-dashboard-hero">
          <div className="admin-dashboard-badge">Admin panel</div>
          <h1 className="admin-dashboard-title">Панель администратора</h1>
          <p className="admin-dashboard-subtitle">
            Управление каталогом, пользователями и заказами в одном месте
          </p>
        </div>

        <AdminNav />

        

        <div className="admin-dashboard-grid">
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card__header">
              <div>
                <div className="admin-dashboard-card__badge">Products</div>
                <h2>Товары</h2>
              </div>
              <span className="admin-dashboard-card__count">{products.length}</span>
            </div>

            {products.length === 0 ? (
              <p className="admin-dashboard-empty">Товары пока не добавлены</p>
            ) : (
              <div className="admin-dashboard-list">
                {products.map((product) => (
                  <div className="admin-dashboard-item" key={product.id}>
                    <div className="admin-dashboard-item__info">
                      <strong>{product.name}</strong>
                      <span>
                        SKU: {product.sku || "—"} · {product.price ?? 0} ₽
                      </span>
                    </div>

                    <div className="admin-dashboard-item__actions">
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="admin-dashboard-link"
                      >
                        Редактировать
                      </Link>

                      <button
                        className="admin-dashboard-delete"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingProductId === product.id}
                      >
                        {deletingProductId === product.id ? "Удаляем..." : "Удалить"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card__header">
              <div>
                <div className="admin-dashboard-card__badge">Categories</div>
                <h2>Категории</h2>
              </div>
              <span className="admin-dashboard-card__count">{categories.length}</span>
            </div>

            {categories.length === 0 ? (
              <p className="admin-dashboard-empty">Категории пока не добавлены</p>
            ) : (
              <div className="admin-dashboard-list">
                {categories.map((category) => (
                  <div className="admin-dashboard-item" key={category.id}>
                    <div className="admin-dashboard-item__info">
                      <strong>{category.name}</strong>
                      <span>ID: {category.id}</span>
                    </div>

                    <div className="admin-dashboard-item__actions">
                      <Link
                        to={`/admin/categories/edit/${category.id}`}
                        className="admin-dashboard-link"
                      >
                        Редактировать
                      </Link>

                      <button
                        className="admin-dashboard-delete"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deletingCategoryId === category.id}
                      >
                        {deletingCategoryId === category.id ? "Удаляем..." : "Удалить"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}