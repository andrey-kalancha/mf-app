import api from "./api";

const CART_UPDATED_EVENT = "cart:updated";

export async function getCartCount() {
  try {
    const response = await api.get("/cart");
    const items = Array.isArray(response.data?.items) ? response.data.items : [];

    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  } catch (error) {
    return 0;
  }
}

export function emitCartUpdated(count = null) {
  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: { count },
    })
  );
}

export function subscribeCartUpdated(handler) {
  const listener = (event) => {
    handler(event.detail?.count ?? null);
  };

  window.addEventListener(CART_UPDATED_EVENT, listener);

  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, listener);
  };
}
