import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminCreateCategory.css";
import AdminNav from "../components/AdminNav";

export default function AdminEditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/categories/${id}`);
        setName(response.data?.name || "");
      } catch (err) {
        console.error("Ошибка загрузки категории:", err);
        toast.error("Не удалось загрузить категорию");
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Введите название категории");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/categories/${id}`, { name: name.trim() });
      toast.success("Категория обновлена");
      navigate("/admin");
    } catch (err) {
      console.error("Ошибка обновления категории:", err);
      toast.error("Не удалось обновить категорию");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Удалить категорию?");
    if (!confirmed) return;

    try {
      setDeleting(true);
      await api.delete(`/categories/${id}`);
      toast.success("Категория удалена");
      navigate("/admin");
    } catch (err) {
      console.error("Ошибка удаления категории:", err);
      toast.error("Не удалось удалить категорию");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="admin-category-page">
        <div className="admin-category-shell">
          <div className="admin-category-card">
            <h1 className="admin-category-title">Загрузка...</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-category-page">
      <div className="admin-category-shell">
        <div className="admin-category-heading">
          <div className="admin-category-badge">Admin panel</div>
          <h1 className="admin-category-title">Редактирование категории</h1>
          <p className="admin-category-subtitle">
            Измените данные категории или удалите её
          </p>
        </div>

        <AdminNav />

        <div className="admin-category-card">
          <form className="admin-category-form" onSubmit={handleSubmit}>
            <div className="admin-category-field">
              <label htmlFor="category-name">Название категории</label>
              <input
                id="category-name"
                type="text"
                placeholder="Название категории"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving || deleting}
              />
            </div>

            <button type="submit" disabled={saving || deleting}>
              {saving ? "Сохраняем..." : "Сохранить изменения"}
            </button>

            <button
              type="button"
              className="admin-category-delete-btn"
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? "Удаляем..." : "Удалить категорию"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}