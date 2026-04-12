export function getToken() {
  return localStorage.getItem("access_token");
}

export function setToken(token) {
  localStorage.setItem("access_token", token);
}

export function removeToken() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("current_user");
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function setCurrentUser(user) {
  localStorage.setItem("current_user", JSON.stringify(user));
}

export function getCurrentUser() {
  const raw = localStorage.getItem("current_user");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAdmin() {
  const user = getCurrentUser();

  return user?.is_admin === true || user?.role === "admin";
}