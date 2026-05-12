import { NavLink } from "react-router-dom";
import "./AdminNav.css";

export default function AdminNav() {
  const getClassName = ({ isActive }) =>
    isActive ? "admin-nav__link active" : "admin-nav__link";

  return (
    <nav className="admin-nav">
      <NavLink to="/admin" end className={getClassName}>
        Дашборд
      </NavLink>

      <NavLink to="/admin/orders" className={getClassName}>
        Заказы
      </NavLink>

      <NavLink to="/admin/users" className={getClassName}>
        Пользователи
      </NavLink>

      <NavLink to="/admin/price-lists" className={getClassName}>
        Прайсы
      </NavLink>

      <NavLink to="/admin/integrations" className={getClassName}>
        1C
      </NavLink>

      <NavLink to="/admin/products/create" className={getClassName}>
        Добавить товар
      </NavLink>

      <NavLink to="/admin/categories/create" className={getClassName}>
        Добавить категорию
      </NavLink>
    </nav>
  );
}
