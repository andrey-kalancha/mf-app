import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { emitCartUpdated } from "../services/cart";
import { getProductPrice } from "../services/pricing";
import "./ProductDetail.css";

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

function formatSpecKey(key) {
  const labels = {
    soft_close: "Доводчик",
    push_to_open: "Push to open",
    opening_angle: "Угол открывания",
    mounting_type: "Тип монтажа",
    material: "Материал",
    thickness: "Толщина",
    height: "Высота",
    width: "Ширина",
    depth: "Глубина",
    length: "Длина",
    side: "Сторона",
    load_capacity_kg: "Нагрузка, кг",
    horizontal_adjustment_mm: "Регулировка по горизонтали, мм",
    vertical_adjustment_mm: "Регулировка по вертикали, мм",
  };

  if (labels[key]) return labels[key];

  const readable = String(key)
    .replace(/([a-zа-яё])([A-ZА-ЯЁ])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  if (!readable) return "Параметр";
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

function formatSpecValue(value) {
  if (typeof value === "boolean") return value ? "Да" : "Нет";
  if (Array.isArray(value)) return value.map(formatSpecValue).filter(Boolean).join(", ");
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, nestedValue]) => {
        const formattedValue = formatSpecValue(nestedValue);
        return formattedValue ? `${formatSpecKey(key)}: ${formattedValue}` : "";
      })
      .filter(Boolean)
      .join("; ");
  }
  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

function getPlaceholderImage(categoryName) {
  return categoryPlaceholders[categoryName] || "/catalog-assets/generated/opening-systems.png";
}

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productResponse = await api.get(`/products/${id}`);
        const productData = productResponse.data;
        setProduct(productData);

        try {
          const productPricing = await getProductPrice(productData.id);
          setPricing(productPricing);
        } catch (err) {
          console.error("Ошибка загрузки персональной цены:", err);
          setPricing(null);
        }

        if (productData.category_id) {
          try {
            const categoryResponse = await api.get(`/categories/${productData.category_id}`);
            setCategory(categoryResponse.data);
          } catch (err) {
            console.error("Ошибка загрузки категории:", err);
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки товара:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const lineLabel = useMemo(() => getLineLabel(product?.line), [product]);

  const imageGallery = useMemo(() => {
    const images = Array.isArray(product?.images) ? [...product.images] : [];
    images.sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    if (images.length > 0) return images;
    if (product?.image_url) {
      return [{ id: "legacy-main", image_url: product.image_url, alt_text: product.name, is_primary: true }];
    }
    if (product) {
      return [{ id: "placeholder", image_url: getPlaceholderImage(category?.name), alt_text: product.name, is_primary: true }];
    }
    return [];
  }, [category?.name, product]);

  useEffect(() => {
    if (imageGallery.length > 0) setSelectedImage(imageGallery[0].image_url);
  }, [imageGallery]);

  const specificationEntries = useMemo(() => {
    if (!product?.specifications || typeof product.specifications !== "object" || Array.isArray(product.specifications)) return [];
    return Object.entries(product.specifications)
      .map(([key, value]) => ({ key, label: formatSpecKey(key), value: formatSpecValue(value) }))
      .filter((item) => item.value);
  }, [product]);

  const technicalPassport = useMemo(() => {
    if (!product) return [];
    return [
      { label: "Категория", value: category?.name },
      { label: "Бренд", value: product.brand || "Lanttich" },
      { label: "Линейка", value: lineLabel },
      { label: "Артикул", value: product.sku },
      { label: "Размер", value: product.size_label },
      { label: "Цвет", value: product.color },
      { label: "Покрытие", value: product.coating },
      { label: "Нагрузка", value: product.load_capacity },
      { label: "Упаковка", value: product.pack_quantity ? `${product.pack_quantity} шт.` : "" },
      { label: "Вес", value: product.weight_grams ? `${product.weight_grams} г` : "" },
      { label: "Наличие", value: product.in_stock ? "В наличии" : "Под заказ" },
    ].filter((item) => item.value);
  }, [category, lineLabel, product]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await api.post("/cart/items", { product_id: product.id, quantity: 1 });
      emitCartUpdated();
      toast.success("Товар добавлен в корзину");
    } catch (err) {
      console.error("Ошибка добавления в корзину:", err);
      toast.error(err.response?.data?.detail || "Не удалось добавить товар в корзину");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <section className="product-detail-page">
        <div className="product-detail-shell">
          <div className="product-detail-loading">Загрузка товара...</div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-detail-page">
        <div className="product-detail-shell">
          <div className="product-detail-empty">
            <h1>Товар не найден</h1>
            <p>Возможно, эта позиция была удалена или временно недоступна.</p>
            <Link to="/catalog" className="product-detail-btn product-detail-btn--secondary">Вернуться в каталог</Link>
          </div>
        </div>
      </section>
    );
  }

  const displayPrice = pricing?.unit_price ?? product.price;
  const basePrice = Number(pricing?.base_price ?? product.price ?? 0);
  const hasPersonalPrice = pricing?.price_source && pricing.price_source !== "base";

  return (
    <section className="product-detail-page">
      <div className="product-detail-shell">
        <div className="product-detail-breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to="/catalog">Каталог</Link>
          {category?.name && (
            <>
              <span>/</span>
              <span>{category.name}</span>
            </>
          )}
        </div>

        <div className="product-detail-card">
          <div className="product-detail-media">
            <img
              src={selectedImage}
              alt={product.name}
              className="product-detail-image"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.parentElement?.querySelector(".product-detail-image-fallback");
                if (fallback) fallback.style.display = "flex";
              }}
            />

            <div className="product-detail-image-fallback" style={{ display: "none" }}>
              <span>{product.brand || "Lanttich"}</span>
              <strong>{category?.name || "Мебельная фурнитура"}</strong>
            </div>

            <div className="product-detail-badges">
              {lineLabel && <span className="product-detail-badge">{lineLabel}</span>}
              <span className={product.in_stock ? "product-detail-stock product-detail-stock--in" : "product-detail-stock product-detail-stock--out"}>
                {product.in_stock ? "В наличии" : "Под заказ"}
              </span>
            </div>

            {imageGallery.length > 1 && (
              <div className="product-detail-gallery">
                {imageGallery.map((image) => (
                  <button
                    type="button"
                    key={image.id}
                    className={selectedImage === image.image_url ? "product-detail-thumb active" : "product-detail-thumb"}
                    onClick={() => setSelectedImage(image.image_url)}
                  >
                    <img src={image.image_url} alt={image.alt_text || product.name} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-content">
            <div className="product-detail-meta">
              <span>{product.brand || "Lanttich"}</span>
              {category?.name && <span>{category.name}</span>}
              {product.sku && <span>Артикул: {product.sku}</span>}
            </div>

            <h1 className="product-detail-title">{product.name}</h1>
            {product.description && <p className="product-detail-description">{product.description}</p>}

            <div className="product-detail-highlights">
              {product.size_label && <div className="product-detail-highlight"><span>Размер</span><strong>{product.size_label}</strong></div>}
              {product.load_capacity && <div className="product-detail-highlight"><span>Нагрузка</span><strong>{product.load_capacity}</strong></div>}
              {product.pack_quantity && <div className="product-detail-highlight"><span>В упаковке</span><strong>{product.pack_quantity} шт.</strong></div>}
              {product.weight_grams && <div className="product-detail-highlight"><span>Вес</span><strong>{product.weight_grams} г</strong></div>}
            </div>

            <div className="product-detail-price-row">
              <div className="product-detail-price-block">
                <span>Цена</span>
                <strong>{formatPrice(displayPrice)}</strong>
                {hasPersonalPrice && basePrice > Number(displayPrice || 0) && <em>{formatPrice(basePrice)}</em>}
                {hasPersonalPrice && <small>Персональная цена клиента</small>}
              </div>

              <button className="product-detail-btn" onClick={handleAddToCart} disabled={addingToCart}>
                {addingToCart ? "Добавление..." : "Добавить в корзину"}
              </button>
            </div>

            <div className="product-detail-table">
              {technicalPassport.slice(0, 8).map((item) => (
                <div className="product-detail-table__row" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {specificationEntries.length > 0 && (
          <div className="product-detail-specs-card">
            <div className="product-detail-specs-card__header">
              <div className="product-detail-specs-badge">Характеристики</div>
              <h2>Технические параметры</h2>
              <p>Параметры приведены в едином формате: ключи из snake_case преобразованы в читаемые названия, boolean-значения показаны как “Да” или “Нет”.</p>
            </div>

            <div className="product-detail-specs-grid">
              {specificationEntries.map((spec) => (
                <div className="product-detail-spec-item" key={spec.key}>
                  <span>{spec.label}</span>
                  <strong>{spec.value}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(product.drawings) && product.drawings.length > 0 && (
          <div className="product-detail-drawings-card">
            <div className="product-detail-specs-card__header">
              <div className="product-detail-specs-badge">Чертежи</div>
              <h2>Файлы и монтажные материалы</h2>
              <p>Чертежи можно использовать для подбора, согласования и закупки.</p>
            </div>

            <div className="product-detail-drawings-grid">
              {product.drawings.map((drawing) => (
                <a key={drawing.id} href={drawing.file_url} target="_blank" rel="noreferrer" className="product-detail-drawing-item">
                  <strong>{drawing.title}</strong>
                  {drawing.description && <p>{drawing.description}</p>}
                  <span>Открыть файл</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="product-detail-passport-card">
          <div className="product-detail-specs-card__header">
            <div className="product-detail-specs-badge">Техническая карта</div>
            <h2>Данные для подбора и закупки</h2>
            <p>Основные параметры собраны в одном блоке, чтобы позицию было удобно сверять с заказом, счётом или спецификацией производства.</p>
          </div>

          <div className="product-detail-passport-grid">
            {technicalPassport.map((item) => (
              <div className="product-detail-passport-item" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="product-detail-b2b-card">
          <div>
            <span>Для B2B-заказа</span>
            <h2>Нужны чертёж, счёт или подбор аналога?</h2>
            <p>Отправьте артикул менеджеру: он уточнит наличие, подготовит спецификацию, счёт и документы для поставки по Казахстану.</p>
          </div>

          <div className="product-detail-b2b-actions">
            <Link to="/b2b" className="product-detail-btn">B2B условия</Link>
            <Link to="/contacts" className="product-detail-btn product-detail-btn--secondary">Связаться</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
