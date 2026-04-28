import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import {
  fetchStorefront,
  formatRupiah,
  whatsappLink,
  type StorefrontCategory,
  type StorefrontProduct,
  type StoreSettings,
} from "../lib/api";

export default function Storefront() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    fetchStorefront()
      .then((data) => {
        setSettings(data.settings);
        setCategories(data.categories);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .filter(
        (c) => activeCategory === "all" || c.slug === activeCategory,
      )
      .map((c) => ({
        ...c,
        products: c.products.filter((p) => {
          if (!q) return true;
          return (
            p.name.toLowerCase().includes(q) ||
            (p.duration ?? "").toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            (p.note ?? "").toLowerCase().includes(q)
          );
        }),
      }))
      .filter((c) => c.products.length > 0);
  }, [categories, search, activeCategory]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur bg-brand-950/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size={36} />
          <div className="flex items-center gap-2">
            {settings && (
              <a
                href={whatsappLink(
                  settings.whatsapp_number,
                  `Halo admin ${settings.store_name}, saya mau order.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.821 11.821 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Order WA
              </a>
            )}
            <Link to="/admin" className="btn-secondary text-sm">
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-10 md:py-16">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block text-xs uppercase tracking-[0.3em] text-amber-300 mb-3">
            {settings?.tagline ?? "Apps Premium Murah & Bergaransi"}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Toko Apps Premium <span className="text-amber-300">{settings?.store_name ?? "VannnStore"}</span>
          </h1>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            {settings?.hero_text ??
              "Toko apps premium terpercaya — proses cepat, harga bersahabat, garansi nyata."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
            <Badge>⚡ Proses Cepat</Badge>
            <Badge>🛡️ Garansi Resmi</Badge>
            <Badge>💬 Admin Standby</Badge>
            <Badge>💸 Harga Murah</Badge>
          </div>
        </div>
      </section>

      {/* Search + filter */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto card p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            placeholder="🔍 Cari produk: 'CapCut', 'Netflix', '1 bulan'..."
          />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <CategoryChip
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              label="Semua"
              icon="🛍️"
            />
            {categories.map((c) => (
              <CategoryChip
                key={c.slug}
                active={activeCategory === c.slug}
                onClick={() => setActiveCategory(c.slug)}
                label={c.name}
                icon={c.icon ?? "✨"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-10">
          {loading && (
            <div className="text-center text-white/60 py-20">Memuat produk...</div>
          )}
          {error && (
            <div className="card p-6 text-rose-300">Gagal memuat: {error}</div>
          )}
          {!loading && !error && filteredCategories.length === 0 && (
            <div className="card p-10 text-center text-white/60">
              Tidak ada produk yang cocok dengan pencarian "{search}".
            </div>
          )}
          {filteredCategories.map((cat) => (
            <CategoryBlock
              key={cat.id}
              category={cat}
              waNumber={settings?.whatsapp_number ?? ""}
              storeName={settings?.store_name ?? "VannnStore"}
            />
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 mt-10 py-8 text-center text-sm text-white/60">
        <div className="max-w-6xl mx-auto px-4">
          <Logo size={28} />
          <p className="mt-3">
            © {new Date().getFullYear()} {settings?.store_name ?? "VannnStore"} —
            Admin standby setiap hari. Order via WhatsApp.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-white/90">
      {children}
    </span>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition border ${
        active
          ? "bg-amber-400 text-brand-950 border-amber-400 font-semibold"
          : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
      }`}
    >
      <span className="mr-1">{icon}</span>
      {label}
    </button>
  );
}

function CategoryBlock({
  category,
  waNumber,
  storeName,
}: {
  category: StorefrontCategory;
  waNumber: string;
  storeName: string;
}) {
  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">{category.icon ?? "✨"}</span>
            {category.name}
          </h2>
          {category.description && (
            <p className="text-sm text-white/70 mt-1 max-w-2xl">
              {category.description}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {category.products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            categoryName={category.name}
            waNumber={waNumber}
            storeName={storeName}
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  categoryName,
  waNumber,
  storeName,
}: {
  product: StorefrontProduct;
  categoryName: string;
  waNumber: string;
  storeName: string;
}) {
  const out = product.stock <= 0;
  const message = `Halo admin ${storeName}, saya mau order:\n\n• Kategori: ${categoryName}\n• Produk: ${product.name}${product.duration ? `\n• Durasi: ${product.duration}` : ""}\n• Harga: ${formatRupiah(product.price)}\n\nMohon konfirmasi stok & cara bayarnya, terima kasih 🙏`;

  return (
    <div className="card p-5 flex flex-col gap-3 hover:border-amber-300/40 transition">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-tight">{product.name}</h3>
          {product.duration && (
            <span className="text-[10px] uppercase tracking-wider rounded-full bg-brand-700/60 border border-brand-300/30 px-2 py-0.5 whitespace-nowrap">
              {product.duration}
            </span>
          )}
        </div>
        {product.note && (
          <p className="text-xs text-white/60 mt-2 leading-relaxed whitespace-pre-line">
            {product.note}
          </p>
        )}
      </div>
      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
        <div>
          <div className="text-[11px] text-white/50 uppercase tracking-wider">
            Harga
          </div>
          <div className="text-xl font-extrabold text-amber-300">
            {formatRupiah(product.price)}
          </div>
          <div className="mt-1 text-[11px]">
            {out ? (
              <span className="text-rose-300">● Stok kosong</span>
            ) : (
              <span className="text-emerald-300">● Stok tersedia</span>
            )}
          </div>
        </div>
        <a
          href={whatsappLink(waNumber, message)}
          target="_blank"
          rel="noreferrer"
          className={out ? "btn-secondary text-sm" : "btn-primary text-sm"}
        >
          {out ? "Tanya Admin" : "Order Sekarang"}
        </a>
      </div>
    </div>
  );
}
