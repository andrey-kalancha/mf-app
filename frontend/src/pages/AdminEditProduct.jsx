import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminCreateProduct.css";

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const loadData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get("/categories"),
        ]);

        const product = productRes.data;
        const categoriesData = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : [];

        setCategories(categoriesData);

        setForm({
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
          sku: product.sku || "",
          category_id: product.category_id ?? "",
        });
      } catch (err) {
        console.error("Ошибка загрузки товара:", err);
        toast.error("Не удалось загрузить товар");
      } finally {
        setLoading(false);
        setLoadingCategories(false);
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

      await api.put(`/products/${id}`, payload);

      toast.success("Товар успешно обновлен");
      navigate(`/product/${id}`);
    } catch (err) {
      console.error("Ошибка обновления товара:", err);
      toast.error("Не удалось обновить товар");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Удалить этот товар?");
    if (!confirmed) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success("Товар удален");
      navigate("/catalog");
    } catch (err) {
      console.error("Ошибка удаления товара:", err);
      toast.error("Не удалось удалить товар");
    }
  };

  if (loading) {
    return <h1 className="catalog-title">Загрузка...</h1>;
  }

  return (
    <section className="admin-product-page">
      <div className="admin-product-card">
        <h1>Редактировать товар</h1>

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
            {submitting ? "Сохраняем..." : "Сохранить изменения"}
          </button>

          <button
            type="button"
            className="admin-product-delete-btn"
            onClick={handleDelete}
          >
            Удалить товар
          </button>
        </form>
      </div>
    </section>
  );
}