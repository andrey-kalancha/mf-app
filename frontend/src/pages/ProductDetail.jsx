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
    return <h1 className="product-detail-title">Загрузка...</h1>;
  }

  if (error) {
    return <h1 className="product-detail-title">{error}</h1>;
  }

  if (!product) {
    return <h1 className="product-detail-title">Товар не найден</h1>;
  }

  return (
    <section className="product-detail-page">
      <div className="product-detail-card">
        <div className="product-detail-image">Нет фото</div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>

          {product.description && (
            <p className="product-detail-description">{product.description}</p>
          )}

          <p className="product-detail-price">{product.price} ₽</p>
          <p className="product-detail-sku">Артикул: {product.sku}</p>

          <div className="product-detail-actions">
            <button className="product-detail-btn" onClick={handleAddToCart}>
              Добавить в корзину
            </button>

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
    </section>
  );
}