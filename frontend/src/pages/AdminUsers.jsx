import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminUsers.css";
import AdminNav from "../components/AdminNav";

const ROLE_OPTIONS = [
  { value: "client", label: "Client" },
  { value: "admin", label: "Admin" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState(null);
  const [togglingActiveId, setTogglingActiveId] = useState(null);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");
      const usersData = Array.isArray(response.data) ? response.data : [];

      setUsers(usersData);

      const nextDrafts = {};
      usersData.forEach((user) => {
        nextDrafts[user.id] = user.role || "client";
      });
      setRoleDrafts(nextDrafts);
    } catch (err) {
      console.error("Ошибка загрузки пользователей:", err);
      setError("Не удалось загрузить пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleDraftChange = (userId, value) => {
    setRoleDrafts((prev) => ({
      ...prev,
      [userId]: value,
    }));
  };

  const handleSaveRole = async (userId) => {
    const nextRole = roleDrafts[userId];

    try {
      setSavingRoleId(userId);

      await api.patch(`/users/${userId}/role`, {
        role: nextRole,
      });

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: nextRole } : user
        )
      );

      toast.success("Роль пользователя обновлена");
    } catch (err) {
      console.error("Ошибка обновления роли:", err);
      toast.error("Не удалось обновить роль");
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleToggleActive = async (user) => {
    const nextActive = !user.is_active;

    try {
      setTogglingActiveId(user.id);

      await api.patch(`/users/${user.id}/active`, {
        is_active: nextActive,
      });

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, is_active: nextActive } : item
        )
      );

      toast.success(
        nextActive
          ? "Пользователь активирован"
          : "Пользователь деактивирован"
      );
    } catch (err) {
      console.error("Ошибка изменения активности:", err);
      toast.error("Не удалось изменить активность");
    } finally {
      setTogglingActiveId(null);
    }
  };

  if (loading) {
    return (
      <section className="admin-users-page">
        <div className="admin-users-shell">
          <div className="admin-users-heading">
            <div className="admin-users-badge">Admin panel</div>
            <div className="admin-users-skeleton admin-users-skeleton--title" />
            <div className="admin-users-skeleton admin-users-skeleton--text" />
          </div>

          <div className="admin-users-list">
            {[1, 2, 3].map((item) => (
              <div className="admin-user-card" key={item}>
                <div className="admin-user-card__main">
                  <div className="admin-users-skeleton admin-users-skeleton--user-title" />
                  <div className="admin-users-skeleton admin-users-skeleton--user-meta" />
                </div>
                <div className="admin-user-card__controls">
                  <div className="admin-users-skeleton admin-users-skeleton--select" />
                  <div className="admin-users-skeleton admin-users-skeleton--button" />
                  <div className="admin-users-skeleton admin-users-skeleton--button secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-users-page">
        <div className="admin-users-shell">
          <div className="admin-users-state">
            <h1 className="admin-users-state__title">Ошибка загрузки</h1>
            <p className="admin-users-state__text">{error}</p>
            <button className="admin-users-btn" onClick={loadUsers}>
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-users-page">
      <div className="admin-users-shell">
        <div className="admin-users-heading">
          <div className="admin-users-badge">Admin panel</div>
          <h1 className="admin-users-title">Управление пользователями</h1>
          <p className="admin-users-subtitle">
            Меняйте роли пользователей и управляйте доступом к аккаунтам
          </p>
        </div>

        <AdminNav />

        {users.length === 0 ? (
          <div className="admin-users-state">
            <div className="admin-users-state__icon">👤</div>
            <h2 className="admin-users-state__title">Пользователи не найдены</h2>
            <p className="admin-users-state__text">
              Когда пользователи зарегистрируются, они появятся здесь.
            </p>
          </div>
        ) : (
          <div className="admin-users-list">
            {users.map((user) => {
              const currentRole = user.role || "client";
              const draftRole = roleDrafts[user.id] || currentRole;
              const roleChanged = draftRole !== currentRole;
              const isSavingRole = savingRoleId === user.id;
              const isToggling = togglingActiveId === user.id;
              const isActive = Boolean(user.is_active);

              return (
                <div className="admin-user-card" key={user.id}>
                  <div className="admin-user-card__main">
                    <div className="admin-user-card__topline">
                      <h2>{user.email || `Пользователь #${user.id}`}</h2>

                      <div className="admin-user-card__badges">
                        <span
                          className={`admin-user-badge ${
                            currentRole === "admin"
                              ? "admin-user-badge--admin"
                              : "admin-user-badge--client"
                          }`}
                        >
                          {currentRole}
                        </span>

                        <span
                          className={`admin-user-badge ${
                            isActive
                              ? "admin-user-badge--active"
                              : "admin-user-badge--inactive"
                          }`}
                        >
                          {isActive ? "active" : "inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="admin-user-card__meta">
                      <span>
                        ID: <strong>{user.id}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="admin-user-card__controls">
                    <div className="admin-user-field">
                      <label htmlFor={`role-${user.id}`}>Роль</label>
                      <select
                        id={`role-${user.id}`}
                        value={draftRole}
                        onChange={(e) =>
                          handleRoleDraftChange(user.id, e.target.value)
                        }
                        disabled={isSavingRole}
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="admin-users-btn"
                      onClick={() => handleSaveRole(user.id)}
                      disabled={!roleChanged || isSavingRole}
                    >
                      {isSavingRole ? "Сохраняем..." : "Сохранить роль"}
                    </button>

                    <button
                      className={`admin-users-btn admin-users-btn--secondary ${
                        !isActive ? "admin-users-btn--danger" : ""
                      }`}
                      onClick={() => handleToggleActive(user)}
                      disabled={isToggling}
                    >
                      {isToggling
                        ? "Обновляем..."
                        : isActive
                        ? "Деактивировать"
                        : "Активировать"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}