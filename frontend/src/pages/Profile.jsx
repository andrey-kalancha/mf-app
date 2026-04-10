import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { removeToken } from "../services/auth";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (err) {
        console.error("Ошибка загрузки профиля:", err);
        setError("Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
    window.location.reload();
  };

  if (loading) {
    return <h1 className="profile-title">Загрузка профиля...</h1>;
  }

  if (error) {
    return <h1 className="profile-title">{error}</h1>;
  }

  return (
    <section className="profile-page">
      <div className="profile-card">
        <h1 className="profile-title">Профиль</h1>

        <div className="profile-info">
          <div className="profile-row">
            <span>Email</span>
            <strong>{user?.email || "—"}</strong>
          </div>

          <div className="profile-row">
            <span>ID</span>
            <strong>{user?.id || "—"}</strong>
          </div>

          <div className="profile-row">
            <span>Роль</span>
            <strong>
              {user?.is_admin === true
                ? "Администратор"
                : user?.role || "Пользователь"}
            </strong>
          </div>
        </div>

        <button className="profile-logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </section>
  );
}