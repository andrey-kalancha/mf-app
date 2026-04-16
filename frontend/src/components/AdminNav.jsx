import { NavLink } from "react-router-dom";
import "./AdminNav.css";

export default function AdminNav() {
  return (
    <nav className="admin-nav">
      <NavLink
        to="/admin"
        end
        className={({ isActive }) =>
          isActive ? "admin-nav__link active" : "admin-nav__link"
        }
      >
        Дашборд
      </NavLink>

      <NavLink
        to="/admin/orders"
        className={({ isActive }) =>
          isActive ? "admin-nav__link active" : "admin-nav__link"
        }
      >
        Заказы
      </NavLink>

      <NavLink
        to="/admin/users"
        className={({ isActive }) =>
          isActive ? "admin-nav__link active" : "admin-nav__link"
        }
      >
        Пользователи
      </NavLink>

      <NavLink
        to="/admin/products/create"
        className={({ isActive }) =>
          isActive ? "admin-nav__link active" : "admin-nav__link"
        }
      >
        Добавить товар
      </NavLink>

      <NavLink
        to="/admin/categories/create"
        className={({ isActive }) =>
          isActive ? "admin-nav__link active" : "admin-nav__link"
        }
      >
        Добавить категорию
      </NavLink>
    </nav>
  );
}