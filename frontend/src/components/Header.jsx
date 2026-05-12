import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  getCurrentUser,
  isAdmin,
  isAuthenticated,
  removeToken,
} from "../services/auth";
import { getCartCount, subscribeCartUpdated } from "../services/cart";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const auth = isAuthenticated();
  const admin = isAdmin();
  const user = getCurrentUser();

  const [cartCount, setCartCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const loadCartCount = async () => {
      if (!auth) {
        setCartCount(0);
        return;
      }

      try {
        const count = await getCartCount();
        setCartCount(count);
      } catch (error) {
        console.error("Ошибка загрузки количества корзины:", error);
        setCartCount(0);
      }
    };

    loadCartCount();

    const unsubscribe = subscribeCartUpdated((count) => {
      if (typeof count === "number") {
        setCartCount(count);
        return;
      }

      loadCartCount();
    });
    const intervalId = window.setInterval(loadCartCount, 2500);

    window.addEventListener("focus", loadCartCount);

    return () => {
      unsubscribe();
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadCartCount);
    };
  }, [auth]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    removeToken();
    navigate("/");
    window.location.reload();
  };

  const closeProfileMenu = () => {
    setProfileOpen(false);
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

            <NavLink
              to="/b2b"
              className={({ isActive }) =>
                isActive ? "site-nav__link active" : "site-nav__link"
              }
            >
              B2B
            </NavLink>
          </nav>

          <div className="site-header__actions">
            {auth ? (
              <>
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    isActive
                      ? "site-cart-btn site-cart-btn--active"
                      : "site-cart-btn"
                  }
                  aria-label="Корзина"
                >
                  <span className="site-cart-btn__icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 4H5L7.2 14.2C7.3 14.7 7.75 15 8.25 15H17.6C18.08 15 18.5 14.68 18.63 14.21L20.4 8H6.1"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="9" cy="19" r="1.6" fill="currentColor" />
                      <circle cx="17" cy="19" r="1.6" fill="currentColor" />
                    </svg>
                  </span>

                  <span className="site-cart-btn__text">Корзина</span>

                  {cartCount > 0 && (
                    <span className="site-cart-btn__count">{cartCount}</span>
                  )}
                </NavLink>

                <div className="site-profile-dropdown" ref={profileRef}>
                  <button
                    type="button"
                    className={`site-profile-chip ${
                      profileOpen ? "site-profile-chip--open" : ""
                    }`}
                    onClick={() => setProfileOpen((prev) => !prev)}
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                  >
                    <span className="site-profile-chip__avatar">
                      {profileLetter}
                    </span>

                    <span className="site-profile-chip__text">
                      {user?.email || "Профиль"}
                    </span>

                    <span
                      className={`site-profile-chip__arrow ${
                        profileOpen ? "open" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="site-profile-menu" role="menu">
                      <div className="site-profile-menu__header">
                        <span className="site-profile-menu__label">Аккаунт</span>
                        <strong>{user?.email || "Пользователь"}</strong>
                      </div>

                      <NavLink
                        to="/profile"
                        className="site-profile-menu__item"
                        onClick={closeProfileMenu}
                      >
                        Профиль
                      </NavLink>

                      <NavLink
                        to="/orders"
                        className="site-profile-menu__item"
                        onClick={closeProfileMenu}
                      >
                        Мои заказы
                      </NavLink>

                      {admin && (
                        <NavLink
                          to="/admin"
                          className="site-profile-menu__item"
                          onClick={closeProfileMenu}
                        >
                          Админка
                        </NavLink>
                      )}

                      <button
                        type="button"
                        className="site-profile-menu__item site-profile-menu__item--danger"
                        onClick={handleLogout}
                      >
                        Выйти
                      </button>
                    </div>
                  )}
                </div>
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
