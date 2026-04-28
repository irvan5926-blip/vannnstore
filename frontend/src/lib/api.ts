export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8888"
    : "");

const TOKEN_KEY = "vannnstore_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      // ignore
    }
    if (res.status === 401 && auth) {
      setToken(null);
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ----- Public -----
export type StorefrontProduct = {
  id: number;
  name: string;
  duration: string | null;
  price: number;
  note: string | null;
  stock: number;
};
export type StorefrontCategory = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  products: StorefrontProduct[];
};
export type StoreSettings = {
  store_name: string;
  tagline: string;
  whatsapp_number: string;
  logo_url: string | null;
  hero_text: string;
};
export type StorefrontResponse = {
  settings: StoreSettings;
  categories: StorefrontCategory[];
};

export const fetchStorefront = () =>
  request<StorefrontResponse>("/api/storefront");

// ----- Auth -----
export async function login(username: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Login gagal");
  }
  const data = (await res.json()) as { access_token: string; username: string };
  setToken(data.access_token);
  return data;
}

export const logout = () => setToken(null);

export const me = () => request<{ username: string }>("/api/auth/me", {}, true);

export const changePassword = (current_password: string, new_password: string) =>
  request<{ ok: boolean }>(
    "/api/auth/change-password",
    {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    },
    true,
  );

// ----- Admin: Settings -----
export type AdminSettings = StoreSettings & { id: number };
export const getAdminSettings = () =>
  request<AdminSettings>("/api/admin/settings", {}, true);
export const updateAdminSettings = (body: Partial<StoreSettings>) =>
  request<AdminSettings>(
    "/api/admin/settings",
    { method: "PUT", body: JSON.stringify(body) },
    true,
  );

// ----- Admin: Categories -----
export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
};

export const listCategories = () =>
  request<Category[]>("/api/admin/categories", {}, true);
export const createCategory = (body: Omit<Category, "id">) =>
  request<Category>(
    "/api/admin/categories",
    { method: "POST", body: JSON.stringify(body) },
    true,
  );
export const updateCategory = (id: number, body: Partial<Category>) =>
  request<Category>(
    `/api/admin/categories/${id}`,
    { method: "PUT", body: JSON.stringify(body) },
    true,
  );
export const deleteCategory = (id: number) =>
  request<{ ok: boolean }>(
    `/api/admin/categories/${id}`,
    { method: "DELETE" },
    true,
  );

// ----- Admin: Products -----
export type Product = {
  id: number;
  category_id: number;
  name: string;
  duration: string | null;
  price: number;
  note: string | null;
  stock: number;
  is_active: boolean;
  sort_order: number;
};

export const listProducts = () =>
  request<Product[]>("/api/admin/products", {}, true);
export const createProduct = (body: Omit<Product, "id">) =>
  request<Product>(
    "/api/admin/products",
    { method: "POST", body: JSON.stringify(body) },
    true,
  );
export const updateProduct = (id: number, body: Partial<Product>) =>
  request<Product>(
    `/api/admin/products/${id}`,
    { method: "PUT", body: JSON.stringify(body) },
    true,
  );
export const deleteProduct = (id: number) =>
  request<{ ok: boolean }>(
    `/api/admin/products/${id}`,
    { method: "DELETE" },
    true,
  );

// ----- Helpers -----
export function formatRupiah(value: number): string {
  if (value === 0) return "GRATIS";
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function whatsappLink(phone: string, message: string): string {
  const normalized = phone.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
