import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { isAuthenticated } from "../services/auth";
import toast from "react-hot-toast";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const addToCart = async () => {
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
      console.error("Ошибка добавления:", err);
      toast.error("Ошибка добавления в корзину");
    }
  };

  return (
    <div className="product-card">
      <div className="product-card__image">Нет фото</div>

      <div className="product-card__body">
        <h3>{product.name}</h3>

        {product.description && (
          <p className="product-card__description">{product.description}</p>
        )}

        <div className="product-card__bottom">
          <div className="product-card__price">{product.price} ₽</div>

          <div className="product-card__actions">
            <Link to={`/product/${product.id}`} className="product-card__btn secondary">
              Подробнее
            </Link>

            <button className="product-card__btn" onClick={addToCart}>
              В корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}