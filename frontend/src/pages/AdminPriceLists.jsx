import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import AdminNav from "../components/AdminNav";
import "./AdminPriceLists.css";

function formatPrice(value, currency = "KZT") {
  const num = Number(value || 0);
  return `${num.toLocaleString("ru-RU")} ${currency}`;
}

export default function AdminPriceLists() {
  const [priceLists, setPriceLists] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [itemSubmittingId, setItemSubmittingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    client_id: "",
    description: "",
    discount_percent: "",
    currency: "KZT",
    is_active: true,
  });

  const [itemDrafts, setItemDrafts] = useState({});

  const productMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[String(product.id)] = product;
      return acc;
    }, {});
  }, [products]);

  const userMap = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[String(user.id)] = user;
      return acc;
    }, {});
  }, [users]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [priceListsResponse, usersResponse, productsResponse] =
        await Promise.all([
          api.get("/price-lists"),
          api.get("/users"),
          api.get("/products"),
        ]);

      setPriceLists(
        Array.isArray(priceListsResponse.data) ? priceListsResponse.data : []
      );
      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      setProducts(
        Array.isArray(productsResponse.data) ? productsResponse.data : []
      );
    } catch (err) {
      console.error("Ошибка загрузки прайс-листов:", err);
      toast.error("Не удалось загрузить прайс-листы");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBooleanChange = (value) => {
    setForm((prev) => ({
      ...prev,
      is_active: value === "true",
    }));
  };

  const handleItemDraftChange = (priceListId, name, value) => {
    setItemDrafts((prev) => ({
      ...prev,
      [priceListId]: {
        product_id: "",
        price: "",
        min_quantity: "1",
        note: "",
        ...(prev[priceListId] || {}),
        [name]: value,
      },
    }));
  };

  const handleCreatePriceList = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      client_id: form.client_id ? Number(form.client_id) : null,
      description: form.description.trim() || null,
      discount_percent: form.discount_percent
        ? Number(form.discount_percent)
        : null,
      currency: form.currency.trim() || "KZT",
      is_active: form.is_active,
    };

    if (!payload.name) {
      toast.error("Укажите название прайс-листа");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post("/price-lists", payload);
      setPriceLists((prev) => [response.data, ...prev]);
      setForm({
        name: "",
        client_id: "",
        description: "",
        discount_percent: "",
        currency: "KZT",
        is_active: true,
      });
      toast.success("Прайс-лист создан");
    } catch (err) {
      console.error("Ошибка создания прайс-листа:", err);
      toast.error(err.response?.data?.detail || "Не удалось создать прайс-лист");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateItem = async (priceListId) => {
    const draft = itemDrafts[priceListId] || {};
    const payload = {
      product_id: draft.product_id ? Number(draft.product_id) : 0,
      price: Number(draft.price || 0),
      min_quantity: Number(draft.min_quantity || 1),
      note: draft.note?.trim() || null,
    };

    if (!payload.product_id || payload.price < 0) {
      toast.error("Выберите товар и укажите цену");
      return;
    }

    try {
      setItemSubmittingId(priceListId);
      const response = await api.post(
        `/price-lists/${priceListId}/items`,
        payload
      );
      setPriceLists((prev) =>
        prev.map((priceList) =>
          priceList.id === priceListId
            ? {
                ...priceList,
                items: [...(priceList.items || []), response.data],
              }
            : priceList
        )
      );
      setItemDrafts((prev) => ({
        ...prev,
        [priceListId]: {
          product_id: "",
          price: "",
          min_quantity: "1",
          note: "",
        },
      }));
      toast.success("Позиция добавлена в прайс");
    } catch (err) {
      console.error("Ошибка добавления позиции:", err);
      toast.error(err.response?.data?.detail || "Не удалось добавить позицию");
    } finally {
      setItemSubmittingId(null);
    }
  };

  const handleDeleteItem = async (priceListId, itemId) => {
    const confirmed = window.confirm("Удалить позицию из прайс-листа?");
    if (!confirmed) return;

    try {
      await api.delete(`/price-lists/items/${itemId}`);
      setPriceLists((prev) =>
        prev.map((priceList) =>
          priceList.id === priceListId
            ? {
                ...priceList,
                items: (priceList.items || []).filter(
                  (item) => item.id !== itemId
                ),
              }
            : priceList
        )
      );
      toast.success("Позиция удалена");
    } catch (err) {
      console.error("Ошибка удаления позиции:", err);
      toast.error(err.response?.data?.detail || "Не удалось удалить позицию");
    }
  };

  const handleDeletePriceList = async (priceListId) => {
    const confirmed = window.confirm("Удалить прайс-лист?");
    if (!confirmed) return;

    try {
      await api.delete(`/price-lists/${priceListId}`);
      setPriceLists((prev) =>
        prev.filter((priceList) => priceList.id !== priceListId)
      );
      toast.success("Прайс-лист удален");
    } catch (err) {
      console.error("Ошибка удаления прайс-листа:", err);
      toast.error(err.response?.data?.detail || "Не удалось удалить прайс-лист");
    }
  };

  return (
    <section className="admin-price-page">
      <div className="admin-price-shell">
        <div className="admin-price-heading">
          <div className="admin-price-badge">Admin / B2B</div>
          <h1>Персональные прайс-листы</h1>
          <p>
            Создавайте прайсы для клиентов, добавляйте товары и фиксируйте
            индивидуальные цены для B2B-заказов.
          </p>
        </div>

        <AdminNav />

        <div className="admin-price-card">
          <form className="admin-price-form" onSubmit={handleCreatePriceList}>
            <div className="admin-price-grid">
              <label>
                Название *
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Прайс для мебельного цеха"
                />
              </label>

              <label>
                Клиент
                <select
                  name="client_id"
                  value={form.client_id}
                  onChange={handleChange}
                >
                  <option value="">Общий прайс</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Скидка, %
                <input
                  name="discount_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.discount_percent}
                  onChange={handleChange}
                  placeholder="5"
                />
              </label>

              <label>
                Валюта
                <input
                  name="currency"
                  type="text"
                  value={form.currency}
                  onChange={handleChange}
                />
              </label>

              <label>
                Активен
                <select
                  value={String(form.is_active)}
                  onChange={(e) => handleBooleanChange(e.target.value)}
                >
                  <option value="true">Да</option>
                  <option value="false">Нет</option>
                </select>
              </label>
            </div>

            <label>
              Описание
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Условия, договоренности, комментарий менеджера"
              />
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? "Создание..." : "Создать прайс-лист"}
            </button>
          </form>
        </div>

        <div className="admin-price-list">
          {loading ? (
            <div className="admin-price-card">Загрузка...</div>
          ) : priceLists.length === 0 ? (
            <div className="admin-price-card">Прайс-листы пока не созданы.</div>
          ) : (
            priceLists.map((priceList) => {
              const draft = itemDrafts[priceList.id] || {
                product_id: "",
                price: "",
                min_quantity: "1",
                note: "",
              };

              return (
                <article className="admin-price-card" key={priceList.id}>
                  <div className="admin-price-card-head">
                    <div>
                      <span>{priceList.is_active ? "Активен" : "Скрыт"}</span>
                      <h2>{priceList.name}</h2>
                      <p>
                        Клиент:{" "}
                        {priceList.client_id
                          ? userMap[String(priceList.client_id)]?.email ||
                            `#${priceList.client_id}`
                          : "общий прайс"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="admin-price-danger"
                      onClick={() => handleDeletePriceList(priceList.id)}
                    >
                      Удалить
                    </button>
                  </div>

                  <div className="admin-price-meta">
                    <span>Скидка: {priceList.discount_percent || 0}%</span>
                    <span>Валюта: {priceList.currency}</span>
                    <span>Позиций: {(priceList.items || []).length}</span>
                  </div>

                  <div className="admin-price-items">
                    {(priceList.items || []).map((item) => (
                      <div className="admin-price-item" key={item.id}>
                        <div>
                          <strong>
                            {productMap[String(item.product_id)]?.name ||
                              `Товар #${item.product_id}`}
                          </strong>
                          <span>
                            {formatPrice(item.price, priceList.currency)} от{" "}
                            {item.min_quantity} шт.
                          </span>
                          {item.note && <p>{item.note}</p>}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteItem(priceList.id, item.id)
                          }
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="admin-price-add-item">
                    <select
                      value={draft.product_id}
                      onChange={(e) =>
                        handleItemDraftChange(
                          priceList.id,
                          "product_id",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Выберите товар</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Цена"
                      value={draft.price}
                      onChange={(e) =>
                        handleItemDraftChange(
                          priceList.id,
                          "price",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      min="1"
                      placeholder="Мин. кол-во"
                      value={draft.min_quantity}
                      onChange={(e) =>
                        handleItemDraftChange(
                          priceList.id,
                          "min_quantity",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="text"
                      placeholder="Комментарий"
                      value={draft.note}
                      onChange={(e) =>
                        handleItemDraftChange(priceList.id, "note", e.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => handleCreateItem(priceList.id)}
                      disabled={itemSubmittingId === priceList.id}
                    >
                      {itemSubmittingId === priceList.id ? "Добавление..." : "Добавить"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
