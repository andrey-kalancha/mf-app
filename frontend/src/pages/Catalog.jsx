import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { isAdmin, isAuthenticated } from "../services/auth";
import { getProductPrices } from "../services/pricing";
import ProductCard from "../components/ProductCard";
import "./Catalog.css";

const lineOptions = [
  { value: "standard", label: "Standard" },
  { value: "maxima", label: "Maxima" },
  { value: "promax", label: "Promax" },
];

const availabilityOptions = [
  { value: "all", label: "Все товары" },
  { value: "in-stock", label: "В наличии" },
  { value: "preorder", label: "Под заказ" },
  { value: "with-price", label: "С указанной ценой" },
  { value: "featured", label: "Рекомендуемые" },
  { value: "inactive", label: "Скрытые" },
];

function getLineLabel(line) {
  return lineOptions.find((option) => option.value === String(line || "").toLowerCase())?.label || "";
}

function formatSpecKey(key) {
  const labels = {
    soft_close: "Доводчик",
    push_to_open: "Push to open",
    opening_angle: "Угол открывания",
    mounting_type: "Тип монтажа",
    material: "Материал",
    thickness: "Толщина",
    height: "Высота",
    width: "Ширина",
    depth: "Глубина",
    length: "Длина",
    side: "Сторона",
    load_capacity_kg: "Нагрузка, кг",
    horizontal_adjustment_mm: "Регулировка по горизонтали, мм",
    vertical_adjustment_mm: "Регулировка по вертикали, мм",
  };

  if (labels[key]) return labels[key];

  const readable = String(key)
    .replace(/([a-zа-яё])([A-ZА-ЯЁ])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  if (!readable) return "Параметр";
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

function flattenTree(nodes, acc = []) {
  nodes.forEach((node) => {
    acc.push(node);
    if (Array.isArray(node.children) && node.children.length > 0) {
      flattenTree(node.children, acc);
    }
  });
  return acc;
}

function filterActiveTree(nodes) {
  return nodes
    .filter((node) => node.is_active !== false)
    .map((node) => ({
      ...node,
      children: filterActiveTree(Array.isArray(node.children) ? node.children : []),
    }));
}

function findCategoryPath(nodes, categoryId, path = []) {
  for (const node of nodes) {
    const nextPath = [...path, node];
    if (String(node.id) === String(categoryId)) return nextPath;
    const childPath = findCategoryPath(node.children || [], categoryId, nextPath);
    if (childPath.length > 0) return childPath;
  }
  return [];
}

export default function Catalog() {
  const admin = isAdmin();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedLine, setSelectedLine] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedSpecKey, setSelectedSpecKey] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [pricingByProductId, setPricingByProductId] = useState({});

  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, treeRes] = await Promise.all([
          api.get("/products", { params: { active_only: admin ? undefined : true } }),
          api.get("/categories"),
          api.get("/categories/tree"),
        ]);

        const initialProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
        const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
        const treeData = Array.isArray(treeRes.data) ? treeRes.data : [];

        setAllProducts(initialProducts);
        setProducts(initialProducts);
        setCategories(admin ? categoriesData : categoriesData.filter((category) => category.is_active !== false));
        setCategoryTree(admin ? treeData : filterActiveTree(treeData));
      } catch (err) {
        console.error("Ошибка загрузки каталога:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [admin]);

  useEffect(() => {
    if (loading) return;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const params = {
          active_only: admin ? undefined : true,
          category_id: selectedCategoryId !== "all" ? Number(selectedCategoryId) : undefined,
          include_children: selectedCategoryId !== "all" ? true : undefined,
          line: selectedLine !== "all" ? selectedLine : undefined,
          search: search.trim() || undefined,
        };

        const response = await api.get("/products", { params });
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Ошибка фильтрации каталога:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [admin, loading, search, selectedCategoryId, selectedLine]);

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[String(category.id)] = category;
      return acc;
    }, {});
  }, [categories]);

  const selectedCategory = useMemo(() => {
    return categories.find((category) => String(category.id) === String(selectedCategoryId));
  }, [categories, selectedCategoryId]);

  const selectedPath = useMemo(() => {
    return selectedCategoryId === "all" ? [] : findCategoryPath(categoryTree, selectedCategoryId);
  }, [categoryTree, selectedCategoryId]);

  const brandOptions = useMemo(() => {
    return [...new Set(products.map((product) => product.brand?.trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "ru")
    );
  }, [products]);

  const specOptions = useMemo(() => {
    const keys = new Set();
    products.forEach((product) => {
      if (product.specifications && typeof product.specifications === "object" && !Array.isArray(product.specifications)) {
        Object.keys(product.specifications).forEach((key) => keys.add(key));
      }
    });

    return [...keys]
      .sort((a, b) => formatSpecKey(a).localeCompare(formatSpecKey(b), "ru"))
      .map((key) => ({ value: key, label: formatSpecKey(key) }));
  }, [products]);

  const rootCategoryCards = useMemo(() => {
    const flatTree = flattenTree(categoryTree);
    const childrenMap = flatTree.reduce((acc, category) => {
      acc[category.id] = Array.isArray(category.children) ? category.children : [];
      return acc;
    }, {});

    const collectIds = (category) => {
      const nested = childrenMap[category.id] || [];
      return [category.id, ...nested.flatMap((child) => collectIds(child))];
    };

    const sourceNodes =
      selectedCategoryId !== "all" && selectedCategory?.id
        ? selectedPath[selectedPath.length - 1]?.children || []
        : categoryTree;

    return sourceNodes.map((category) => {
      const ids = collectIds(category).map(String);
      const categoryProducts = allProducts.filter((product) => ids.includes(String(product.category_id)));

      return {
        category,
        count: categoryProducts.length,
        lines: [...new Set(categoryProducts.map((product) => getLineLabel(product.line)).filter(Boolean))],
        children: category.children || [],
      };
    });
  }, [allProducts, categoryTree, selectedCategory, selectedCategoryId, selectedPath]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedBrand !== "all") {
      result = result.filter((product) => (product.brand || "").trim() === selectedBrand);
    }

    if (selectedSpecKey !== "all") {
      result = result.filter((product) => {
        const value = product.specifications?.[selectedSpecKey];
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== null && value !== "";
      });
    }

    if (selectedAvailability === "in-stock") {
      result = result.filter((product) => product.in_stock === true);
    }

    if (selectedAvailability === "preorder") {
      result = result.filter((product) => product.in_stock === false);
    }

    if (selectedAvailability === "with-price") {
      result = result.filter((product) => Number(product.price || 0) > 0);
    }

    if (selectedAvailability === "featured") {
      result = result.filter((product) => product.is_featured === true);
    }

    if (selectedAvailability === "inactive") {
      result = result.filter((product) => product.is_active === false);
    }

    return result;
  }, [products, selectedAvailability, selectedBrand, selectedSpecKey]);

  useEffect(() => {
    const loadPricing = async () => {
      if (!isAuthenticated() || filteredProducts.length === 0) {
        setPricingByProductId({});
        return;
      }

      try {
        const productIds = filteredProducts.map((product) => product.id);
        const pricingMap = await getProductPrices(productIds);
        setPricingByProductId(pricingMap);
      } catch (error) {
        console.error("Ошибка загрузки персональных цен:", error);
        setPricingByProductId({});
      }
    };

    loadPricing();
  }, [filteredProducts]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategoryId("all");
    setSelectedLine("all");
    setSelectedAvailability("all");
    setSelectedBrand("all");
    setSelectedSpecKey("all");
  };

  const renderTree = (nodes, depth = 0) => {
    return nodes.map((node) => (
      <div className="catalog-tree__node" key={node.id}>
        <button
          type="button"
          className={String(selectedCategoryId) === String(node.id) ? "catalog-tree__button active" : "catalog-tree__button"}
          style={{ paddingLeft: `${16 + depth * 18}px` }}
          onClick={() => setSelectedCategoryId(node.id)}
        >
          {node.name}
        </button>

        {admin && (
          <Link to={`/admin/categories/edit/${node.id}`} className="catalog-category-edit-link" title="Редактировать категорию">
            ✎
          </Link>
        )}

        {Array.isArray(node.children) && node.children.length > 0 && (
          <div className="catalog-tree__children">{renderTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <section className="catalog-page">
        <div className="catalog-loading">Загрузка каталога...</div>
      </section>
    );
  }

  return (
    <section className="catalog-page">
      <div className="catalog-toolbar">
        <div className="catalog-breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <button type="button" onClick={() => setSelectedCategoryId("all")}>Каталог</button>
          {selectedPath.map((category) => (
            <span className="catalog-breadcrumbs__item" key={category.id}>
              <span>/</span>
              <button type="button" onClick={() => setSelectedCategoryId(category.id)}>{category.name}</button>
            </span>
          ))}
        </div>

        <div className="catalog-search-wrap">
          <input
            type="text"
            className="catalog-search"
            placeholder="Поиск по названию, описанию, бренду или артикулу"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="catalog-toolbar__meta">
          <span className="catalog-count">
            Найдено: <strong>{filteredProducts.length}</strong>
          </span>

          {selectedCategoryId !== "all" && selectedCategory && (
            <span className="catalog-current-category">
              Раздел: <strong>{selectedCategory.name}</strong>
            </span>
          )}

          {selectedLine !== "all" && (
            <span className="catalog-current-category">
              Линейка: <strong>{getLineLabel(selectedLine)}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <div className="catalog-sidebar-card">
            <div className="catalog-filter-label">Разделы</div>
            <div className="catalog-tree">
              <button
                type="button"
                className={selectedCategoryId === "all" ? "catalog-tree__button active" : "catalog-tree__button"}
                onClick={() => setSelectedCategoryId("all")}
              >
                Все товары
              </button>
              {renderTree(categoryTree)}
            </div>
          </div>

          <div className="catalog-sidebar-card">
            <div className="catalog-filter-group">
              <span className="catalog-filter-label">Линейка</span>
              <div className="catalog-chip-row">
                <button className={selectedLine === "all" ? "catalog-filter-btn active" : "catalog-filter-btn"} onClick={() => setSelectedLine("all")}>
                  Все линейки
                </button>
                {lineOptions.map((line) => (
                  <button
                    key={line.value}
                    className={selectedLine === line.value ? "catalog-filter-btn active" : "catalog-filter-btn"}
                    onClick={() => setSelectedLine(line.value)}
                  >
                    {line.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="catalog-filter-group">
              <label className="catalog-filter-label" htmlFor="catalog-availability">Наличие и статус</label>
              <select
                id="catalog-availability"
                className="catalog-filter-select"
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
              >
                {availabilityOptions
                  .filter((option) => admin || option.value !== "inactive")
                  .map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
              </select>
            </div>

            {brandOptions.length > 0 && (
              <div className="catalog-filter-group">
                <label className="catalog-filter-label" htmlFor="catalog-brand">Бренд</label>
                <select id="catalog-brand" className="catalog-filter-select" value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                  <option value="all">Все бренды</option>
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            )}

            {specOptions.length > 0 && (
              <div className="catalog-filter-group">
                <label className="catalog-filter-label" htmlFor="catalog-spec">Тех. параметр</label>
                <select id="catalog-spec" className="catalog-filter-select" value={selectedSpecKey} onChange={(e) => setSelectedSpecKey(e.target.value)}>
                  <option value="all">Все параметры</option>
                  {specOptions.map((spec) => (
                    <option key={spec.value} value={spec.value}>{spec.label}</option>
                  ))}
                </select>
              </div>
            )}

            <button className="catalog-reset-btn" onClick={resetFilters}>Сбросить фильтры</button>
          </div>
        </aside>

        <div className="catalog-content">
          {rootCategoryCards.length > 0 && (
            <div className="catalog-structure">
              <div className="catalog-structure__grid">
                {rootCategoryCards.map(({ category, count, lines, children }) => (
                  <button
                    type="button"
                    key={category.id}
                    className={String(selectedCategoryId) === String(category.id) ? "catalog-structure-card active" : "catalog-structure-card"}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    <span>{category.parent_id ? "Подкатегория" : "Раздел"}</span>
                    <strong>{category.name}</strong>
                    <small>{count} позиций</small>

                    {children.length > 0 && (
                      <div className="catalog-structure-card__children">
                        {children.slice(0, 4).map((child) => <em key={child.id}>{child.name}</em>)}
                      </div>
                    )}

                    {lines.length > 0 && (
                      <div className="catalog-structure-card__lines">
                        {lines.map((line) => <i key={line}>{line}</i>)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loadingProducts ? (
            <div className="catalog-empty">
              <h2>Обновляем выдачу</h2>
              <p>Подбираем товары по выбранным фильтрам и разделам каталога.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="catalog-empty">
              <h2>Ничего не найдено</h2>
              <p>Попробуйте изменить запрос, выбрать другой раздел или сбросить часть фильтров.</p>
              <button className="catalog-reset-btn" onClick={resetFilters}>Сбросить фильтры</button>
            </div>
          ) : (
            <div className="catalog-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={categoryMap[String(product.category_id)]?.name}
                  pricing={pricingByProductId[String(product.id)]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
