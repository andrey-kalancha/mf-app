import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { setToken } from "../services/auth";
import "./Login.css";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("username", form.email);
      params.append("password", form.password);
      params.append("grant_type", "password");

      const response = await api.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const token = response.data.access_token;

      setToken(token);
      toast.success("Вы успешно вошли");
      navigate("/catalog");
      window.location.reload();
    } catch (err) {
      console.error("Ошибка логина:", err);
      setError("Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Вход</h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Входим..." : "Войти"}
        </button>

        <p className="login-switch">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </section>
  );
}