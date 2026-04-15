import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <section className="home-page">
      <div className="hero">
        <div className="hero__content">
          <h1>Мебельная фурнитура для современных решений</h1>
          <p>
            Каталог надежной фурнитуры: петли, направляющие, ручки и другие
            комплектующие для мебели. Удобный выбор, понятная структура и
            быстрый доступ к товарам.
          </p>

          <div className="hero__actions">
            <Link to="/catalog" className="hero__btn">
              Перейти в каталог
            </Link>

            <Link to="/about" className="hero__btn hero__btn--secondary">
              Узнать о нас
            </Link>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__visual-box">
            MF APP
            <br />
            Каталог мебельной фурнитуры
          </div>
        </div>
      </div>

      <div className="features">
        <h2>Почему выбирают нас</h2>

        <div className="features__grid">
          <div className="feature-card">
            <h3>Широкий ассортимент</h3>
            <p>
              В одном месте собраны популярные категории товаров для мебельного
              производства, сборки и оснащения мебели.
            </p>
          </div>

          <div className="feature-card">
            <h3>Удобный каталог</h3>
            <p>
              Быстрый поиск, фильтрация по категориям и понятная структура для
              выбора нужной позиции без лишних действий.
            </p>
          </div>

          <div className="feature-card">
            <h3>Готово к развитию</h3>
            <p>
              Сайт уже подключен к backend и расширяется до корзины, заказов,
              профиля и полноценной админ-панели.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}