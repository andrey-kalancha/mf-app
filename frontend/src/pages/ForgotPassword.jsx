import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Введите email");
      return;
    }

    toast.success("Запрос отправлен");
  };

  return (
    <section className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-header">
         
          <h1>Восстановление пароля</h1>
          <p>
            Пока автоматический сброс не подключён. Оставьте email, чтобы знать,
            для какого аккаунта нужно восстановление.
          </p>
        </div>

        <form className="forgot-form" onSubmit={handleSubmit}>
          <div className="forgot-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="forgot-btn">
            Отправить запрос
          </button>
        </form>

        <div className="forgot-note">
          Для полноценного восстановления позже можно добавить отправку письма с
          ссылкой для сброса пароля.
        </div>

        <div className="forgot-footer">
          <Link to="/login">Вернуться ко входу</Link>
        </div>
      </div>
    </section>
  );
}