import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminCreateCategory.css";
import AdminNav from "../components/AdminNav";

export default function AdminCreateCategory() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Введите название категории");
      return;
    }

    try {
      setLoading(true);
      await api.post("/categories", { name: name.trim() });
      toast.success("Категория создана");
      navigate("/admin");
    } catch (err) {
      console.error("Ошибка создания категории:", err);
      toast.error("Не удалось создать категорию");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-category-page">
      <div className="admin-category-shell">
        <div className="admin-category-heading">
          <div className="admin-category-badge">Admin panel</div>
          <h1 className="admin-category-title">Создание категории</h1>
          <p className="admin-category-subtitle">
            Добавьте новую категорию для каталога
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
                placeholder="Например: Кухонная фурнитура"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Создаём..." : "Создать категорию"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}