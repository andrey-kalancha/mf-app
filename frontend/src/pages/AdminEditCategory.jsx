import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import AdminNav from "../components/AdminNav";
import "./AdminCreateCategory.css";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminEditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    parent_id: "",
    sort_order: "0",
    is_active: true,
  });

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        const [categoryResponse, categoriesResponse] = await Promise.all([
          api.get(`/categories/${id}`),
          api.get("/categories"),
        ]);

        const category = categoryResponse.data;
        setCategories(
          Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []
        );

        setForm({
          name: category.name || "",
          slug: category.slug || "",
          description: category.description || "",
          parent_id: category.parent_id ? String(category.parent_id) : "",
          sort_order:
            category.sort_order !== null && category.sort_order !== undefined
              ? String(category.sort_order)
              : "0",
          is_active: category.is_active ?? true,
        });
      } catch (err) {
        console.error("Ошибка загрузки категории:", err);
        toast.error("Не удалось загрузить категорию");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBooleanChange = (value) => {
    setForm((prev) => ({
      ...prev,
      is_active: value === "true",
    }));
  };

  const handleGenerateSlug = () => {
    setForm((prev) => ({
      ...prev,
      slug: slugify(prev.name),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim() || null,
      parent_id: form.parent_id ? Number(form.parent_id) : null,
      sort_order: Number(form.sort_order || 0),
      is_active: form.is_active,
    };

    if (!payload.name || !payload.slug) {
      toast.error("Заполните название и slug");
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/categories/${id}`, payload);
      toast.success("Категория успешно обновлена");
      navigate("/admin");
    } catch (err) {
      console.error("Ошибка обновления категории:", err);
      toast.error(err.response?.data?.detail || "Не удалось обновить категорию");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Удалить категорию? Это действие нельзя отменить."
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      await api.delete(`/categories/${id}`);
      toast.success("Категория удалена");
      navigate("/admin");
    } catch (err) {
      console.error("Ошибка удаления категории:", err);
      toast.error(err.response?.data?.detail || "Не удалось удалить категорию");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="admin-category-page">
        <div className="admin-category-shell">
          <div className="admin-category-heading">
            <div className="admin-category-badge">Admin / Category</div>
            <h1 className="admin-category-title">Загрузка категории...</h1>
            <p className="admin-category-subtitle">
              Подготавливаем данные для редактирования.
            </p>
          </div>

          <AdminNav />

          <div className="admin-category-card">
            <p style={{ color: "rgba(255,255,255,0.72)", margin: 0 }}>
              Загрузка...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-category-page">
      <div className="admin-category-shell">
        <div className="admin-category-heading">
          <div className="admin-category-badge">Admin / Category</div>
          <h1 className="admin-category-title">Редактировать категорию</h1>
          <p className="admin-category-subtitle">
            Обновите раздел, подкатегорию и порядок отображения в каталоге.
          </p>
        </div>

        <AdminNav />

        <div className="admin-category-card">
          <form className="admin-category-form" onSubmit={handleSubmit}>
            <div className="admin-category-field">
              <label htmlFor="name">Название *</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Например: Газлифты"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-category-field">
              <label htmlFor="slug">Slug *</label>
              <input
                id="slug"
                name="slug"
                type="text"
                placeholder="Например: gazlifty"
                value={form.slug}
                onChange={handleChange}
                required
              />
            </div>

            <button type="button" onClick={handleGenerateSlug}>
              Сгенерировать slug
            </button>

            <div className="admin-category-field">
              <label htmlFor="parent_id">Родительская категория</label>
              <select
                id="parent_id"
                name="parent_id"
                value={form.parent_id}
                onChange={handleChange}
              >
                <option value="">Корневая категория</option>
                {categories
                  .filter((category) => String(category.id) !== String(id))
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="admin-category-field">
              <label htmlFor="description">Описание</label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="Краткое описание категории"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="admin-category-field">
              <label htmlFor="sort_order">Порядок сортировки</label>
              <input
                id="sort_order"
                name="sort_order"
                type="number"
                min="0"
                placeholder="0"
                value={form.sort_order}
                onChange={handleChange}
              />
            </div>

            <div className="admin-category-field">
              <label htmlFor="is_active">Активна</label>
              <select
                id="is_active"
                value={String(form.is_active)}
                onChange={(e) => handleBooleanChange(e.target.value)}
              >
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Сохранение..." : "Сохранить изменения"}
            </button>

            <button
              type="button"
              className="admin-category-delete-btn"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Удаление..." : "Удалить категорию"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
