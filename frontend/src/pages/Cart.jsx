import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Cart.css";
import toast from "react-hot-toast";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordering, setOrdering] = useState(false);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const cartResponse = await api.get("/cart");
      const cartData = cartResponse.data;
      setCart(cartData);

      const items = Array.isArray(cartData.items) ? cartData.items : [];
      const uniqueProductIds = [...new Set(items.map((item) => item.product_id))];

      if (uniqueProductIds.length === 0) {
        setProductsMap({});
        return;
      }

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
  const totalCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await api.put(`/cart/items/${itemId}`, {
        quantity: newQuantity,
      });

      await loadCart();
    } catch (err) {
      console.error("Ошибка обновления количества:", err);
      toast.error("Не удалось изменить количество");
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      toast.success("Товар удалён из корзины");
      await loadCart();
    } catch (err) {
      console.error("Ошибка удаления товара:", err);
      toast.error("Не удалось удалить товар");
    }
  };

  const handleCreateOrder = async () => {
    const items = Array.isArray(cart?.items) ? cart.items : [];

    if (items.length === 0) {
      toast.error("Корзина пуста");
      return;
    }

    try {
      setOrdering(true);

      const orderData = {
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      await api.post("/orders", orderData);

      await Promise.all(items.map((item) => api.delete(`/cart/items/${item.id}`)));

      toast.success("Заказ успешно оформлен!");
      await loadCart();
    } catch (err) {
      console.error("Ошибка заказа:", err);
      toast.error("Ошибка при оформлении заказа");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <section className="cart-page">
        <div className="cart-shell">
          <div className="cart-heading">
            <div className="cart-badge">MF APP</div>
            <div className="cart-skeleton cart-skeleton--title" />
            <div className="cart-skeleton cart-skeleton--text" />
          </div>

          <div className="cart-layout">
            <div className="cart-items">
              {[1, 2, 3].map((item) => (
                <div className="cart-item cart-item--loading" key={item}>
                  <div className="cart-skeleton cart-skeleton--image" />
                  <div className="cart-item__info">
                    <div className="cart-skeleton cart-skeleton--item-title" />
                    <div className="cart-skeleton cart-skeleton--item-text" />
                    <div className="cart-skeleton cart-skeleton--item-text short" />
                  </div>
                  <div className="cart-item__meta">
                    <div className="cart-skeleton cart-skeleton--price" />
                    <div className="cart-skeleton cart-skeleton--qty" />
                    <div className="cart-skeleton cart-skeleton--total" />
                    <div className="cart-skeleton cart-skeleton--btn" />
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <div className="cart-skeleton cart-skeleton--summary-title" />
              <div className="cart-skeleton cart-skeleton--summary-row" />
              <div className="cart-skeleton cart-skeleton--summary-row" />
              <div className="cart-skeleton cart-skeleton--summary-total" />
              <div className="cart-skeleton cart-skeleton--summary-btn" />
            </aside>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="cart-page">
        <div className="cart-shell">
          <div className="cart-state-card">
            <h1 className="cart-state-title">Ошибка загрузки</h1>
            <p className="cart-state-text">{error}</p>
            <button className="cart-order-btn" onClick={loadCart}>
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="cart-shell">
        <div className="cart-heading">
          <h1 className="cart-title">Корзина</h1>
          <p className="cart-subtitle">
            Проверьте товары перед оформлением заказа
          </p>
        </div>

        {normalizedItems.length === 0 ? (
          <div className="cart-state-card">
            <div className="cart-empty-icon">🛒</div>
            <h2 className="cart-state-title">Корзина пока пуста</h2>
            <p className="cart-state-text">
              Добавьте товары из каталога, чтобы оформить заказ.
            </p>
            <Link to="/catalog" className="cart-order-btn cart-order-btn--link">
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {normalizedItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item__image-wrap">
                    <div className="cart-item__image">Нет фото</div>
                  </div>

                  <div className="cart-item__info">
                    <div className="cart-item__badge">Товар</div>
                    <h3>{item.name}</h3>

                    {item.description ? (
                      <p>{item.description}</p>
                    ) : (
                      <p className="cart-item__muted">
                        Описание для этого товара пока не добавлено.
                      </p>
                    )}

                    <span>Артикул: {item.sku || "—"}</span>
                  </div>

                  <div className="cart-item__meta">
                    <p className="cart-item__price">{item.price} ₽</p>

                    <div className="cart-qty">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                        aria-label="Уменьшить количество"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                        aria-label="Увеличить количество"
                      >
                        +
                      </button>
                    </div>

                    <strong className="cart-item__total">{item.total} ₽</strong>

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
              <div className="cart-summary__badge">Ваш заказ</div>
              <h2>Итого</h2>

              <div className="cart-summary__rows">
                <div className="cart-summary__row">
                  <span>Товаров</span>
                  <strong>{totalCount}</strong>
                </div>

                <div className="cart-summary__row">
                  <span>Позиций</span>
                  <strong>{normalizedItems.length}</strong>
                </div>
              </div>

              <div className="cart-summary__total">
                <span>Общая сумма</span>
                <strong>{total} ₽</strong>
              </div>

              <button
                className="cart-order-btn"
                onClick={handleCreateOrder}
                disabled={ordering}
              >
                {ordering ? "Оформляем..." : "Оформить заказ"}
              </button>

              <Link to="/catalog" className="cart-back-link">
                Продолжить покупки
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}