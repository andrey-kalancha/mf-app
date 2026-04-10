import api from "./api";

export async function getCartCount() {
  try {
    const response = await api.get("/cart");
    const items = Array.isArray(response.data?.items) ? response.data.items : [];

    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  } catch (error) {
    return 0;
  }
}