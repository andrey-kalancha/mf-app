import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { isAdmin } from "../services/auth";
import ProductCard from "../components/ProductCard";
import "./Catalog.css";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const admin = isAdmin();

  useEffect(() => {
    Promise.all([api.get("/products"), api.get("/categories")])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      })
      .catch((err) => console.error("Ошибка:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategoryId !== "all") {
      result = result.filter(
        (product) => String(product.category_id) === String(selectedCategoryId)
      );
    }

    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";
        const sku = product.sku?.toLowerCase() || "";

        return (
          name.includes(normalizedSearch) ||
          description.includes(normalizedSearch) ||
          sku.includes(normalizedSearch)
        );
      });
    }

    return result;
  }, [products, selectedCategoryId, search]);

  if (loading) {
    return <h1 className="catalog-title">Загрузка...</h1>;
  }

  return (
    <section className="catalog-page">
      <h1 className="catalog-title">Каталог</h1>

      <div className="catalog-toolbar">
        <input
          type="text"
          className="catalog-search"
          placeholder="Поиск по названию, описанию или артикулу"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="catalog-filters">
        <button
          className={
            selectedCategoryId === "all"
              ? "catalog-filter-btn active"
              : "catalog-filter-btn"
          }
          onClick={() => setSelectedCategoryId("all")}
        >
          Все
        </button>

        {categories.map((category) => (
          <div key={category.id} className="catalog-category-admin-wrap">
            <button
              className={
                String(selectedCategoryId) === String(category.id)
                  ? "catalog-filter-btn active"
                  : "catalog-filter-btn"
              }
              onClick={() => setSelectedCategoryId(category.id)}
            >
              {category.name}
            </button>

            {admin && (
              <Link
                to={`/admin/categories/edit/${category.id}`}
                className="catalog-category-edit-link"
              >
                ✎
              </Link>
            )}
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <p className="catalog-empty">Ничего не найдено</p>
      ) : (
        <div className="catalog-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}