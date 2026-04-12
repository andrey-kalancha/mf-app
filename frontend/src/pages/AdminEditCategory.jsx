import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminCreateCategory.css";

export default function AdminEditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const response = await api.get("/categories");
        const categories = Array.isArray(response.data) ? response.data : [];
        const category = categories.find((item) => String(item.id) === String(id));

        if (!category) {
          toast.error("Категория не найдена");
          navigate("/catalog");
          return;
        }

        setName(category.name || "");
      } catch (err) {
        console.error("Ошибка загрузки категории:", err);
        toast.error("Не удалось загрузить категорию");
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Введите название категории");
      return;
    }

    try {
      setSubmitting(true);

      await api.put(`/categories/${id}`, {
        name: name.trim(),
      });

      toast.success("Категория успешно обновлена");
      navigate("/catalog");
    } catch (err) {
      console.error("Ошибка обновления категории:", err);
      toast.error("Не удалось обновить категорию");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Удалить эту категорию?");
    if (!confirmed) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success("Категория удалена");
      navigate("/catalog");
    } catch (err) {
      console.error("Ошибка удаления категории:", err);
      toast.error("Не удалось удалить категорию");
    }
  };

  if (loading) {
    return <h1 className="catalog-title">Загрузка...</h1>;
  }

  return (
    <section className="admin-category-page">
      <div className="admin-category-card">
        <h1>Редактировать категорию</h1>

        <form className="admin-category-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Название категории"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Сохраняем..." : "Сохранить изменения"}
          </button>

          <button
            type="button"
            className="admin-category-delete-btn"
            onClick={handleDelete}
          >
            Удалить категорию
          </button>
        </form>
      </div>
    </section>
  );
}