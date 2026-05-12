import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { emitCartUpdated } from "../services/cart";
import "./Cart.css";

const priceSourceLabels = {
  base: "Базовая цена каталога",
  price_list_discount: "Цена по персональной скидке",
  price_list_item: "Персональная цена клиента",
};

function formatPrice(value) {
  const amount = Number(value || 0);
  if (amount <= 0) return "Цена по запросу";
  return `${amount.toLocaleString("ru-RU")} ₸`;
}

function getCategoryLabel(product) {
  if (product.category?.name) return product.category.name;
  if (product.category_name) return product.category_name;
  if (typeof product.category === "string") return product.category;
  return "";
}

function getPrimaryImage(product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    const primary = product.images.find((image) => image.is_primary) || product.images[0];
    if (primary?.image_url) return primary.image_url;
  }
  return product.image_url || "";
}

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [profile, setProfile] = useState(null);
  const [productsMap, setProductsMap] = useState({});
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordering, setOrdering] = useState(false);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const [cartResponse, profileResponse] = await Promise.all([
        api.get("/cart"),
        api.get("/profile").catch(() => null),
      ]);

      const cartData = cartResponse.data;
      const profileData = profileResponse?.data || null;
      setCart(cartData);
      setProfile(profileData);
      setDeliveryAddress(profileData?.delivery_address || "");

      emitCartUpdated(
        Array.isArray(cartData.items)
          ? cartData.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
          : 0
      );

      const items = Array.isArray(cartData.items) ? cartData.items : [];
      const uniqueProductIds = [...new Set(items.map((item) => item.product_id))];

      if (uniqueProductIds.length === 0) {
        setProductsMap({});
        return;
      }

      const productResponses = await Promise.all(
        uniqueProductIds.map((productId) => api.get(`/products/${productId}`))
      );

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
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unit_price ?? product.price ?? 0);
      const basePrice = Number(item.base_price ?? product.price ?? unitPrice);
      const totalPrice = Number(item.total_price ?? unitPrice * quantity);

      return {
        id: item.id,
        itemId: item.id,
        productId: item.product_id,
        name: product.name || `Товар #${item.product_id}`,
        description: product.description || "",
        sku: product.sku || "",
        brand: product.brand || "Lanttich",
        categoryName: getCategoryLabel(product),
        imageUrl: getPrimaryImage(product),
        quantity,
        unitPrice,
        basePrice,
        totalPrice,
        priceSource: item.price_source || "base",
      };
    });
  }, [cart, productsMap]);

  const total = Number(cart?.total_amount ?? normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0));
  const totalCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
      await loadCart();
    } catch (err) {
      console.error("Ошибка обновления количества:", err);
      toast.error("Не удалось изменить количество");
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      toast.success("Товар удален из корзины");
      await loadCart();
    } catch (err) {
      console.error("Ошибка удаления товара:", err);
      toast.error("Не удалось удалить товар");
    }
  };

  const handleCreateOrder = async () => {
    if (normalizedItems.length === 0) {
      toast.error("Корзина пустая");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("Укажите адрес доставки");
      return;
    }

    try {
      setOrdering(true);
      await api.post("/orders/from-cart", {
        delivery_address: deliveryAddress.trim(),
      });
      emitCartUpdated(0);
      toast.success("Заказ успешно оформлен");
      await loadCart();
    } catch (err) {
      console.error("Ошибка заказа:", err);
      toast.error(err.response?.data?.detail || "Ошибка при оформлении заказа");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <section className="cart-page">
        <div className="cart-shell">
          <div className="cart-heading">
            <div className="cart-skeleton cart-skeleton--title" />
            <div className="cart-skeleton cart-skeleton--text" />
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
            <button className="cart-order-btn" onClick={loadCart}>Попробовать снова</button>
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
            Проверьте позиции, адрес доставки и оформите заказ. Персональные цены применяются автоматически.
          </p>
        </div>

        {normalizedItems.length === 0 ? (
          <div className="cart-state-card">
            <div className="cart-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 4H5L7.2 14.2C7.3 14.7 7.75 15 8.25 15H17.6C18.08 15 18.5 14.68 18.63 14.21L20.4 8H6.1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="19" r="1.6" fill="currentColor" />
                <circle cx="17" cy="19" r="1.6" fill="currentColor" />
              </svg>
            </div>
            <h2 className="cart-state-title">Корзина пока пустая</h2>
            <p className="cart-state-text">Добавьте товары из каталога, чтобы оформить заказ.</p>
            <Link to="/catalog" className="cart-order-btn cart-order-btn--link">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {normalizedItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item__image-wrap">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="cart-item__image" />
                    ) : (
                      <div className="cart-item__image cart-item__image--fallback">
                        <span>{item.brand}</span>
                        <strong>{item.categoryName || "Мебельная фурнитура"}</strong>
                      </div>
                    )}
                  </div>

                  <div className="cart-item__info">
                    <div className="cart-item__badge">{item.categoryName || "Товар каталога"}</div>
                    <h3>{item.name}</h3>
                    <p>{item.description || "Описание для этой позиции пока не добавлено."}</p>
                    <span>Артикул: {item.sku || "-"}</span>
                  </div>

                  <div className="cart-item__meta">
                    <div className="cart-item__price-block">
                      <p className="cart-item__price">{formatPrice(item.unitPrice)}</p>
                      {item.basePrice > item.unitPrice && <p className="cart-item__price-old">{formatPrice(item.basePrice)}</p>}
                      <span className="cart-item__price-note">{priceSourceLabels[item.priceSource] || "Цена каталога"}</span>
                    </div>

                    <div className="cart-qty">
                      <button type="button" onClick={() => updateQuantity(item.itemId, item.quantity - 1)} aria-label="Уменьшить количество">-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.itemId, item.quantity + 1)} aria-label="Увеличить количество">+</button>
                    </div>

                    <strong className="cart-item__total">{formatPrice(item.totalPrice)}</strong>
                    <button className="cart-remove-btn" onClick={() => removeItem(item.itemId)}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <div className="cart-summary__badge">Ваш заказ</div>
              <h2>Итого</h2>

              <div className="cart-summary__rows">
                <div className="cart-summary__row"><span>Товаров</span><strong>{totalCount}</strong></div>
                <div className="cart-summary__row"><span>Позиций</span><strong>{normalizedItems.length}</strong></div>
                <div className="cart-summary__row"><span>Клиент</span><strong>{profile?.company || profile?.email || "B2B"}</strong></div>
              </div>

              <div className="cart-delivery">
                <label htmlFor="delivery_address">Адрес доставки</label>
                <textarea
                  id="delivery_address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Город, улица, дом, офис или склад"
                />
                <Link to="/profile">Изменить данные клиента в профиле</Link>
              </div>

              <div className="cart-summary__total">
                <span>Общая сумма</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              <p className="cart-summary__hint">
                В заказе фиксируются текущие цены, данные клиента и адрес доставки.
              </p>

              <button className="cart-order-btn" onClick={handleCreateOrder} disabled={ordering}>
                {ordering ? "Оформляем..." : "Оформить заказ"}
              </button>
              <Link to="/catalog" className="cart-back-link">Продолжить покупки</Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
