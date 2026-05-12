import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import AdminNav from "../components/AdminNav";
import "./AdminCreateProduct.css";

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [images, setImages] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [mediaSubmitting, setMediaSubmitting] = useState(false);
  const [drawingSubmitting, setDrawingSubmitting] = useState(false);

  const [imageForm, setImageForm] = useState({
    image_url: "",
    alt_text: "",
    sort_order: "0",
    is_primary: false,
  });

  const [drawingForm, setDrawingForm] = useState({
    title: "",
    file_url: "",
    preview_url: "",
    description: "",
    sort_order: "0",
  });

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
    const loadData = async () => {
      try {
        setLoading(true);

        const [productResponse, categoriesResponse] = await Promise.all([
          api.get(`/products/${id}`),
          api.get("/categories"),
        ]);

        const product = productResponse.data;
        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];

        setCategories(categoriesData);
        setImages(Array.isArray(product.images) ? product.images : []);
        setDrawings(Array.isArray(product.drawings) ? product.drawings : []);

        setForm({
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
          sku: product.sku || "",
          category_id: product.category_id ? String(product.category_id) : "",

          brand: product.brand || "Lanttich",
          line: product.line || "",
          image_url: product.image_url || "",

          is_featured: Boolean(product.is_featured),
          is_active: product.is_active ?? true,
          in_stock: product.in_stock ?? true,

          pack_quantity:
            product.pack_quantity !== null && product.pack_quantity !== undefined
              ? String(product.pack_quantity)
              : "",
          weight_grams:
            product.weight_grams !== null && product.weight_grams !== undefined
              ? String(product.weight_grams)
              : "",

          load_capacity: product.load_capacity || "",
          color: product.color || "",
          coating: product.coating || "",
          size_label: product.size_label || "",

          specifications: product.specifications
            ? JSON.stringify(product.specifications, null, 2)
            : "",
        });
      } catch (err) {
        console.error("Ошибка загрузки товара:", err);
        toast.error("Не удалось загрузить товар");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

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

  const handleImageFormChange = (e) => {
    const { name, value } = e.target;
    setImageForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrawingFormChange = (e) => {
    const { name, value } = e.target;
    setDrawingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagePrimaryChange = (value) => {
    setImageForm((prev) => ({
      ...prev,
      is_primary: value === "true",
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
      await api.put(`/products/${id}`, payload);
      toast.success("Товар успешно обновлён");
      navigate("/admin");
    } catch (err) {
      console.error("Ошибка обновления товара:", err);
      toast.error(err.response?.data?.detail || "Не удалось обновить товар");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Удалить товар? Это действие нельзя отменить.");
    if (!confirmed) return;

    try {
      setDeleting(true);
      await api.delete(`/products/${id}`);
      toast.success("Товар удалён");
      navigate("/admin");
    } catch (err) {
      console.error("Ошибка удаления товара:", err);
      toast.error(err.response?.data?.detail || "Не удалось удалить товар");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();

    const payload = {
      image_url: imageForm.image_url.trim(),
      alt_text: imageForm.alt_text.trim() || null,
      sort_order: Number(imageForm.sort_order || 0),
      is_primary: imageForm.is_primary,
    };

    if (!payload.image_url) {
      toast.error("Укажите ссылку на изображение");
      return;
    }

    try {
      setMediaSubmitting(true);
      const response = await api.post(`/products/${id}/images`, payload);
      setImages((prev) => {
        const next = payload.is_primary
          ? prev.map((item) => ({ ...item, is_primary: false }))
          : prev;
        return [...next, response.data].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
      });
      setImageForm({
        image_url: "",
        alt_text: "",
        sort_order: "0",
        is_primary: false,
      });
      toast.success("Изображение добавлено");
    } catch (err) {
      console.error("Ошибка добавления изображения:", err);
      toast.error(err.response?.data?.detail || "Не удалось добавить изображение");
    } finally {
      setMediaSubmitting(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    const confirmed = window.confirm("Удалить изображение товара?");
    if (!confirmed) return;

    try {
      await api.delete(`/products/images/${imageId}`);
      setImages((prev) => prev.filter((item) => item.id !== imageId));
      toast.success("Изображение удалено");
    } catch (err) {
      console.error("Ошибка удаления изображения:", err);
      toast.error(err.response?.data?.detail || "Не удалось удалить изображение");
    }
  };

  const handleAddDrawing = async (e) => {
    e.preventDefault();

    const payload = {
      title: drawingForm.title.trim(),
      file_url: drawingForm.file_url.trim(),
      preview_url: drawingForm.preview_url.trim() || null,
      description: drawingForm.description.trim() || null,
      sort_order: Number(drawingForm.sort_order || 0),
    };

    if (!payload.title || !payload.file_url) {
      toast.error("Укажите название и ссылку на файл");
      return;
    }

    try {
      setDrawingSubmitting(true);
      const response = await api.post(`/products/${id}/drawings`, payload);
      setDrawings((prev) =>
        [...prev, response.data].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        )
      );
      setDrawingForm({
        title: "",
        file_url: "",
        preview_url: "",
        description: "",
        sort_order: "0",
      });
      toast.success("Чертеж добавлен");
    } catch (err) {
      console.error("Ошибка добавления чертежа:", err);
      toast.error(err.response?.data?.detail || "Не удалось добавить чертеж");
    } finally {
      setDrawingSubmitting(false);
    }
  };

  const handleDeleteDrawing = async (drawingId) => {
    const confirmed = window.confirm("Удалить чертеж товара?");
    if (!confirmed) return;

    try {
      await api.delete(`/products/drawings/${drawingId}`);
      setDrawings((prev) => prev.filter((item) => item.id !== drawingId));
      toast.success("Чертеж удален");
    } catch (err) {
      console.error("Ошибка удаления чертежа:", err);
      toast.error(err.response?.data?.detail || "Не удалось удалить чертеж");
    }
  };

  if (loading) {
    return (
      <section className="admin-product-page">
        <div className="admin-product-shell">
          <div className="admin-product-heading">
            <div className="admin-product-badge">Admin / Product</div>
            <h1 className="admin-product-title">Загрузка товара...</h1>
            <p className="admin-product-subtitle">
              Подготавливаем данные для редактирования.
            </p>
          </div>

          <AdminNav />

          <div className="admin-product-card">
            <p style={{ color: "rgba(255,255,255,0.72)", margin: 0 }}>
              Загрузка...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-product-page">
      <div className="admin-product-shell">
        <div className="admin-product-heading">
          <div className="admin-product-badge">Admin / Product</div>
          <h1 className="admin-product-title">Редактировать товар</h1>
          <p className="admin-product-subtitle">
            Обновите данные товара, характеристики и параметры отображения в каталоге.
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
                >
                  <option value="">Выберите категорию</option>
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

            <button type="submit" disabled={submitting}>
              {submitting ? "Сохранение..." : "Сохранить изменения"}
            </button>

            <button
              type="button"
              className="admin-product-delete-btn"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Удаление..." : "Удалить товар"}
            </button>
          </form>
        </div>

        <div className="admin-product-media-grid">
          <div className="admin-product-media-card">
            <div className="admin-product-media-head">
              <div>
                <div className="admin-product-badge">Gallery</div>
                <h2>Изображения товара</h2>
              </div>
              <span>{images.length}</span>
            </div>

            <form className="admin-product-form" onSubmit={handleAddImage}>
              <div className="admin-product-field">
                <label htmlFor="image_url_media">Ссылка на изображение *</label>
                <input
                  id="image_url_media"
                  name="image_url"
                  type="text"
                  placeholder="/catalog-assets/generated/opening-systems.png"
                  value={imageForm.image_url}
                  onChange={handleImageFormChange}
                />
              </div>

              <div className="admin-product-grid">
                <div className="admin-product-field">
                  <label htmlFor="alt_text">Alt-текст</label>
                  <input
                    id="alt_text"
                    name="alt_text"
                    type="text"
                    placeholder="Петля Lanttich"
                    value={imageForm.alt_text}
                    onChange={handleImageFormChange}
                  />
                </div>

                <div className="admin-product-field">
                  <label htmlFor="image_sort_order">Сортировка</label>
                  <input
                    id="image_sort_order"
                    name="sort_order"
                    type="number"
                    min="0"
                    value={imageForm.sort_order}
                    onChange={handleImageFormChange}
                  />
                </div>

                <div className="admin-product-field">
                  <label htmlFor="is_primary">Главное изображение</label>
                  <select
                    id="is_primary"
                    value={String(imageForm.is_primary)}
                    onChange={(e) => handleImagePrimaryChange(e.target.value)}
                  >
                    <option value="false">Нет</option>
                    <option value="true">Да</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={mediaSubmitting}>
                {mediaSubmitting ? "Добавление..." : "Добавить изображение"}
              </button>
            </form>

            <div className="admin-product-media-list">
              {images.length === 0 ? (
                <p>Изображения пока не добавлены.</p>
              ) : (
                images.map((image) => (
                  <div className="admin-product-media-item" key={image.id}>
                    <img src={image.image_url} alt={image.alt_text || "Товар"} />
                    <div>
                      <strong>{image.alt_text || "Изображение товара"}</strong>
                      <span>{image.image_url}</span>
                      {image.is_primary && <em>Главное</em>}
                    </div>
                    <button type="button" onClick={() => handleDeleteImage(image.id)}>
                      Удалить
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="admin-product-media-card">
            <div className="admin-product-media-head">
              <div>
                <div className="admin-product-badge">Drawings</div>
                <h2>Чертежи и файлы</h2>
              </div>
              <span>{drawings.length}</span>
            </div>

            <form className="admin-product-form" onSubmit={handleAddDrawing}>
              <div className="admin-product-grid">
                <div className="admin-product-field">
                  <label htmlFor="drawing_title">Название *</label>
                  <input
                    id="drawing_title"
                    name="title"
                    type="text"
                    placeholder="Монтажный чертеж"
                    value={drawingForm.title}
                    onChange={handleDrawingFormChange}
                  />
                </div>

                <div className="admin-product-field">
                  <label htmlFor="drawing_sort_order">Сортировка</label>
                  <input
                    id="drawing_sort_order"
                    name="sort_order"
                    type="number"
                    min="0"
                    value={drawingForm.sort_order}
                    onChange={handleDrawingFormChange}
                  />
                </div>
              </div>

              <div className="admin-product-field">
                <label htmlFor="file_url">Ссылка на файл *</label>
                <input
                  id="file_url"
                  name="file_url"
                  type="text"
                  placeholder="/files/drawings/hinge.pdf"
                  value={drawingForm.file_url}
                  onChange={handleDrawingFormChange}
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="preview_url">Превью</label>
                <input
                  id="preview_url"
                  name="preview_url"
                  type="text"
                  placeholder="/files/drawings/hinge-preview.png"
                  value={drawingForm.preview_url}
                  onChange={handleDrawingFormChange}
                />
              </div>

              <div className="admin-product-field">
                <label htmlFor="drawing_description">Описание</label>
                <textarea
                  id="drawing_description"
                  name="description"
                  placeholder="Краткое описание файла"
                  value={drawingForm.description}
                  onChange={handleDrawingFormChange}
                />
              </div>

              <button type="submit" disabled={drawingSubmitting}>
                {drawingSubmitting ? "Добавление..." : "Добавить чертеж"}
              </button>
            </form>

            <div className="admin-product-media-list">
              {drawings.length === 0 ? (
                <p>Чертежи пока не добавлены.</p>
              ) : (
                drawings.map((drawing) => (
                  <div className="admin-product-file-item" key={drawing.id}>
                    <div>
                      <strong>{drawing.title}</strong>
                      <span>{drawing.file_url}</span>
                      {drawing.description && <p>{drawing.description}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDrawing(drawing.id)}
                    >
                      Удалить
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
