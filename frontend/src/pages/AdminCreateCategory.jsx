import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminCreateCategory.css";

export default function AdminCreateCategory() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Введите название категории");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/categories", {
        name: name.trim(),
      });

      toast.success("Категория успешно создана");
      navigate("/catalog");
    } catch (err) {
      console.error("Ошибка создания категории:", err);
      toast.error("Не удалось создать категорию");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-category-page">
      <div className="admin-category-card">
        <h1>Добавить категорию</h1>

        <form className="admin-category-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Название категории"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Создаем..." : "Создать категорию"}
          </button>
        </form>
      </div>
    </section>
  );
}