import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Cart.css";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const cartResponse = await api.get("/cart");
      const cartData = cartResponse.data;
      setCart(cartData);

      const items = Array.isArray(cartData.items) ? cartData.items : [];
      const uniqueProductIds = [...new Set(items.map((item) => item.product_id))];

      const productRequests = uniqueProductIds.map((productId) =>
        api.get(`/products/${productId}`)
      );

      const productResponses = await Promise.all(productRequests);

      const nextProductsMap = {};
      productResponses.forEach((response) => {
        const product = response.data;
        nextProductsMap[product.id] = product;
      });

      setProductsMap(nextProductsMap);
    } catch (err) {
      console.error("Ошибка загрузки корзины:", err);
      setError("Не удалось загрузить корзину");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const normalizedItems = useMemo(() => {
    const items = Array.isArray(cart?.items) ? cart.items : [];

    return items.map((item) => {
      const product = productsMap[item.product_id] || {};

      const price = Number(product.price || 0);
      const quantity = Number(item.quantity || 1);

      return {
        id: item.id,
        itemId: item.id,
        productId: item.product_id,
        name: product.name || `Товар #${item.product_id}`,
        description: product.description || "",
        sku: product.sku || "",
        price,
        quantity,
        total: price * quantity,
      };
    });
  }, [cart, productsMap]);

  const total = normalizedItems.reduce((sum, item) => sum + item.total, 0);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await api.put(`/cart/items/${itemId}`, {
        quantity: newQuantity,
      });

      await loadCart();
    } catch (err) {
      console.error("Ошибка обновления количества:", err);
      alert("Не удалось изменить количество");
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      await loadCart();
    } catch (err) {
      console.error("Ошибка удаления товара:", err);
      alert("Не удалось удалить товар");
    }
  };

  if (loading) {
    return <h1 className="cart-title">Загрузка корзины...</h1>;
  }

  if (error) {
    return <h1 className="cart-title">{error}</h1>;
  }

  return (
    <section className="cart-page">
      <h1 className="cart-title">Корзина</h1>

      {normalizedItems.length === 0 ? (
        <p className="cart-empty">Корзина пока пуста</p>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {normalizedItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item__image">Нет фото</div>

                <div className="cart-item__info">
                  <h3>{item.name}</h3>
                  {item.description && <p>{item.description}</p>}
                  <span>Артикул: {item.sku || "—"}</span>
                </div>

                <div className="cart-item__meta">
                  <p>{item.price} ₽</p>

                  <div className="cart-qty">
                    <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)}>
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>
                      +
                    </button>
                  </div>

                  <strong>{item.total} ₽</strong>

                  <button
                    className="cart-remove-btn"
                    onClick={() => removeItem(item.itemId)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h2>Итого</h2>
            <p>{total} ₽</p>
            <button className="cart-order-btn">Оформить заказ</button>
          </aside>
        </div>
      )}
    </section>
  );
}