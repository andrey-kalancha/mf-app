import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import "./AdminDashboard.css";
import AdminNav from "../components/AdminNav";

function formatPrice(value) {
  const num = Number(value || 0);
  if (num <= 0) return "по запросу";
  return `${num.toLocaleString("ru-RU")} ₸`;
}

function getLineLabel(line) {
  switch ((line || "").toLowerCase()) {
    case "standard":
      return "Standard";
    case "maxima":
      return "Maxima";
    case "promax":
      return "Promax";
    default:
      return "";
  }
}

function buildCategoryTree(categories) {
  const nodes = categories.reduce((acc, category) => {
    acc[category.id] = { ...category, children: [] };
    return acc;
  }, {});

  const roots = [];
  categories.forEach((category) => {
    const node = nodes[category.id];
    if (category.parent_id && nodes[category.parent_id]) {
      nodes[category.parent_id].children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priceLists, setPriceLists] = useState([]);
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deactivatingProductId, setDeactivatingProductId] = useState(null);
  const [deactivatingCategoryId, setDeactivatingCategoryId] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, categoriesResponse, priceListsResponse, integrationResponse] = await Promise.allSettled([
        api.get("/products"),
        api.get("/categories"),
        api.get("/price-lists"),
        api.get("/integrations/1c/status"),
      ]);

      if (productsResponse.status === "fulfilled") {
        setProducts(Array.isArray(productsResponse.value.data) ? productsResponse.value.data : []);
      }

      if (categoriesResponse.status === "fulfilled") {
        setCategories(Array.isArray(categoriesResponse.value.data) ? categoriesResponse.value.data : []);
      }

      if (priceListsResponse.status === "fulfilled") {
        setPriceLists(Array.isArray(priceListsResponse.value.data) ? priceListsResponse.value.data : []);
      }

      if (integrationResponse.status === "fulfilled") {
        setIntegrationStatus(integrationResponse.value.data);
      }

      if (productsResponse.status === "rejected" || categoriesResponse.status === "rejected") {
        throw new Error("Не удалось загрузить товары или категории");
      }
    } catch (err) {
      console.error("Ошибка загрузки админ-дашборда:", err);
      setError("Не удалось загрузить данные админки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[String(category.id)] = category;
      return acc;
    }, {});
  }, [categories]);

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  const dashboardStats = useMemo(() => {
    const mediaCount = products.reduce((sum, product) => sum + (Array.isArray(product.images) ? product.images.length : 0), 0);
    const drawingsCount = products.reduce((sum, product) => sum + (Array.isArray(product.drawings) ? product.drawings.length : 0), 0);
    const childCategories = categories.filter((category) => category.parent_id).length;
    const activePriceLists = priceLists.filter((priceList) => priceList.is_active !== false).length;

    return {
      activeProducts: products.filter((product) => product.is_active !== false).length,
      inStockProducts: products.filter((product) => product.in_stock).length,
      activeCategories: categories.filter((category) => category.is_active !== false).length,
      childCategories,
      mediaCount,
      drawingsCount,
      activePriceLists,
      integrationLogs: integrationStatus?.last_logs?.length || 0,
    };
  }, [categories, integrationStatus, priceLists, products]);

  const deactivateProduct = async (product) => {
    const confirmed = window.confirm("Скрыть товар из публичного каталога? История заказов сохранится.");
    if (!confirmed) return;

    try {
      setDeactivatingProductId(product.id);
      const payload = { ...product, is_active: false };
      delete payload.images;
      delete payload.drawings;
      const response = await api.put(`/products/${product.id}`, payload);
      setProducts((prev) => prev.map((item) => (item.id === product.id ? response.data : item)));
      toast.success("Товар скрыт из каталога");
    } catch (err) {
      console.error("Ошибка деактивации товара:", err);
      toast.error(err.response?.data?.detail || "Не удалось скрыть товар");
    } finally {
      setDeactivatingProductId(null);
    }
  };

  const deactivateCategory = async (category) => {
    const confirmed = window.confirm("Скрыть категорию? Товары и история заказов не удаляются.");
    if (!confirmed) return;

    try {
      setDeactivatingCategoryId(category.id);
      const response = await api.put(`/categories/${category.id}`, { ...category, is_active: false });
      setCategories((prev) => prev.map((item) => (item.id === category.id ? response.data : item)));
      toast.success("Категория скрыта");
    } catch (err) {
      console.error("Ошибка деактивации категории:", err);
      toast.error(err.response?.data?.detail || "Не удалось скрыть категорию");
    } finally {
      setDeactivatingCategoryId(null);
    }
  };

  const renderCategoryTree = (nodes, depth = 0) => {
    return nodes.map((category) => (
      <div className="admin-dashboard-tree-node" key={category.id} style={{ marginLeft: `${depth * 16}px` }}>
        <div className="admin-dashboard-tree-row">
          <div>
            <strong>{category.name}</strong>
            <span>{category.slug || "без slug"}</span>
          </div>
          <div className="admin-dashboard-statuses">
            <span className={category.is_active !== false ? "admin-dashboard-status admin-dashboard-status--active" : "admin-dashboard-status admin-dashboard-status--inactive"}>
              {category.is_active !== false ? "Активна" : "Скрыта"}
            </span>
            <Link to={`/admin/categories/edit/${category.id}`} className="admin-dashboard-link">Изменить</Link>
          </div>
        </div>
        {category.children.length > 0 && renderCategoryTree(category.children, depth + 1)}
      </div>
    ));
  };

  if (loading) {
    return (
      <section className="admin-dashboard-page">
        <div className="admin-dashboard-shell">
          <div className="admin-dashboard-hero">
            <div className="admin-dashboard-badge">Admin panel</div>
            <div className="admin-dashboard-skeleton admin-dashboard-skeleton--title" />
            <div className="admin-dashboard-skeleton admin-dashboard-skeleton--text" />
          </div>
          <AdminNav />
          <div className="admin-dashboard-grid">
            {[1, 2].map((card) => <div className="admin-dashboard-card" key={card}><div className="admin-dashboard-skeleton admin-dashboard-skeleton--card-title" /></div>)}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-dashboard-page">
        <div className="admin-dashboard-shell">
          <AdminNav />
          <div className="admin-dashboard-state">
            <h1 className="admin-dashboard-state__title">Ошибка загрузки</h1>
            <p className="admin-dashboard-state__text">{error}</p>
            <button className="admin-dashboard-btn" onClick={loadDashboard}>Попробовать снова</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <div className="admin-dashboard-hero">
          <div className="admin-dashboard-badge">Admin panel</div>
          <h1 className="admin-dashboard-title">Панель администратора</h1>
          <p className="admin-dashboard-subtitle">
            Рабочий центр каталога: товары, категории, медиа, персональные прайсы и заготовка интеграции с 1C.
          </p>
        </div>

        <AdminNav />

        <div className="admin-dashboard-top-actions">
          <Link to="/admin/products/create" className="admin-dashboard-btn">Создать товар</Link>
          <Link to="/admin/categories/create" className="admin-dashboard-btn admin-dashboard-btn--secondary">Создать категорию</Link>
          <Link to="/admin/price-lists" className="admin-dashboard-btn admin-dashboard-btn--secondary">Прайс-листы</Link>
          <Link to="/admin/integrations" className="admin-dashboard-btn admin-dashboard-btn--secondary">Интеграции</Link>
        </div>

        <div className="admin-dashboard-summary admin-dashboard-summary--wide">
          <div className="admin-dashboard-summary__item"><span>Активные товары</span><strong>{dashboardStats.activeProducts}</strong></div>
          <div className="admin-dashboard-summary__item"><span>В наличии</span><strong>{dashboardStats.inStockProducts}</strong></div>
          <div className="admin-dashboard-summary__item"><span>Категории</span><strong>{dashboardStats.activeCategories}</strong></div>
          <div className="admin-dashboard-summary__item"><span>Подкатегории</span><strong>{dashboardStats.childCategories}</strong></div>
          <div className="admin-dashboard-summary__item"><span>Изображения</span><strong>{dashboardStats.mediaCount}</strong></div>
          <div className="admin-dashboard-summary__item"><span>Чертежи</span><strong>{dashboardStats.drawingsCount}</strong></div>
          <div className="admin-dashboard-summary__item"><span>Активные прайсы</span><strong>{dashboardStats.activePriceLists}</strong></div>
          <div className="admin-dashboard-summary__item"><span>Логи 1C</span><strong>{dashboardStats.integrationLogs}</strong></div>
        </div>

        <div className="admin-dashboard-grid">
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card__header">
              <div>
                <div className="admin-dashboard-card__badge">Products</div>
                <h2>Товары</h2>
              </div>
              <span className="admin-dashboard-card__count">{products.length}</span>
            </div>

            {products.length === 0 ? (
              <p className="admin-dashboard-empty">Товары пока не добавлены</p>
            ) : (
              <div className="admin-dashboard-list">
                {products.slice(0, 12).map((product) => (
                  <div className="admin-dashboard-item" key={product.id}>
                    <div className="admin-dashboard-item__info">
                      <div className="admin-dashboard-item__topline">
                        <strong>{product.name}</strong>
                        <div className="admin-dashboard-statuses">
                          <span className={product.is_active !== false ? "admin-dashboard-status admin-dashboard-status--active" : "admin-dashboard-status admin-dashboard-status--inactive"}>
                            {product.is_active !== false ? "Активен" : "Скрыт"}
                          </span>
                          <span className={product.in_stock ? "admin-dashboard-status admin-dashboard-status--stock" : "admin-dashboard-status admin-dashboard-status--preorder"}>
                            {product.in_stock ? "В наличии" : "Под заказ"}
                          </span>
                        </div>
                      </div>

                      <div className="admin-dashboard-meta-grid">
                        <span>SKU: {product.sku || "—"}</span>
                        <span>Цена: {formatPrice(product.price)}</span>
                        <span>Бренд: {product.brand || "Lanttich"}</span>
                        <span>Категория: {categoryMap[String(product.category_id)]?.name || "—"}</span>
                        {getLineLabel(product.line) && <span>Линейка: {getLineLabel(product.line)}</span>}
                        <span>Фото: {Array.isArray(product.images) ? product.images.length : 0}</span>
                        <span>Чертежи: {Array.isArray(product.drawings) ? product.drawings.length : 0}</span>
                      </div>
                    </div>

                    <div className="admin-dashboard-item__actions">
                      <Link to={`/product/${product.id}`} className="admin-dashboard-link">Открыть</Link>
                      <Link to={`/admin/products/edit/${product.id}`} className="admin-dashboard-link">Редактировать</Link>
                      {product.is_active !== false && (
                        <button className="admin-dashboard-delete" onClick={() => deactivateProduct(product)} disabled={deactivatingProductId === product.id}>
                          {deactivatingProductId === product.id ? "Скрываем..." : "Скрыть"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card__header">
              <div>
                <div className="admin-dashboard-card__badge">Categories</div>
                <h2>Иерархия категорий</h2>
              </div>
              <span className="admin-dashboard-card__count">{categories.length}</span>
            </div>

            {categoryTree.length === 0 ? (
              <p className="admin-dashboard-empty">Категории пока не добавлены</p>
            ) : (
              <div className="admin-dashboard-tree">{renderCategoryTree(categoryTree)}</div>
            )}
          </div>

          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card__header">
              <div>
                <div className="admin-dashboard-card__badge">B2B prices</div>
                <h2>Прайс-листы</h2>
              </div>
              <span className="admin-dashboard-card__count">{priceLists.length}</span>
            </div>

            <div className="admin-dashboard-list">
              {priceLists.slice(0, 6).map((priceList) => (
                <div className="admin-dashboard-item" key={priceList.id}>
                  <div className="admin-dashboard-item__info">
                    <strong>{priceList.name}</strong>
                    <div className="admin-dashboard-meta-grid">
                      <span>{priceList.is_active ? "Активен" : "Скрыт"}</span>
                      <span>Скидка: {priceList.discount_percent || 0}%</span>
                      <span>Позиций: {(priceList.items || []).length}</span>
                    </div>
                  </div>
                  <Link to="/admin/price-lists" className="admin-dashboard-link">Открыть</Link>
                </div>
              ))}
              {priceLists.length === 0 && <p className="admin-dashboard-empty">Прайс-листы пока не созданы</p>}
            </div>
          </div>

          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card__header">
              <div>
                <div className="admin-dashboard-card__badge">1C</div>
                <h2>Интеграция</h2>
              </div>
              <span className="admin-dashboard-card__count">{integrationStatus?.is_configured ? "ON" : "Stub"}</span>
            </div>

            <p className="admin-dashboard-empty">
              Заготовка 1C готова для импорта каталога, остатков, цен и экспорта заказов. Реальный обмен подключается через сервисный слой.
            </p>
            <div className="admin-dashboard-meta-grid admin-dashboard-meta-grid--block">
              {(integrationStatus?.supported_entities || []).map((entity) => <span key={entity}>{entity}</span>)}
            </div>
            <Link to="/admin/integrations" className="admin-dashboard-btn admin-dashboard-btn--secondary">Открыть интеграции</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
