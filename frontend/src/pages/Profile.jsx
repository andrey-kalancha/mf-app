import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import "./Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/profile");
      const data = response.data;

      setProfile(data);
      setProfileForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
      });
    } catch (err) {
      console.error("Ошибка загрузки профиля:", err);
      setError("Не удалось загрузить профиль");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const initials = useMemo(() => {
    const first = profileForm.first_name?.trim()?.[0] || "";
    const last = profileForm.last_name?.trim()?.[0] || "";

    if (!first && !last) {
      return profileForm.email?.[0]?.toUpperCase() || "U";
    }

    return `${first}${last}`.toUpperCase();
  }, [profileForm]);

  const fullName = useMemo(() => {
    const first = profileForm.first_name?.trim() || "";
    const last = profileForm.last_name?.trim() || "";
    return `${first} ${last}`.trim() || "Пользователь";
  }, [profileForm]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);

      const payload = {
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        email: profileForm.email.trim(),
      };

      const response = await api.put("/profile", payload);
      const updated = response.data;

      setProfile(updated);
      setProfileForm({
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
        email: updated.email || "",
      });

      toast.success("Профиль обновлён");
    } catch (err) {
      console.error("Ошибка обновления профиля:", err);
      toast.error(err.response?.data?.detail || "Не удалось обновить профиль");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.current_password || !passwordForm.new_password) {
      toast.error("Заполните поля пароля");
      return;
    }

    try {
      setSavingPassword(true);

      await api.put("/profile/password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      setPasswordForm({
        current_password: "",
        new_password: "",
      });

      toast.success("Пароль обновлён");
    } catch (err) {
      console.error("Ошибка смены пароля:", err);
      toast.error(err.response?.data?.detail || "Не удалось обновить пароль");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <section className="profile-page">
        <div className="profile-shell">
          <div className="profile-skeleton profile-skeleton--hero" />
          <div className="profile-grid">
            <div className="profile-skeleton profile-skeleton--card" />
            <div className="profile-skeleton profile-skeleton--card" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="profile-page">
        <div className="profile-shell">
          <div className="profile-state-card">
            <h1 className="profile-state-title">Ошибка загрузки</h1>
            <p className="profile-state-text">{error}</p>
            <button className="profile-btn" onClick={loadProfile}>
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-shell">
        <div className="profile-hero">
          <div className="profile-avatar">{initials}</div>

          <div className="profile-hero__content">
           
            <h1 className="profile-title">{fullName}</h1>
            <p className="profile-subtitle">
              Управление данными аккаунта и безопасностью
            </p>

            <div className="profile-meta">
              <span>{profileForm.email}</span>
              <span className="profile-role-badge">
                {profile?.role || "client"}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>Основные данные</h2>
              <p>Измените личную информацию аккаунта</p>
            </div>

            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="profile-form__row">
                <div className="profile-field">
                  <label htmlFor="first_name">Имя</label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={profileForm.first_name}
                    onChange={handleProfileChange}
                    disabled={savingProfile}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="last_name">Фамилия</label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={profileForm.last_name}
                    onChange={handleProfileChange}
                    disabled={savingProfile}
                    required
                  />
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  disabled={savingProfile}
                  required
                />
              </div>

              <div className="profile-info">
                <span>ID: {profile?.id}</span>
                <span>Роль: {profile?.role}</span>
                <span>
                  Статус: {profile?.is_active ? "Активен" : "Неактивен"}
                </span>
              </div>

              <button
                type="submit"
                className="profile-btn"
                disabled={savingProfile}
              >
                {savingProfile ? "Сохраняем..." : "Сохранить изменения"}
              </button>
            </form>
          </div>

          <div className="profile-card">
            <div className="profile-card__header">
              <h2>Смена пароля</h2>
              <p>Обновите пароль для защиты аккаунта</p>
            </div>

            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <div className="profile-field">
                <label htmlFor="current_password">Текущий пароль</label>
                <input
                  id="current_password"
                  name="current_password"
                  type="password"
                  value={passwordForm.current_password}
                  onChange={handlePasswordChange}
                  disabled={savingPassword}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="new_password">Новый пароль</label>
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  disabled={savingPassword}
                  required
                />
              </div>

              <button
                type="submit"
                className="profile-btn"
                disabled={savingPassword}
              >
                {savingPassword ? "Обновляем..." : "Обновить пароль"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}