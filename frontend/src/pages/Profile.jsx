import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import PasswordInput from "../components/PasswordInput";
import "./Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    city: "",
    delivery_address: "",
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
        phone: data.phone || "",
        company: data.company || "",
        city: data.city || "",
        delivery_address: data.delivery_address || "",
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
    if (!first && !last) return profileForm.email?.[0]?.toUpperCase() || "U";
    return `${first}${last}`.toUpperCase();
  }, [profileForm]);

  const fullName = useMemo(() => {
    const name = `${profileForm.first_name || ""} ${profileForm.last_name || ""}`.trim();
    return name || "Личный кабинет";
  }, [profileForm]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);
      const payload = {
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || null,
        company: profileForm.company.trim() || null,
        city: profileForm.city.trim() || null,
        delivery_address: profileForm.delivery_address.trim() || null,
      };

      const response = await api.put("/profile", payload);
      setProfile(response.data);
      setProfileForm({
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        company: response.data.company || "",
        city: response.data.city || "",
        delivery_address: response.data.delivery_address || "",
      });
      toast.success("Профиль обновлен");
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
      await api.put("/profile/password", passwordForm);
      setPasswordForm({ current_password: "", new_password: "" });
      toast.success("Пароль обновлен");
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
            <button className="profile-btn" onClick={loadProfile}>Попробовать снова</button>
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
              Данные клиента используются для заказов, счетов и доставки.
            </p>
            <div className="profile-meta">
              <span className="profile-meta__email">{profileForm.email}</span>
              <span className="profile-chip">{profile?.role || "client"}</span>
              <span className="profile-chip">{profile?.is_active ? "Активен" : "Неактивен"}</span>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>Профиль клиента</h2>
              <p>Контакты, компания и адрес доставки для B2B-заказов</p>
            </div>

            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="profile-form__row">
                <div className="profile-field">
                  <label htmlFor="first_name">Имя</label>
                  <input id="first_name" name="first_name" value={profileForm.first_name} onChange={handleProfileChange} disabled={savingProfile} required />
                </div>
                <div className="profile-field">
                  <label htmlFor="last_name">Фамилия</label>
                  <input id="last_name" name="last_name" value={profileForm.last_name} onChange={handleProfileChange} disabled={savingProfile} required />
                </div>
              </div>

              <div className="profile-form__row">
                <div className="profile-field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={profileForm.email} onChange={handleProfileChange} disabled={savingProfile} required />
                </div>
                <div className="profile-field">
                  <label htmlFor="phone">Телефон</label>
                  <input id="phone" name="phone" type="tel" placeholder="+7 777 000 00 00" value={profileForm.phone} onChange={handleProfileChange} disabled={savingProfile} />
                </div>
              </div>

              <div className="profile-form__row">
                <div className="profile-field">
                  <label htmlFor="company">Компания</label>
                  <input id="company" name="company" placeholder="Название компании" value={profileForm.company} onChange={handleProfileChange} disabled={savingProfile} />
                </div>
                <div className="profile-field">
                  <label htmlFor="city">Город</label>
                  <input id="city" name="city" placeholder="Алматы" value={profileForm.city} onChange={handleProfileChange} disabled={savingProfile} />
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="delivery_address">Адрес доставки</label>
                <textarea id="delivery_address" name="delivery_address" placeholder="Город, улица, дом, офис или склад" value={profileForm.delivery_address} onChange={handleProfileChange} disabled={savingProfile} />
              </div>

              <div className="profile-stats">
                <div className="profile-stat"><span>ID</span><strong>{profile?.id ?? "-"}</strong></div>
                <div className="profile-stat"><span>Роль</span><strong>{profile?.role ?? "client"}</strong></div>
                <div className="profile-stat"><span>Статус</span><strong>{profile?.is_active ? "Активен" : "Неактивен"}</strong></div>
              </div>

              <button type="submit" className="profile-btn" disabled={savingProfile}>
                {savingProfile ? "Сохраняем..." : "Сохранить профиль"}
              </button>
            </form>
          </div>

          <div className="profile-card">
            <div className="profile-card__header">
              <h2>Безопасность</h2>
              <p>Обновите пароль для доступа к личному кабинету</p>
            </div>

            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <PasswordInput
                label="Текущий пароль"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                placeholder="Введите текущий пароль"
                required
              />
              <PasswordInput
                label="Новый пароль"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                placeholder="Введите новый пароль"
                required
              />
              <button type="submit" className="profile-btn" disabled={savingPassword}>
                {savingPassword ? "Обновляем..." : "Обновить пароль"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
