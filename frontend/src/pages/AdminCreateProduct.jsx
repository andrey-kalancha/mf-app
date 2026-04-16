import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminCreateProduct.css";
import AdminNav from "../components/AdminNav";

export default function AdminCreateProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    category_id: "",
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.get("/categories");
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Ошибка загрузки категорий:", err);
        toast.error("Не удалось загрузить категории");
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

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

      await api.post("/products", {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        sku: form.sku.trim(),
        category_id: Number(form.category_id),
      });

      toast.success("Товар создан");
      navigate("/admin");
    } catch (err) {
      console.error("Ошибка создания товара:", err);
      toast.error("Не удалось создать товар");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-product-page">
      <div className="admin-product-shell">
        <div className="admin-product-heading">
          <div className="admin-product-badge">Admin panel</div>
          <h1 className="admin-product-title">Создание товара</h1>
          <p className="admin-product-subtitle">
            Добавьте новый товар в каталог
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
                disabled={saving}
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
                disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                disabled={saving || loadingCategories}
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={saving || loadingCategories}>
              {saving ? "Создаём..." : "Создать товар"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}