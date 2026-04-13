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

          {auth && (
            <>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive ? "site-nav__link active" : "site-nav__link"
                }
              >
                Корзина {cartCount > 0 ? `(${cartCount})` : ""}
              </NavLink>

              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  isActive ? "site-nav__link active" : "site-nav__link"
                }
              >
                Заказы
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? "site-nav__link active" : "site-nav__link"
                }
              >
                {user?.email ? user.email : "Профиль"}
              </NavLink>

              {admin && (
                <>
                  <NavLink
                    to="/admin/products/create"
                    className={({ isActive }) =>
                      isActive ? "site-nav__link active" : "site-nav__link"
                    }
                  >
                    Добавить товар
                  </NavLink>

                  <NavLink
                    to="/admin/categories/create"
                    className={({ isActive }) =>
                      isActive ? "site-nav__link active" : "site-nav__link"
                    }
                  >
                    Добавить категорию
                  </NavLink>
                  <NavLink
                   to="/admin"
                    className={({ isActive }) =>
                      isActive ? "site-nav__link active" : "site-nav__link"
                    }
                  >
                    Админка
                  </NavLink>
                  <NavLink
                  to="/admin/orders"
                  className={({ isActive }) =>
                    isActive ? "site-nav__link active" : "site-nav__link"
                  }
                >
                  Все заказы
                </NavLink>
                </>
              )}
            </>
          )}

          {auth ? (
            <button className="site-nav__logout" onClick={handleLogout}>
              Выйти
            </button>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "site-nav__link active" : "site-nav__link"
                }
              >
                Вход
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? "site-nav__link active" : "site-nav__link"
                }
              >
                Регистрация
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}