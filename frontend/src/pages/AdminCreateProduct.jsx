import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import AdminNav from "../components/AdminNav";
import "./AdminCreateProduct.css";

export default function AdminCreateProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    category_id: "",

    brand: "Lanttich",
    line: "",
    image_url: "",

    is_featured: false,
    is_active: true,
    in_stock: true,

    pack_quantity: "",
    weight_grams: "",

    load_capacity: "",
    color: "",
    coating: "",
    size_label: "",

    specifications: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.get("/categories");
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Ошибка загрузки категорий:", err);
        toast.error("Не удалось загрузить категории");
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBooleanChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value === "true",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let parsedSpecifications = {};

    if (form.specifications.trim()) {
      try {
        parsedSpecifications = JSON.parse(form.specifications);
      } catch {
        toast.error("Поле характеристик должно быть валидным JSON");
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      sku: form.sku.trim(),
      category_id: Number(form.category_id),

      brand: form.brand.trim() || null,
      line: form.line.trim() || null,
      image_url: form.image_url.trim() || null,

      is_featured: form.is_featured,
      is_active: form.is_active,
      in_stock: form.in_stock,

      pack_quantity: form.pack_quantity ? Number(form.pack_quantity) : null,
      weight_grams: form.weight_grams ? Number(form.weight_grams) : null,

      load_capacity: form.load_capacity.trim() || null,
      color: form.color.trim() || null,
      coating: form.coating.trim() || null,
      size_label: form.size_label.trim() || null,

      specifications: parsedSpecifications,
    };

    if (!payload.name || !payload.sku || !payload.category_id || Number.isNaN(payload.price)) {
      toast.error("Заполните обязательные поля");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/products", payload);
      toast.success("Товар успешно создан");
      navigate("/admin");
    } catch (err) {
      console.error("Ошибка создания товара:", err);
      toast.error(err.response?.data?.detail || "Не удалось создать товар");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-product-page">
      <div className="admin-product-shell">
        <div className="admin-product-heading">
          <div className="admin-product-badge">Admin / Product</div>
          <h1 className="admin-product-title">Добавить товар</h1>
          <p className="admin-product-subtitle">
            Создайте новую позицию каталога мебельной фурнитуры с основными
            характеристиками и параметрами.
          </p>
        </div>

        <AdminNav />

        <div className="admin-product-card">
          <form className="admin-product-form" onSubmit={handleSubmit}>
            <div className="admin-product-grid">
              <div className="admin-product-field">
                <label htmlFor="name">Название *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Например: Петля с доводчиком"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="sku">Артикул / SKU *</label>
                <input
                  id="sku"
                  name="sku"
                  type="text"
                  placeholder="Например: HNG-001"
                  value={form.sku}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="price">Цена *</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Например: 350"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="category_id">Категория *</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? "Загрузка..." : "Выберите категорию"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-product-field">
                <label htmlFor="brand">Бренд</label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  placeholder="Например: Lanttich"
                  value={form.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="line">Линейка</label>
                <select
                  id="line"
                  name="line"
                  value={form.line}
                  onChange={handleChange}
                >
                  <option value="">Не выбрана</option>
                  <option value="standard">Standard</option>
                  <option value="maxima">Maxima</option>
                  <option value="promax">Promax</option>
                </select>
              </div>

              <div className="admin-product-field">
                <label htmlFor="image_url">Ссылка на изображение</label>
                <input
                  id="image_url"
                  name="image_url"
                  type="text"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="pack_quantity">Количество в упаковке</label>
                <input
                  id="pack_quantity"
                  name="pack_quantity"
                  type="number"
                  min="0"
                  placeholder="Например: 100"
                  value={form.pack_quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="weight_grams">Вес (г)</label>
                <input
                  id="weight_grams"
                  name="weight_grams"
                  type="number"
                  min="0"
                  placeholder="Например: 320"
                  value={form.weight_grams}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="load_capacity">Нагрузка</label>
                <input
                  id="load_capacity"
                  name="load_capacity"
                  type="text"
                  placeholder="Например: 35 кг"
                  value={form.load_capacity}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="color">Цвет</label>
                <input
                  id="color"
                  name="color"
                  type="text"
                  placeholder="Например: Белый"
                  value={form.color}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="coating">Покрытие</label>
                <input
                  id="coating"
                  name="coating"
                  type="text"
                  placeholder="Например: Никель"
                  value={form.coating}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="size_label">Размер</label>
                <input
                  id="size_label"
                  name="size_label"
                  type="text"
                  placeholder="Например: 450 мм"
                  value={form.size_label}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="is_featured">Популярный товар</label>
                <select
                  id="is_featured"
                  name="is_featured"
                  value={String(form.is_featured)}
                  onChange={(e) => handleBooleanChange("is_featured", e.target.value)}
                >
                  <option value="false">Нет</option>
                  <option value="true">Да</option>
                </select>
              </div>

              <div className="admin-product-field">
                <label htmlFor="is_active">Активен</label>
                <select
                  id="is_active"
                  name="is_active"
                  value={String(form.is_active)}
                  onChange={(e) => handleBooleanChange("is_active", e.target.value)}
                >
                  <option value="true">Да</option>
                  <option value="false">Нет</option>
                </select>
              </div>

              <div className="admin-product-field">
                <label htmlFor="in_stock">В наличии</label>
                <select
                  id="in_stock"
                  name="in_stock"
                  value={String(form.in_stock)}
                  onChange={(e) => handleBooleanChange("in_stock", e.target.value)}
                >
                  <option value="true">Да</option>
                  <option value="false">Нет</option>
                </select>
              </div>
            </div>

            <div className="admin-product-field">
              <label htmlFor="description">Описание</label>
              <textarea
                id="description"
                name="description"
                placeholder="Подробное описание товара"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="admin-product-field">
              <label htmlFor="specifications">Характеристики (JSON)</label>
              <textarea
                id="specifications"
                name="specifications"
                placeholder={`Например:
{
  "тип": "с доводчиком",
  "угол_открывания": "105°",
  "монтаж": "clip-on"
}`}
                value={form.specifications}
                onChange={handleChange}
              />
            </div>

            <button type="submit" disabled={submitting || loadingCategories}>
              {submitting ? "Создание..." : "Создать товар"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}