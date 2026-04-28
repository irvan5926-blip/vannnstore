import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import {
  changePassword,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  formatRupiah,
  getAdminSettings,
  getToken,
  listCategories,
  listProducts,
  logout,
  me,
  updateAdminSettings,
  updateCategory,
  updateProduct,
  type AdminSettings,
  type Category,
  type Product,
} from "../lib/api";

type Tab = "products" | "categories" | "settings" | "account";

export default function AdminDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("products");
  const [username, setUsername] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      nav("/admin/login", { replace: true });
      return;
    }
    me()
      .then((u) => {
        setUsername(u.username);
        setAuthChecked(true);
      })
      .catch(() => nav("/admin/login", { replace: true }));
  }, [nav]);

  if (!authChecked)
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60">
        Memuat...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur bg-brand-950/85 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Logo size={32} />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-white/70">
              👤 {username}
            </span>
            <Link to="/" className="btn-secondary text-sm">
              Lihat Toko
            </Link>
            <button
              onClick={() => {
                logout();
                nav("/admin/login", { replace: true });
              }}
              className="btn-secondary text-sm"
            >
              Keluar
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
          {([
            ["products", "Produk"],
            ["categories", "Kategori"],
            ["settings", "Toko"],
            ["account", "Akun"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition border ${
                tab === key
                  ? "bg-amber-400 text-brand-950 border-amber-400 font-semibold"
                  : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {tab === "products" && <ProductsPanel />}
        {tab === "categories" && <CategoriesPanel />}
        {tab === "settings" && <SettingsPanel />}
        {tab === "account" && <AccountPanel />}
      </main>
    </div>
  );
}

// ---------------- Products ----------------
function ProductsPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [filterCat, setFilterCat] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  async function reload() {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([listCategories(), listProducts()]);
      setCategories(c);
      setProducts(p);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    reload();
  }, []);

  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  );

  const filtered = products
    .filter((p) => filterCat === "all" || p.category_id === filterCat)
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.duration ?? "").toLowerCase().includes(q) ||
        (p.note ?? "").toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold">Kelola Produk</h2>
          <span className="text-xs text-white/50">
            Total: {products.length} produk
          </span>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="btn-primary text-sm"
          disabled={categories.length === 0}
        >
          + Tambah Produk
        </button>
      </div>

      <div className="card p-4 grid gap-3 md:grid-cols-2">
        <input
          className="input"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input"
          value={filterCat}
          onChange={(e) =>
            setFilterCat(e.target.value === "all" ? "all" : Number(e.target.value))
          }
        >
          <option value="all">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="card p-4 text-rose-300">{error}</div>}
      {loading ? (
        <div className="text-white/60">Memuat...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Durasi</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                    {p.note && (
                      <div className="text-xs text-white/50 line-clamp-2 max-w-md whitespace-pre-line">
                        {p.note}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {catMap[p.category_id]?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {p.duration ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-amber-300 font-semibold">
                    {formatRupiah(p.price)}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    {p.is_active ? (
                      <span className="text-emerald-300">Aktif</span>
                    ) : (
                      <span className="text-white/50">Nonaktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(p)}
                      className="btn-secondary text-xs"
                    >
                      Edit
                    </button>{" "}
                    <button
                      onClick={async () => {
                        if (!confirm(`Hapus produk "${p.name}"?`)) return;
                        await deleteProduct(p.id);
                        reload();
                      }}
                      className="btn-danger text-xs"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-white/50 py-8">
                    Tidak ada produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(editing || creating) && (
        <ProductFormModal
          product={editing}
          categories={categories}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function ProductFormModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    category_id: product?.category_id ?? categories[0]?.id ?? 0,
    name: product?.name ?? "",
    duration: product?.duration ?? "",
    price: product?.price ?? 0,
    note: product?.note ?? "",
    stock: product?.stock ?? 0,
    is_active: product?.is_active ?? true,
    sort_order: product?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        duration: form.duration || null,
        note: form.note || null,
      };
      if (product) await updateProduct(product.id, payload);
      else await createProduct(payload);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={product ? "Edit Produk" : "Tambah Produk"} onClose={onClose}>
      <div className="space-y-3">
        {error && (
          <div className="bg-rose-500/15 border border-rose-400/30 text-rose-200 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <Field label="Kategori">
          <select
            className="input"
            value={form.category_id}
            onChange={(e) =>
              setForm({ ...form, category_id: Number(e.target.value) })
            }
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nama Produk">
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Durasi">
            <input
              className="input"
              placeholder="1 Bulan / 7 Hari / Selamanya"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </Field>
          <Field label="Harga (Rp)">
            <input
              className="input"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) || 0 })
              }
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stok">
            <input
              className="input"
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Urutan">
            <input
              className="input"
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm({ ...form, sort_order: Number(e.target.value) || 0 })
              }
            />
          </Field>
        </div>
        <Field label="Catatan / Garansi">
          <textarea
            className="input min-h-[100px]"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Tampilkan di storefront (aktif)
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary text-sm">
            Batal
          </button>
          <button onClick={save} className="btn-primary text-sm" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------- Categories ----------------
function CategoriesPanel() {
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    try {
      setItems(await listCategories());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Kelola Kategori</h2>
        <button onClick={() => setCreating(true)} className="btn-primary text-sm">
          + Tambah Kategori
        </button>
      </div>
      {error && <div className="card p-4 text-rose-300">{error}</div>}
      {loading ? (
        <div className="text-white/60">Memuat...</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">
                    {c.icon} {c.name}
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">/{c.slug}</p>
                </div>
                <span className="text-xs text-white/40">#{c.sort_order}</span>
              </div>
              {c.description && (
                <p className="text-sm text-white/70 mt-2 line-clamp-3">
                  {c.description}
                </p>
              )}
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setEditing(c)}
                  className="btn-secondary text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (
                      !confirm(
                        `Hapus kategori "${c.name}"? Semua produk di kategori ini juga akan terhapus.`,
                      )
                    )
                      return;
                    await deleteCategory(c.id);
                    reload();
                  }}
                  className="btn-danger text-xs"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {(editing || creating) && (
        <CategoryFormModal
          category={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function CategoryFormModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    icon: category?.icon ?? "✨",
    description: category?.description ?? "",
    sort_order: category?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, slug: form.slug || autoSlug(form.name) };
      if (category) await updateCategory(category.id, payload);
      else await createCategory(payload);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={category ? "Edit Kategori" : "Tambah Kategori"}
      onClose={onClose}
    >
      <div className="space-y-3">
        {error && (
          <div className="bg-rose-500/15 border border-rose-400/30 text-rose-200 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <Field label="Nama Kategori">
          <input
            className="input"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm({
                ...form,
                name,
                slug:
                  category || form.slug !== autoSlug(form.name)
                    ? form.slug
                    : autoSlug(name),
              });
            }}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug (URL)">
            <input
              className="input"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </Field>
          <Field label="Ikon (emoji)">
            <input
              className="input"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Deskripsi">
          <textarea
            className="input min-h-[100px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <Field label="Urutan">
          <input
            className="input"
            type="number"
            value={form.sort_order}
            onChange={(e) =>
              setForm({ ...form, sort_order: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary text-sm">
            Batal
          </button>
          <button onClick={save} className="btn-primary text-sm" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------- Settings ----------------
function SettingsPanel() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    getAdminSettings()
      .then(setSettings)
      .catch((e) => setError((e as Error).message));
  }, []);

  if (!settings) return <div className="text-white/60">Memuat...</div>;

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setOkMsg(null);
    try {
      const updated = await updateAdminSettings({
        store_name: settings.store_name,
        tagline: settings.tagline,
        whatsapp_number: settings.whatsapp_number,
        logo_url: settings.logo_url,
        hero_text: settings.hero_text,
      });
      setSettings(updated);
      setOkMsg("Pengaturan disimpan.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="card p-4">
        <h2 className="text-xl font-bold">Pengaturan Toko</h2>
      </div>
      <div className="card p-5 space-y-4">
        {error && (
          <div className="bg-rose-500/15 border border-rose-400/30 text-rose-200 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {okMsg && (
          <div className="bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-sm rounded-lg px-3 py-2">
            {okMsg}
          </div>
        )}
        <Field label="Nama Toko">
          <input
            className="input"
            value={settings.store_name}
            onChange={(e) =>
              setSettings({ ...settings, store_name: e.target.value })
            }
          />
        </Field>
        <Field label="Tagline">
          <input
            className="input"
            value={settings.tagline}
            onChange={(e) =>
              setSettings({ ...settings, tagline: e.target.value })
            }
          />
        </Field>
        <Field label="Hero Text (deskripsi besar di homepage)">
          <textarea
            className="input min-h-[80px]"
            value={settings.hero_text}
            onChange={(e) =>
              setSettings({ ...settings, hero_text: e.target.value })
            }
          />
        </Field>
        <Field label="Nomor WhatsApp Admin (kode negara, tanpa +)">
          <input
            className="input"
            value={settings.whatsapp_number}
            onChange={(e) =>
              setSettings({ ...settings, whatsapp_number: e.target.value })
            }
            placeholder="6281234567890"
          />
          <p className="text-xs text-white/50 mt-1">
            Contoh: 6281234567890. Tombol "Order" di setiap produk akan otomatis
            menghubungi nomor ini.
          </p>
        </Field>
        <Field label="Logo URL (opsional, kosongkan untuk pakai logo bawaan)">
          <input
            className="input"
            value={settings.logo_url ?? ""}
            onChange={(e) =>
              setSettings({ ...settings, logo_url: e.target.value || null })
            }
            placeholder="https://..."
          />
        </Field>
        <div className="flex justify-end">
          <button onClick={save} className="btn-primary text-sm" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Account ----------------
function AccountPanel() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm2, setConfirm2] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (next !== confirm2) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    if (next.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }
    setSaving(true);
    try {
      await changePassword(current, next);
      setOk("Password berhasil diubah.");
      setCurrent("");
      setNext("");
      setConfirm2("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md">
      <div className="card p-4 mb-4">
        <h2 className="text-xl font-bold">Akun Admin</h2>
        <p className="text-sm text-white/60 mt-1">Ubah password admin.</p>
      </div>
      <form onSubmit={submit} className="card p-5 space-y-4">
        {error && (
          <div className="bg-rose-500/15 border border-rose-400/30 text-rose-200 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {ok && (
          <div className="bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-sm rounded-lg px-3 py-2">
            {ok}
          </div>
        )}
        <Field label="Password Saat Ini">
          <input
            className="input"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </Field>
        <Field label="Password Baru">
          <input
            className="input"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
        </Field>
        <Field label="Konfirmasi Password Baru">
          <input
            className="input"
            type="password"
            value={confirm2}
            onChange={(e) => setConfirm2(e.target.value)}
            required
          />
        </Field>
        <div className="flex justify-end">
          <button className="btn-primary text-sm" disabled={saving}>
            {saving ? "Menyimpan..." : "Ubah Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------- Reusable bits ----------------
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs uppercase tracking-wider text-white/60">
        {label}
      </label>
      {children}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto bg-brand-900/95 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
