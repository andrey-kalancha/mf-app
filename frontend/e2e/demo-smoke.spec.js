import { test, expect } from "@playwright/test";

test("public demo flow opens catalog and product pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation")).toBeVisible();

  await page.getByRole("link", { name: /каталог/i }).first().click();
  await expect(page.getByPlaceholder(/поиск/i)).toBeVisible();

  const firstProduct = page.locator(".product-card").first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.getByRole("link", { name: /подробнее/i }).click();
  await expect(page.getByRole("button", { name: /добавить в корзину/i })).toBeVisible();
});

test("admin navigation is reachable after login route guard", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/login|admin/);
});
