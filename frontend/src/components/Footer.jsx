import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__container">
        <div className="site-footer__top">
          <div className="site-footer__logo-block">
            <img
              src="/logo.png"
              alt="MF APP"
              className="footer-logo"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="site-footer__contact-right">
            <a href="tel:+77774888854" className="site-footer__phone">
              +7 777 488 88 54
            </a>
            <p className="site-footer__address">
              г. Алматы, ул. Ратушного, 78А/1, оф.308
            </p>
          </div>
        </div>

        <div className="site-footer__menu">
          <Link to="/">Главная</Link>
          <Link to="/catalog">Каталог</Link>
          <Link to="/about">О компании</Link>
          <Link to="/contacts">Контакты</Link>
        </div>

        <div className="site-footer__bottom">
          <div className="site-footer__column">
            <h4>Контакты</h4>
            <p>г. Алматы, ул. Ратушного, 78А/1, оф.308</p>
            <p>+7 777 488 88 54</p>
            <p>pochta@mf-almaty.kz</p>
          </div>

          <div className="site-footer__column">
            <h4>Меню</h4>
            <Link to="/">Главная</Link>
            <Link to="/catalog">Каталог</Link>
            <Link to="/about">О компании</Link>
          </div>

          <div className="site-footer__column">
            <h4>Мы в соцсетях</h4>
            <div className="site-footer__socials">
              <a href="#" aria-label="WhatsApp">WA</a>
              <a href="#" aria-label="Telegram">TG</a>
            </div>
          </div>
        </div>

        <div className="site-footer__copyright">
          © ТОО "МФ-Алматы", 2026
        </div>
      </div>
    </footer>
  );
}