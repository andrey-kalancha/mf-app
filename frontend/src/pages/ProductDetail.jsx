import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { isAdmin, isAuthenticated } from "../services/auth";
import toast from "react-hot-toast";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => {
        console.error("Ошибка:", err);
        setError("Не удалось загрузить товар");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      toast("Сначала войдите в аккаунт");
      navigate("/login");
      return;
    }

    try {
      await api.post("/cart/items", {
        product_id: product.id,
        quantity: 1,
      });

      toast.success("Товар добавлен в корзину");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка добавления");
    }
  };

  if (loading) {
    return (
      <section className="product-detail-page">
        <div className="product-detail-shell">
          <div className="product-detail-breadcrumbs">
            <span>Каталог</span>
            <span className="product-detail-breadcrumbs__sep">/</span>
            <span>Загрузка</span>
          </div>

          <div className="product-detail-card product-detail-card--loading">
            <div className="product-detail-image product-detail-skeleton" />
            <div className="product-detail-info">
              <div className="product-detail-skeleton product-detail-skeleton--title" />
              <div className="product-detail-skeleton product-detail-skeleton--text" />
              <div className="product-detail-skeleton product-detail-skeleton--text short" />
              <div className="product-detail-skeleton product-detail-skeleton--price" />
              <div className="product-detail-skeleton product-detail-skeleton--sku" />
              <div className="product-detail-actions">
                <div className="product-detail-skeleton product-detail-skeleton--button" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="product-detail-page">
        <div className="product-detail-shell">
          <div className="product-state-card">
            <h1 className="product-state-title">Ошибка загрузки</h1>
            <p className="product-state-text">{error}</p>
            <Link to="/catalog" className="product-detail-btn">
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-detail-page">
        <div className="product-detail-shell">
          <div className="product-state-card">
            <h1 className="product-state-title">Товар не найден</h1>
            <p className="product-state-text">
              Возможно, товар был удалён или ссылка устарела.
            </p>
            <Link to="/catalog" className="product-detail-btn">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="product-detail-page">
      <div className="product-detail-shell">
        <div className="product-detail-breadcrumbs">
          <Link to="/catalog">Каталог</Link>
          <span className="product-detail-breadcrumbs__sep">/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail-card">
          <div className="product-detail-image-wrap">
            <div className="product-detail-image">
              <span className="product-detail-image__label">MFA</span>
              <span className="product-detail-image__placeholder">Нет фото</span>
            </div>
          </div>

          <div className="product-detail-info">
            <div className="product-detail-badge">Карточка товара</div>

            <h1 className="product-detail-title">{product.name}</h1>

            {product.description ? (
              <p className="product-detail-description">{product.description}</p>
            ) : (
              <p className="product-detail-description product-detail-description--muted">
                Описание для этого товара пока не добавлено.
              </p>
            )}

            <div className="product-detail-meta">
              <div className="product-detail-meta__item">
                <span className="product-detail-meta__label">Цена</span>
                <span className="product-detail-price">{product.price} ₽</span>
              </div>

              <div className="product-detail-meta__item">
                <span className="product-detail-meta__label">Артикул</span>
                <span className="product-detail-sku">{product.sku}</span>
              </div>
            </div>

            <div className="product-detail-actions">
              <button className="product-detail-btn" onClick={handleAddToCart}>
                Добавить в корзину
              </button>

              <Link to="/catalog" className="product-detail-btn product-detail-btn-secondary">
                Назад в каталог
              </Link>

              {isAdmin() && (
                <Link
                  to={`/admin/products/edit/${product.id}`}
                  className="product-detail-btn product-detail-btn-secondary"
                >
                  Редактировать
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}