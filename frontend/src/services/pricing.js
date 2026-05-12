import api from "./api";
import { isAuthenticated } from "./auth";

export async function getProductPrice(productId, quantity = 1) {
  if (!isAuthenticated() || !productId) {
    return null;
  }

  const response = await api.get(`/products/${productId}/price`, {
    params: { quantity },
  });

  return response.data;
}

export async function getProductPrices(productIds, quantity = 1) {
  if (!isAuthenticated() || !Array.isArray(productIds) || productIds.length === 0) {
    return {};
  }

  const response = await api.post("/products/prices/preview", {
    product_ids: productIds,
    quantity,
  });

  const items = Array.isArray(response.data) ? response.data : [];
  return items.reduce((acc, item) => {
    acc[String(item.product_id)] = item;
    return acc;
  }, {});
}
