import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import AdminNav from "../components/AdminNav";
import "./AdminIntegrations.css";

export default function AdminIntegrations() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({
    direction: "import",
    entity_type: "catalog",
    entity_id: "",
  });

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get("/integrations/1c/status");
      setStatus(response.data);
    } catch (err) {
      console.error("Ошибка загрузки статуса 1C:", err);
      toast.error("Не удалось загрузить статус 1C");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSync = async (e) => {
    e.preventDefault();

    try {
      setSyncing(true);
      await api.post("/integrations/1c/sync", {
        direction: form.direction,
        entity_type: form.entity_type,
        entity_id: form.entity_id.trim() || null,
        payload: {
          source: "admin-panel",
        },
      });
      toast.success("Задача синхронизации 1C создана");
      await loadStatus();
    } catch (err) {
      console.error("Ошибка создания синхронизации:", err);
      toast.error(err.response?.data?.detail || "Не удалось создать задачу");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="admin-integration-page">
      <div className="admin-integration-shell">
        <div className="admin-integration-heading">
          <div className="admin-integration-badge">Admin / 1C</div>
          <h1>Интеграция с 1C</h1>
          <p>
            Заготовка под обмен каталогом, остатками, ценами и заказами. Сейчас
            задачи сохраняются в журнал, обработчик 1C подключается отдельным
            модулем.
          </p>
        </div>

        <AdminNav />

        <div className="admin-integration-grid">
          <div className="admin-integration-card">
            <div className="admin-integration-card-head">
              <span>Статус</span>
              <strong>
                {loading
                  ? "Загрузка..."
                  : status?.is_configured
                  ? "Настроено"
                  : "Заготовка"}
              </strong>
            </div>

            <p>
              Система: <b>{status?.system || "1c"}</b>
            </p>

            <div className="admin-integration-tags">
              {(status?.supported_entities || []).map((entity) => (
                <span key={entity}>{entity}</span>
              ))}
            </div>
          </div>

          <div className="admin-integration-card">
            <div className="admin-integration-card-head">
              <span>Новая задача</span>
              <strong>Создать sync</strong>
            </div>

            <form className="admin-integration-form" onSubmit={handleCreateSync}>
              <label>
                Направление
                <select
                  name="direction"
                  value={form.direction}
                  onChange={handleChange}
                >
                  <option value="import">Импорт из 1C</option>
                  <option value="export">Экспорт в 1C</option>
                </select>
              </label>

              <label>
                Сущность
                <select
                  name="entity_type"
                  value={form.entity_type}
                  onChange={handleChange}
                >
                  <option value="catalog">Каталог</option>
                  <option value="products">Товары</option>
                  <option value="stock">Остатки</option>
                  <option value="prices">Цены</option>
                  <option value="orders">Заказы</option>
                </select>
              </label>

              <label>
                ID сущности
                <input
                  name="entity_id"
                  type="text"
                  value={form.entity_id}
                  onChange={handleChange}
                  placeholder="Необязательно"
                />
              </label>

              <button type="submit" disabled={syncing}>
                {syncing ? "Создание..." : "Создать задачу"}
              </button>
            </form>
          </div>
        </div>

        <div className="admin-integration-card admin-integration-card--logs">
          <div className="admin-integration-card-head">
            <span>Журнал</span>
            <strong>Последние задачи</strong>
          </div>

          <div className="admin-integration-log-list">
            {(status?.last_logs || []).length === 0 ? (
              <p>Журнал синхронизации пока пуст.</p>
            ) : (
              status.last_logs.map((log) => (
                <div className="admin-integration-log" key={log.id}>
                  <div>
                    <strong>
                      {log.direction} / {log.entity_type}
                    </strong>
                    <span>{log.message || "Без сообщения"}</span>
                  </div>
                  <em>{log.status}</em>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
