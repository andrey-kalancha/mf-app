import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminCreateProduct.css";

export default function AdminCreateProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    category_id: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
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

    if (!form.category_id) {
      toast.error("Выберите категорию");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        sku: form.sku,
        category_id: Number(form.category_id),
      };

      const response = await api.post("/products", payload);

      toast.success("Товар успешно создан");
      navigate(`/product/${response.data.id}`);
    } catch (err) {
      console.error("Ошибка создания товара:", err);
      toast.error("Не удалось создать товар");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-product-page">
      <div className="admin-product-card">
        <h1>Добавить товар</h1>

        <form className="admin-product-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Название товара"
            value={form.name}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Описание товара"
            value={form.description}
            onChange={handleChange}
            rows="5"
          />

          <input
            type="number"
            name="price"
            placeholder="Цена"
            value={form.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />

          <input
            type="text"
            name="sku"
            placeholder="Артикул"
            value={form.sku}
            onChange={handleChange}
            required
          />

          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
            disabled={loadingCategories}
          >
            <option value="">Выберите категорию</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <button type="submit" disabled={submitting}>
            {submitting ? "Создаем..." : "Создать товар"}
          </button>
        </form>
      </div>
    </section>
  );
}