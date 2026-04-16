import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminCreateProduct.css";
import AdminNav from "../components/AdminNav";

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    category_id: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [productResponse, categoriesResponse] = await Promise.all([
          api.get(`/products/${id}`),
          api.get("/categories"),
        ]);

        const product = productResponse.data || {};
        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];

        setCategories(categoriesData);
        setForm({
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
          sku: product.sku || "",
          category_id: product.category_id ? String(product.category_id) : "",
        });
      } catch (err) {
        console.error("Ошибка загрузки товара:", err);
        toast.error("Не удалось загрузить товар");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.sku.trim() || !form.price || !form.category_id) {
      toast.error("Заполните обязательные поля");
      return;
    }

    try {
      setSaving(true);

      await api.put(`/products/${id}`, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        sku: form.sku.trim(),
        category_id: Number(form.category_id),
      });

      toast.success("Товар обновлён");
      navigate("/admin");
    } catch (err) {
      console.error("Ошибка обновления товара:", err);
      toast.error("Не удалось обновить товар");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Удалить товар?");
    if (!confirmed) return;

    try {
      setDeleting(true);
      await api.delete(`/products/${id}`);
      toast.success("Товар удалён");
      navigate("/admin");
    } catch (err) {
      console.error("Ошибка удаления товара:", err);
      toast.error("Не удалось удалить товар");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="admin-product-page">
        <div className="admin-product-shell">
          <div className="admin-product-card">
            <h1 className="admin-product-title">Загрузка...</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-product-page">
      <div className="admin-product-shell">
        <div className="admin-product-heading">
          <div className="admin-product-badge">Admin panel</div>
          <h1 className="admin-product-title">Редактирование товара</h1>
          <p className="admin-product-subtitle">
            Измените данные товара или удалите его
          </p>
        </div>

        <AdminNav />

        <div className="admin-product-card">
          <form className="admin-product-form" onSubmit={handleSubmit}>
            <div className="admin-product-field">
              <label htmlFor="product-name">Название</label>
              <input
                id="product-name"
                name="name"
                type="text"
                placeholder="Название товара"
                value={form.name}
                onChange={handleChange}
                disabled={saving || deleting}
              />
            </div>

            <div className="admin-product-field">
              <label htmlFor="product-description">Описание</label>
              <textarea
                id="product-description"
                name="description"
                rows="5"
                placeholder="Описание товара"
                value={form.description}
                onChange={handleChange}
                disabled={saving || deleting}
              />
            </div>

            <div className="admin-product-grid">
              <div className="admin-product-field">
                <label htmlFor="product-price">Цена</label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Цена"
                  value={form.price}
                  onChange={handleChange}
                  disabled={saving || deleting}
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="product-sku">SKU</label>
                <input
                  id="product-sku"
                  name="sku"
                  type="text"
                  placeholder="Артикул"
                  value={form.sku}
                  onChange={handleChange}
                  disabled={saving || deleting}
                />
              </div>
            </div>

            <div className="admin-product-field">
              <label htmlFor="product-category">Категория</label>
              <select
                id="product-category"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                disabled={saving || deleting}
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={saving || deleting}>
              {saving ? "Сохраняем..." : "Сохранить изменения"}
            </button>

            <button
              type="button"
              className="admin-product-delete-btn"
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? "Удаляем..." : "Удалить товар"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}