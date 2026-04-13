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
      await api.put("/profile", {
        email,
      });

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
    return <h1 className="profile-title">Загрузка...</h1>;
  }

  return (
    <section className="profile-page">
      <h1 className="profile-title">Профиль</h1>

      <div className="profile-grid">
        {/* ОБНОВЛЕНИЕ ПРОФИЛЯ */}
        <form className="profile-card" onSubmit={handleUpdateProfile}>
          <h2>Данные</h2>

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="profile-btn">
            Сохранить
          </button>
        </form>

        {/* СМЕНА ПАРОЛЯ */}
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
            Изменить пароль
          </button>
        </form>
      </div>
    </section>
  );
}