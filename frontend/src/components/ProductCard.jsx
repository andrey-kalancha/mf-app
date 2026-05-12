import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { isAuthenticated } from "../services/auth";
import { emitCartUpdated } from "../services/cart";
import "./ProductCard.css";

const categoryPlaceholders = {
  "Системы открывания": "/catalog-assets/generated/opening-systems.png",
  "Системы выдвижения": "/catalog-assets/generated/drawer-systems.png",
  Посудосушители: "/catalog-assets/generated/dish-dryers.png",
  Бутылочницы: "/catalog-assets/generated/bottle-holders.png",
  "Крепежная фурнитура": "/catalog-assets/generated/fasteners.png",
  "Комплектующие для шкафов": "/catalog-assets/generated/wardrobe-components.png",
};

function formatPrice(value) {
  const num = Number(value || 0);
  if (num <= 0) return "Цена по запросу";
  return `${num.toLocaleString("ru-RU")} ₸`;
}

function getLineLabel(line) {
  switch ((line || "").toLowerCase()) {
    case "standard":
      return "Standard";
    case "maxima":
      return "Maxima";
    case "promax":
      return "Promax";
    default:
      return "";
  }
}

function getCategoryLabel(product, categoryName) {
  if (categoryName) return categoryName;
  if (product.category?.name) return product.category.name;
  if (product.category_name) return product.category_name;
  if (typeof product.category === "string") return product.category;
  return "";
}

function getPlaceholderImage(categoryLabel) {
  return categoryPlaceholders[categoryLabel] || "/catalog-assets/generated/opening-systems.png";
}

function getPrimaryImage(product, categoryLabel) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    const sorted = [...product.images].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
    if (sorted[0]?.image_url) return sorted[0].image_url;
  }

  return product.image_url || getPlaceholderImage(categoryLabel);
}

export default function ProductCard({ product, categoryName, pricing = null }) {
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);

  const {
    id,
    name,
    price,
    sku,
    brand,
    line,
    in_stock,
    size_label,
    load_capacity,
    color,
    drawings,
  } = product;

  const lineLabel = getLineLabel(line);
  const categoryLabel = getCategoryLabel(product, categoryName);
  const displayImageUrl = getPrimaryImage(product, categoryLabel);
  const hasDrawings = Array.isArray(drawings) && drawings.length > 0;
  const displayPrice = pricing?.unit_price ?? price;
  const basePrice = Number(pricing?.base_price ?? price ?? 0);
  const hasPersonalPrice = pricing?.price_source && pricing.price_source !== "base";

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      toast("Войдите, чтобы добавить товар в корзину");
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);
      await api.post("/cart/items", { product_id: id, quantity: 1 });
      emitCartUpdated();
      toast.success("Товар добавлен в корзину");
    } catch (error) {
      console.error("Ошибка добавления товара в корзину:", error);
      toast.error(error.response?.data?.detail || "Не удалось добавить товар в корзину");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <article className="product-card">
      <Link to={`/product/${id}`} className="product-card__image-link">
        <img
          src={displayImageUrl}
          alt={name}
          className="product-card__image"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.parentElement?.querySelector(".product-card__image-fallback");
            if (fallback) fallback.style.display = "flex";
          }}
        />

        <div className="product-card__image-fallback" style={{ display: "none" }}>
          <span>{brand || "Lanttich"}</span>
          <strong>{categoryLabel || "Мебельная фурнитура"}</strong>
        </div>

        <div className="product-card__badges">
          {lineLabel && <span className="product-card__badge">{lineLabel}</span>}
          <span className={in_stock ? "product-card__stock product-card__stock--in" : "product-card__stock product-card__stock--out"}>
            {in_stock ? "В наличии" : "Под заказ"}
          </span>
        </div>
      </Link>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{brand || "Lanttich"}</span>
          {sku && <span>Артикул: {sku}</span>}
        </div>

        <Link to={`/product/${id}`} className="product-card__title-link">
          <h3 className="product-card__title">{name}</h3>
        </Link>

        <div className="product-card__specs">
          {size_label && <span className="product-card__spec">Размер: {size_label}</span>}
          {load_capacity && <span className="product-card__spec">Нагрузка: {load_capacity}</span>}
          {color && <span className="product-card__spec">Цвет: {color}</span>}
          {!size_label && !load_capacity && !color && (
            <span className="product-card__spec">
              {categoryLabel ? `Категория: ${categoryLabel}` : "Мебельная фурнитура"}
            </span>
          )}
          {hasDrawings && <span className="product-card__spec">Есть чертежи и технические файлы</span>}
        </div>

        <div className="product-card__footer">
          <div className="product-card__price-block">
            <div className="product-card__price">{formatPrice(displayPrice)}</div>
            {hasPersonalPrice && basePrice > Number(displayPrice || 0) && (
              <div className="product-card__old-price">{formatPrice(basePrice)}</div>
            )}
            {hasPersonalPrice && <div className="product-card__price-note">Персональная цена</div>}
          </div>

          <div className="product-card__actions">
            <button
              type="button"
              className="product-card__btn product-card__btn--ghost"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? "Добавление..." : "В корзину"}
            </button>

            <Link to={`/product/${id}`} className="product-card__btn">
              Подробнее
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
