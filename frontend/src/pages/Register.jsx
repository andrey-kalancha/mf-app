import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import PasswordInput from "../components/PasswordInput";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    acceptPolicy: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.acceptPolicy) {
      toast.error("Подтвердите согласие с политикой конфиденциальности");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      toast.success("Регистрация успешна");
      navigate("/login");
    } catch (err) {
      console.error("Ошибка регистрации:", err);
      toast.error(err.response?.data?.detail || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Создание аккаунта</h1>
          <p>Заполните данные для регистрации</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-row">
            <div className="auth-field">
              <label htmlFor="first_name">Имя</label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                placeholder="Введите имя"
                value={form.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="last_name">Фамилия</label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                placeholder="Введите фамилию"
                value={form.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="example@mail.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <PasswordInput
            label="Пароль"
            name="password"
            placeholder="Введите пароль"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label className="auth-checkbox">
            <input
              type="checkbox"
              name="acceptPolicy"
              checked={form.acceptPolicy}
              onChange={handleChange}
            />
            <span>
              Я согласен с{" "}
              <Link to="/privacy-policy">политикой конфиденциальности</Link>
            </span>
          </label>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? "Создаем..." : "Зарегистрироваться"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Уже есть аккаунт?</span>
          <Link to="/login">Войти</Link>
        </div>
      </div>
    </section>
  );
}
