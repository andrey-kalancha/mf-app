import { Link } from "react-router-dom";
import "./Footer.css";

const catalogLinks = [
  "Системы открывания",
  "Системы выдвижения",
  "Посудосушители",
  "Бутылочницы",
  "Крепежная фурнитура",
  "Комплектующие для шкафов",
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__container">
        <div className="site-footer__main">
          <div className="site-footer__brand">
            <Link to="/" className="site-logo site-footer__logo-link" aria-label="МФ Алматы">
              <img
                src="/logo.png"
                alt="МФ Алматы Lanttich"
                className="site-footer__logo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </Link>

            <div className="site-footer__badge">Официальный представитель Lanttich</div>
            <h2>МФ Алматы</h2>
            <p>
              Мебельная фурнитура для производства, магазинов и частных мастеров.
              Каталог, подбор, счет и отгрузка по Казахстану.
            </p>
          </div>

          <div className="site-footer__column">
            <h3>Каталог</h3>
            <div className="site-footer__links">
              {catalogLinks.map((item) => (
                <Link to="/catalog" key={item}>
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="site-footer__column">
            <h3>Навигация</h3>
            <div className="site-footer__links">
              <Link to="/">Главная</Link>
              <Link to="/catalog">Каталог</Link>
              <Link to="/about">О компании</Link>
              <Link to="/contacts">Контакты</Link>
              <Link to="/b2b">B2B</Link>
              <Link to="/privacy-policy">Политика конфиденциальности</Link>
            </div>
          </div>

          <div className="site-footer__contact-card">
            <h3>Контакты</h3>
            <a href="tel:+77774888854" className="site-footer__phone">
              +7 777 488 88 54
            </a>
            <a href="mailto:kazfurnitura-88@mail.ru">kazfurnitura-88@mail.ru</a>
            <p>г. Алматы, ул. Ратушного, 78А/1, оф.308</p>

            <div className="site-footer__chips">
              <span>Доставка по Казахстану</span>
              <span>Standard</span>
              <span>Maxima</span>
              <span>Promax</span>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© ТОО "МФ-Алматы", 2026</span>
          <span>Мебельная фурнитура Lanttich для Казахстана</span>
        </div>
      </div>
    </footer>
  );
}
