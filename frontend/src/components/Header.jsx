import { Link, NavLink, useNavigate } from "react-router-dom";
import { isAuthenticated, removeToken } from "../services/auth";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const auth = isAuthenticated();

  const handleLogout = () => {
    removeToken();
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="site-header">
      <div className="site-header__container">
        <Link to="/" className="site-logo">
          MF APP
        </Link>

        <nav className="site-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "site-nav__link active" : "site-nav__link"
            }
          >
            Главная
          </NavLink>

          <NavLink
            to="/catalog"
            className={({ isActive }) =>
              isActive ? "site-nav__link active" : "site-nav__link"
            }
          >
            Каталог
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "site-nav__link active" : "site-nav__link"
            }
          >
            О нас
          </NavLink>

          <NavLink
            to="/contacts"
            className={({ isActive }) =>
              isActive ? "site-nav__link active" : "site-nav__link"
            }
          >
            Контакты
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive ? "site-nav__link active" : "site-nav__link"
            }
          >
            Корзина
          </NavLink>

          {auth && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive ? "site-nav__link active" : "site-nav__link"
              }
            >
              Заказы
            </NavLink>
          )}

          {auth ? (
            <button className="site-nav__logout" onClick={handleLogout}>
              Выйти
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "site-nav__link active" : "site-nav__link"
              }
            >
              Вход
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}