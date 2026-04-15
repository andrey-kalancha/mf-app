import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import "./Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const loadProfile = async () => {
    try {
      const res = await api.get("/profile");
      setProfile(res.data);
      setEmail(res.data.email || "");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка загрузки профиля");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      await api.put("/profile", { email });
      toast.success("Профиль обновлен");
      loadProfile();
    } catch (err) {
      console.error(err);
      toast.error("Ошибка обновления профиля");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error("Заполни все поля");
      return;
    }

    try {
      await api.put("/profile/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast.success("Пароль изменен");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка смены пароля");
    }
  };

  if (loading) {
    return <h1 className="profile-page__title">Загрузка...</h1>;
  }

  const profileLetter = profile?.email ? profile.email[0].toUpperCase() : "U";

  return (
    <section className="profile-page">
      <div className="profile-page__header">
        <div className="profile-page__avatar">{profileLetter}</div>

        <div>
          <h1 className="profile-page__title">Профиль</h1>
          <p className="profile-page__subtitle">
            Управление данными аккаунта и безопасностью
          </p>
        </div>
      </div>

      <div className="profile-page__grid">
        <form className="profile-card" onSubmit={handleUpdateProfile}>
          <h2>Основные данные</h2>

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="profile-card__meta">
            <span>ID: {profile?.id ?? "—"}</span>
            <span>Роль: {profile?.role || "user"}</span>
          </div>

          <button type="submit" className="profile-btn">
            Сохранить изменения
          </button>
        </form>

        <form className="profile-card" onSubmit={handleChangePassword}>
          <h2>Смена пароля</h2>

          <label>Текущий пароль</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <label>Новый пароль</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button type="submit" className="profile-btn">
            Обновить пароль
          </button>
        </form>
      </div>
    </section>
  );
}