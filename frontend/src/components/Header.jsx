import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  isAdmin,
  isAuthenticated,
  removeToken,
} from "../services/auth";
import { getCartCount } from "../services/cart";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const auth = isAuthenticated();
  const admin = isAdmin();
  const user = getCurrentUser();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadCartCount = async () => {
      if (!auth) {
        setCartCount(0);
        return;
      }

      const count = await getCartCount();
      setCartCount(count);
    };

    loadCartCount();
  }, [auth]);

  const handleLogout = () => {
    removeToken();
    navigate("/");
    window.location.reload();
  };

  const profileLetter = user?.email ? user.email[0].toUpperCase() : "U";

  return (
    <header className="site-header">
      <div className="site-header__top">
        <div className="site-header__container site-header__top-inner">
          <div className="site-header__brand">
            <Link to="/" className="site-logo">
              <img
                src="/logo.png"
                alt="MF APP"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </Link>
          </div>

          <div className="site-header__contacts">
            <a href="tel:+77774888854" className="site-header__phone">
              +7 777 488 88 54
            </a>
            <span className="site-header__address">
              г. Алматы, ул. Ратушного, 78А/1, оф.308
            </span>
          </div>
        </div>
      </div>

      <div className="site-header__nav-wrap">
        <div className="site-header__container site-header__nav-inner">
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
              О компании
            </NavLink>

            <NavLink
              to="/contacts"
              className={({ isActive }) =>
                isActive ? "site-nav__link active" : "site-nav__link"
              }
            >
              Контакты
            </NavLink>

            {auth && (
              <>
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    isActive ? "site-nav__link active" : "site-nav__link"
                  }
                >
                  🛒кОРЗИНА {cartCount > 0 ? `(${cartCount})` : ""}
                </NavLink>

                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    isActive ? "site-nav__link active" : "site-nav__link"
                  }
                >
                  Заказы
                </NavLink>

                {admin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      isActive ? "site-nav__link active" : "site-nav__link"
                    }
                  >
                    Админка
                  </NavLink>
                )}
              </>
            )}
          </nav>

          <div className="site-header__actions">
            {auth ? (
              <>
                <NavLink to="/profile" className="site-profile-chip">
                  <span className="site-profile-chip__avatar">
                    {profileLetter}
                  </span>
                  <span className="site-profile-chip__text">
                    {user?.email || "Профиль"}
                  </span>
                </NavLink>

                <button className="site-nav__logout" onClick={handleLogout}>
                  Выйти
                </button>
              </>
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
          </div>
        </div>
      </div>
    </header>
  );
}