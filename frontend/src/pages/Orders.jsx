import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Orders.css";

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
            const price = Number(product.price || 0);
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

      const total = normalizedItems.reduce((sum, item) => sum + item.total, 0);

      return {
        ...order,
        normalizedItems,
        total,
      };
    });
  }, [orders, productsMap]);

  if (loading) {
    return <h1 className="orders-title">Загрузка заказов...</h1>;
  }

  if (error) {
    return <h1 className="orders-title">{error}</h1>;
  }

  return (
    <section className="orders-page">
      <h1 className="orders-title">Мои заказы</h1>

      {normalizedOrders.length === 0 ? (
        <p className="orders-empty">У вас пока нет заказов</p>
      ) : (
        <div className="orders-list">
          {normalizedOrders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-card__header">
                <div>
                  <h2>Заказ #{order.id}</h2>
                  <p>Статус: {order.status || "new"}</p>
                </div>

                <div className="order-card__total">
                  <span>Сумма</span>
                  <strong>{order.total} ₽</strong>
                </div>
              </div>

              <div className="order-items">
                {order.normalizedItems.map((item) => (
                  <div className="order-item" key={item.id}>
                    <div className="order-item__info">
                      <h3>{item.name}</h3>
                      <p>Артикул: {item.sku || "—"}</p>
                    </div>

                    <div className="order-item__meta">
                      <span>{item.price} ₽</span>
                      <span>× {item.quantity}</span>
                      <strong>{item.total} ₽</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}