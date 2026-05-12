import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Orders.css";

const statusLabels = {
  new: "Новый",
  processing: "В обработке",
  shipped: "Отправлен",
  canceled: "Отменён",
};

function formatPrice(value) {
  const amount = Number(value || 0);
  if (amount <= 0) {
    return "Цена по запросу";
  }

  return `${amount.toLocaleString("ru-RU")} ₸`;
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatusClassName(status) {
  switch (status) {
    case "processing":
      return "order-status order-status--processing";
    case "shipped":
      return "order-status order-status--shipped";
    case "canceled":
      return "order-status order-status--canceled";
    case "new":
    default:
      return "order-status order-status--new";
  }
}

function getPrimaryImage(product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    const primary =
      product.images.find((image) => image.is_primary) || product.images[0];

    if (primary?.image_url) {
      return primary.image_url;
    }
  }

  return product.image_url || "";
}

function getCategoryLabel(product) {
  if (product.category?.name) return product.category.name;
  if (product.category_name) return product.category_name;
  if (typeof product.category === "string") return product.category;
  return "";
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const ordersResponse = await api.get("/orders/my");
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

      if (productIds.length === 0) {
        setProductsMap({});
        return;
      }

      const productResponses = await Promise.all(
        productIds.map((productId) => api.get(`/products/${productId}`))
      );

      const nextProductsMap = {};
      productResponses.forEach((response) => {
        const product = response.data;
        nextProductsMap[product.id] = product;
      });

      setProductsMap(nextProductsMap);
    } catch (err) {
      console.error("Ошибка загрузки заказов:", err);
      setError("Не удалось загрузить заказы");
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
            const unitPrice = Number(item.price || 0);
            const quantity = Number(item.quantity || 1);
            const currentCatalogPrice = Number(product.price || 0);

            return {
              id: item.id,
              productId: item.product_id,
              name: product.name || `Товар #${item.product_id}`,
              sku: product.sku || "",
              brand: product.brand || "Lanttich",
              categoryName: getCategoryLabel(product),
              imageUrl: getPrimaryImage(product),
              price: unitPrice,
              quantity,
              total: unitPrice * quantity,
              hasChangedPrice:
                currentCatalogPrice > 0 &&
                Math.abs(currentCatalogPrice - unitPrice) > 0.009,
            };
          })
        : [];

      const total = Number(
        order.total_amount ??
          normalizedItems.reduce((sum, item) => sum + item.total, 0)
      );
      const totalCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...order,
        normalizedItems,
        total,
        totalCount,
        createdLabel: formatDate(order.created_at),
      };
    });
  }, [orders, productsMap]);

  if (loading) {
    return (
      <section className="orders-page">
        <div className="orders-shell">
          <div className="orders-heading">
            <div className="orders-badge">MF APP</div>
            <div className="orders-skeleton orders-skeleton--title" />
            <div className="orders-skeleton orders-skeleton--text" />
          </div>

          <div className="orders-list">
            {[1, 2].map((item) => (
              <div className="order-card order-card--loading" key={item}>
                <div className="order-card__header">
                  <div className="order-card__header-left">
                    <div className="orders-skeleton orders-skeleton--order-title" />
                    <div className="orders-skeleton orders-skeleton--status" />
                  </div>
                  <div className="order-card__total">
                    <div className="orders-skeleton orders-skeleton--sum-label" />
                    <div className="orders-skeleton orders-skeleton--sum-value" />
                  </div>
                </div>

                <div className="order-items">
                  {[1, 2].map((subItem) => (
                    <div className="order-item" key={subItem}>
                      <div className="order-item__info">
                        <div className="orders-skeleton orders-skeleton--item-title" />
                        <div className="orders-skeleton orders-skeleton--item-text" />
                      </div>
                      <div className="order-item__meta">
                        <div className="orders-skeleton orders-skeleton--meta" />
                        <div className="orders-skeleton orders-skeleton--meta" />
                        <div className="orders-skeleton orders-skeleton--meta total" />
                      </div>
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
      <section className="orders-page">
        <div className="orders-shell">
          <div className="orders-state-card">
            <h1 className="orders-state-title">Ошибка загрузки</h1>
            <p className="orders-state-text">{error}</p>
            <button className="orders-primary-btn" onClick={loadOrders}>
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="orders-page">
      <div className="orders-shell">
        <div className="orders-heading">
          <h1 className="orders-title">Мои заказы</h1>
          <p className="orders-subtitle">
            Здесь сохраняются оформленные вами заказы с зафиксированной ценой на
            момент покупки.
          </p>
        </div>

        {normalizedOrders.length === 0 ? (
          <div className="orders-state-card">
            <div className="orders-empty-icon">📦</div>
            <h2 className="orders-state-title">У вас пока нет заказов</h2>
            <p className="orders-state-text">
              Перейдите в каталог, выберите товары и оформите первый заказ.
            </p>
            <Link to="/catalog" className="orders-primary-btn orders-primary-btn--link">
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {normalizedOrders.map((order) => {
              const status = order.status || "new";

              return (
                <div className="order-card" key={order.id}>
                  <div className="order-card__header">
                    <div className="order-card__header-left">
                      <div className="order-card__topline">
                        <h2>Заказ #{order.id}</h2>
                        <span className={getStatusClassName(status)}>
                          {statusLabels[status] || status}
                        </span>
                      </div>

                      <p>
                        Товаров: <strong>{order.totalCount}</strong> · Позиций:{" "}
                        <strong>{order.normalizedItems.length}</strong>
                        {order.createdLabel && (
                          <>
                            {" "}· Дата: <strong>{order.createdLabel}</strong>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="order-card__total">
                      <span>Сумма заказа</span>
                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                  </div>

                  {order.delivery_address && (
                    <div className="order-delivery">
                      <span>Адрес доставки</span>
                      <strong>{order.delivery_address}</strong>
                    </div>
                  )}

                  <div className="order-items">
                    {order.normalizedItems.map((item) => (
                      <div className="order-item" key={item.id}>
                        <div className="order-item__media">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="order-item__image"
                            />
                          ) : (
                            <div className="order-item__image order-item__image--fallback">
                              <span>{item.brand}</span>
                              <strong>
                                {item.categoryName || "Мебельная фурнитура"}
                              </strong>
                            </div>
                          )}
                        </div>

                        <div className="order-item__info">
                          <div className="order-item__badge">
                            {item.categoryName || "Товар каталога"}
                          </div>
                          <h3>{item.name}</h3>
                          <p>Артикул: {item.sku || "—"}</p>
                        </div>

                        <div className="order-item__meta">
                          <span>{formatPrice(item.price)}</span>
                          <span>× {item.quantity}</span>
                          <strong>{formatPrice(item.total)}</strong>
                          {item.hasChangedPrice && (
                            <span className="order-item__price-note">
                              Цена в заказе зафиксирована
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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
