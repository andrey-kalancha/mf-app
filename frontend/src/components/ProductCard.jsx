import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { isAuthenticated } from "../services/auth";
import toast from "react-hot-toast";

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
      <div className="product-image">
        <span>Нет фото</span>
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        {product.description && (
          <p className="product-description">{product.description}</p>
        )}

        <p className="product-price">{product.price} ₽</p>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to={`/product/${product.id}`} className="product-btn">
            Подробнее
          </Link>

          <button className="product-btn" onClick={addToCart}>
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}