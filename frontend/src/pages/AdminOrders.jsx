import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminOrders.css";
import AdminNav from "../components/AdminNav";

const STATUS_OPTIONS = [
  { value: "new", label: "Новый" },
  { value: "processing", label: "В обработке" },
  { value: "shipped", label: "Отправлен" },
  { value: "canceled", label: "Отменён" },
];

const STATUS_LABELS = {
  new: "Новый",
  processing: "В обработке",
  shipped: "Отправлен",
  canceled: "Отменён",
};

function getStatusClass(status) {
  switch (status) {
    case "processing":
      return "admin-order-status admin-order-status--processing";
    case "shipped":
      return "admin-order-status admin-order-status--shipped";
    case "canceled":
      return "admin-order-status admin-order-status--canceled";
    case "new":
    default:
      return "admin-order-status admin-order-status--new";
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const ordersResponse = await api.get("/orders");
      const ordersData = Array.isArray(ordersResponse.data)
        ? ordersResponse.data
        : [];

      setOrders(ordersData);

      const productIds = [
        ...new Set(
          ordersData.flatMap((order) =>
            Array.isArray(order.items)
              ? order.items.map((item) => item.product_id)
              : []
          )
        ),
      ];

      const userIds = [
        ...new Set(
          ordersData
            .map((order) => order.user_id)
            .filter((userId) => userId !== undefined && userId !== null)
        ),
      ];

      const [productResponses, userResponses] = await Promise.all([
        productIds.length > 0
          ? Promise.all(productIds.map((productId) => api.get(`/products/${productId}`)))
          : Promise.resolve([]),
        userIds.length > 0
          ? Promise.all(
              userIds.map((userId) =>
                api.get(`/users/${userId}`).catch(() => null)
              )
            )
          : Promise.resolve([]),
      ]);

      const nextProductsMap = {};
      productResponses.forEach((response) => {
        if (!response?.data) return;
        const product = response.data;
        nextProductsMap[product.id] = product;
      });

      const nextUsersMap = {};
      userResponses.forEach((response) => {
        if (!response?.data) return;
        const user = response.data;
        nextUsersMap[user.id] = user;
      });

      setProductsMap(nextProductsMap);
      setUsersMap(nextUsersMap);

      const nextDrafts = {};
      ordersData.forEach((order) => {
        nextDrafts[order.id] = order.status || "new";
      });
      setStatusDrafts(nextDrafts);
    } catch (err) {
      console.error("Ошибка загрузки заказов:", err);
      setError("Не удалось загрузить список заказов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const normalizedOrders = useMemo(() => {
    return orders.map((order) => {
      const normalizedItems = Array.isArray(order.items)
        ? order.items.map((item) => {
            const product = productsMap[item.product_id] || {};
            const price = Number(
              item.price ??
                product.price ??
                0
            );
            const quantity = Number(item.quantity || 1);

            return {
              id: item.id,
              productId: item.product_id,
              name: product.name || `Товар #${item.product_id}`,
              sku: product.sku || "",
              price,
              quantity,
              total: price * quantity,
            };
          })
        : [];

      const total =
        Number(order.total_amount) ||
        normalizedItems.reduce((sum, item) => sum + item.total, 0);

      const totalCount = normalizedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        ...order,
        normalizedItems,
        total,
        totalCount,
        userEmail:
          usersMap[order.user_id]?.email ||
          `Пользователь #${order.user_id ?? "—"}`,
      };
    });
  }, [orders, productsMap, usersMap]);

  const handleDraftChange = (orderId, value) => {
    setStatusDrafts((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  const handleSaveStatus = async (orderId) => {
    const nextStatus = statusDrafts[orderId];

    try {
      setSavingId(orderId);

      await api.patch(`/orders/${orderId}/status`, {
        status: nextStatus,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: nextStatus } : order
        )
      );

      toast.success("Статус заказа обновлён");
    } catch (err) {
      console.error("Ошибка обновления статуса:", err);
      toast.error("Не удалось обновить статус");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <section className="admin-orders-page">
        <div className="admin-orders-shell">
          <div className="admin-orders-heading">
            <div className="admin-orders-badge">Admin panel</div>
            <div className="admin-orders-skeleton admin-orders-skeleton--title" />
            <div className="admin-orders-skeleton admin-orders-skeleton--text" />
          </div>

          <div className="admin-orders-list">
            {[1, 2].map((item) => (
              <div className="admin-order-card" key={item}>
                <div className="admin-order-card__header">
                  <div className="admin-order-card__main">
                    <div className="admin-orders-skeleton admin-orders-skeleton--order-title" />
                    <div className="admin-orders-skeleton admin-orders-skeleton--meta" />
                  </div>
                  <div className="admin-order-card__sum">
                    <div className="admin-orders-skeleton admin-orders-skeleton--sum" />
                  </div>
                </div>

                <div className="admin-order-card__controls">
                  <div className="admin-orders-skeleton admin-orders-skeleton--select" />
                  <div className="admin-orders-skeleton admin-orders-skeleton--button" />
                </div>

                <div className="admin-order-items">
                  {[1, 2].map((sub) => (
                    <div className="admin-order-item" key={sub}>
                      <div className="admin-orders-skeleton admin-orders-skeleton--item-title" />
                      <div className="admin-orders-skeleton admin-orders-skeleton--item-meta" />
                    </div>
                  ))}
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
      <section className="admin-orders-page">
        <div className="admin-orders-shell">
          <div className="admin-orders-state">
            <h1 className="admin-orders-state__title">Ошибка загрузки</h1>
            <p className="admin-orders-state__text">{error}</p>
            <button className="admin-orders-btn" onClick={loadOrders}>
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-orders-page">
      <div className="admin-orders-shell">
        <div className="admin-orders-heading">
          <div className="admin-orders-badge">Admin panel</div>
          <h1 className="admin-orders-title">Управление заказами</h1>
          <p className="admin-orders-subtitle">
            Просмотр всех заказов и изменение их статусов
          </p>
        </div>

        <AdminNav />

        {normalizedOrders.length === 0 ? (
          <div className="admin-orders-state">
            <div className="admin-orders-state__icon">📦</div>
            <h2 className="admin-orders-state__title">Заказов пока нет</h2>
            <p className="admin-orders-state__text">
              Как только пользователи начнут оформлять покупки, они появятся здесь.
            </p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {normalizedOrders.map((order) => {
              const currentStatus = order.status || "new";
              const draftStatus = statusDrafts[order.id] || currentStatus;
              const isChanged = draftStatus !== currentStatus;
              const isSaving = savingId === order.id;

              return (
                <div className="admin-order-card" key={order.id}>
                  <div className="admin-order-card__header">
                    <div className="admin-order-card__main">
                      <div className="admin-order-card__topline">
                        <h2>Заказ #{order.id}</h2>
                        <span className={getStatusClass(currentStatus)}>
                          {STATUS_LABELS[currentStatus] || currentStatus}
                        </span>
                      </div>

                      <div className="admin-order-card__meta">
                        <span>
                          Клиент: <strong>{order.userEmail}</strong>
                        </span>
                        <span>
                          User ID: <strong>{order.user_id ?? "—"}</strong>
                        </span>
                        <span>
                          Товаров: <strong>{order.totalCount}</strong>
                        </span>
                        <span>
                          Позиций: <strong>{order.normalizedItems.length}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="admin-order-card__sum">
                      <span>Сумма заказа</span>
                      <strong>{order.total} ₽</strong>
                    </div>
                  </div>

                  <div className="admin-order-card__controls">
                    <div className="admin-order-field">
                      <label htmlFor={`status-${order.id}`}>Статус заказа</label>
                      <select
                        id={`status-${order.id}`}
                        value={draftStatus}
                        onChange={(e) =>
                          handleDraftChange(order.id, e.target.value)
                        }
                        disabled={isSaving}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="admin-orders-btn"
                      onClick={() => handleSaveStatus(order.id)}
                      disabled={!isChanged || isSaving}
                    >
                      {isSaving ? "Сохраняем..." : "Сохранить статус"}
                    </button>
                  </div>

                  <div className="admin-order-items">
                    {order.normalizedItems.length === 0 ? (
                      <div className="admin-order-item admin-order-item--empty">
                        У этого заказа нет товаров
                      </div>
                    ) : (
                      order.normalizedItems.map((item) => (
                        <div className="admin-order-item" key={item.id}>
                          <div className="admin-order-item__info">
                            <div className="admin-order-item__badge">Товар</div>
                            <h3>{item.name}</h3>
                            <p>Артикул: {item.sku || "—"}</p>
                          </div>

                          <div className="admin-order-item__meta">
                            <span>{item.price} ₽</span>
                            <span>× {item.quantity}</span>
                            <strong>{item.total} ₽</strong>
                          </div>
                        </div>
                      ))
                    )}
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