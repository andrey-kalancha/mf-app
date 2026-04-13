import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      } catch (err) {
        console.error("Ошибка загрузки админ-панели:", err);
        toast.error("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm("Удалить этот товар?");
    if (!confirmed) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((item) => item.id !== id));
      toast.success("Товар удален");
    } catch (err) {
      console.error("Ошибка удаления товара:", err);
      toast.error("Не удалось удалить товар");
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmed = window.confirm("Удалить эту категорию?");
    if (!confirmed) return;

    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((item) => item.id !== id));
      toast.success("Категория удалена");
    } catch (err) {
      console.error("Ошибка удаления категории:", err);
      toast.error("Не удалось удалить категорию");
    }
  };

  if (loading) {
    return <h1 className="admin-dashboard-title">Загрузка...</h1>;
  }

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">Админ-панель</h1>

        <div className="admin-dashboard-actions">
          <Link to="/admin/products/create" className="admin-dashboard-btn">
            Добавить товар
          </Link>

          <Link
            to="/admin/categories/create"
            className="admin-dashboard-btn admin-dashboard-btn-secondary"
          >
            Добавить категорию
          </Link>
          <Link
            to="/admin/orders"
        className="admin-dashboard-btn admin-dashboard-btn-secondary"
        >
        Все заказы
        </Link>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-card">
          <h2>Товары</h2>

          {products.length === 0 ? (
            <p className="admin-dashboard-empty">Товаров пока нет</p>
          ) : (
            <div className="admin-dashboard-list">
              {products.map((product) => (
                <div key={product.id} className="admin-dashboard-item">
                  <div className="admin-dashboard-item__info">
                    <strong>{product.name}</strong>
                    <span>ID: {product.id}</span>
                    <span>SKU: {product.sku}</span>
                    <span>{product.price} ₽</span>
                  </div>

                  <div className="admin-dashboard-item__actions">
                    <Link
                      to={`/product/${product.id}`}
                      className="admin-dashboard-link"
                    >
                      Открыть
                    </Link>

                    <Link
                      to={`/admin/products/edit/${product.id}`}
                      className="admin-dashboard-link"
                    >
                      Редактировать
                    </Link>

                    <button
                      className="admin-dashboard-delete"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-dashboard-card">
          <h2>Категории</h2>

          {categories.length === 0 ? (
            <p className="admin-dashboard-empty">Категорий пока нет</p>
          ) : (
            <div className="admin-dashboard-list">
              {categories.map((category) => (
                <div key={category.id} className="admin-dashboard-item">
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
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}