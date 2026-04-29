import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import AppIcon from "../components/AppIcon";
import {
  API_BASE,
  fetchStorefront,
  formatRupiah,
  whatsappLink,
  type StorefrontCategory,
  type StorefrontProduct,
  type StoreSettings,
} from "../lib/api";

// Resolve image_url stored in DB. We bundle SVG logos under /logos in the
// frontend public dir, so a path like "/logos/canva.svg" should be served
// directly by the static host (NOT the API origin).
function resolveImage(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/logos/")) return url; // served by frontend host
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return url;
}

export default function Storefront() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const sectionsRef = useRef<Record<string, HTMLDivElement | null>>({});

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
      .filter((c) => activeCategory === "all" || c.slug === activeCategory)
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

  const totalProducts = categories.reduce((acc, c) => acc + c.products.length, 0);
  const storeName = settings?.store_name ?? "VannnStore";
  const waNumber = settings?.whatsapp_number ?? "";

  return (
    <div className="bg-store min-h-screen flex flex-col">
      {/* ===================== HEADER ===================== */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#0a0d18]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-shrink-0">
            <Logo size={36} />
          </div>
          <div className="flex-1 hidden md:block">
            <SearchInput value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {settings && (
              <a
                href={whatsappLink(
                  settings.whatsapp_number,
                  `Halo admin ${settings.store_name}, saya mau order.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="btn-wa text-sm hidden sm:inline-flex"
              >
                <WhatsAppIcon />
                Chat WA
              </a>
            )}
            <Link to="/admin" className="btn-secondary text-sm">
              Admin
            </Link>
          </div>
        </div>
        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <SearchInput value={search} onChange={setSearch} />
        </div>
      </header>

      {/* ===================== HERO ===================== */}
      <section className="px-4 pt-8 md:pt-14 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-400/15 via-indigo-500/10 to-purple-500/15 p-6 md:p-12">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-400/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl" />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300 font-semibold mb-3">
                  <SparkleIcon /> {settings?.tagline ?? "Apps Premium Murah & Bergaransi"}
                </span>
                <h1 className="text-3xl md:text-5xl font-black leading-tight">
                  Toko Apps Premium
                  <br />
                  <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                    {storeName}
                  </span>
                </h1>
                <p className="mt-4 text-white/80 max-w-xl">
                  {settings?.hero_text ??
                    "Toko apps premium terpercaya — proses cepat, harga bersahabat, garansi nyata."}
                </p>

                {/* Stats */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <Stat label="Apps" value={categories.length} />
                  <Stat label="Produk" value={totalProducts} />
                  <Stat label="Garansi" value="Resmi" valueIsString />
                  <Stat label="Pengiriman" value="Instan" valueIsString />
                </div>

                {/* CTA */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={whatsappLink(
                      waNumber,
                      `Halo admin ${storeName}, saya mau order.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-wa"
                  >
                    <WhatsAppIcon /> Pesan via WhatsApp
                  </a>
                  <a href="#kategori" className="btn-secondary">
                    Lihat Semua Apps →
                  </a>
                </div>
              </div>

              {/* Right: floating featured logos collage */}
              <div className="relative h-64 md:h-80 hidden md:block">
                {categories.slice(0, 9).map((c, idx) => {
                  const positions = [
                    { top: "5%", left: "10%", size: 64, delay: "0s" },
                    { top: "20%", left: "55%", size: 80, delay: "0.4s" },
                    { top: "55%", left: "5%", size: 72, delay: "0.8s" },
                    { top: "60%", left: "70%", size: 88, delay: "0.2s" },
                    { top: "10%", left: "75%", size: 60, delay: "0.6s" },
                    { top: "40%", left: "32%", size: 96, delay: "0s" },
                    { top: "75%", left: "40%", size: 56, delay: "0.5s" },
                    { top: "30%", left: "85%", size: 52, delay: "0.3s" },
                    { top: "78%", left: "10%", size: 60, delay: "0.7s" },
                  ];
                  const pos = positions[idx];
                  return (
                    <div
                      key={c.slug}
                      className="absolute hover:scale-110 transition"
                      style={{
                        top: pos.top,
                        left: pos.left,
                        animation: `float 6s ease-in-out infinite`,
                        animationDelay: pos.delay,
                      }}
                    >
                      <AppIcon
                        name={c.name}
                        imageUrl={resolveImage(c.image_url)}
                        brandColor={c.brand_color}
                        size={pos.size}
                      />
                    </div>
                  );
                })}
                <style>{`@keyframes float {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TRUST SIGNALS ===================== */}
      <section className="px-4 pb-2">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          <Trust
            icon="⚡"
            title="Proses Cepat"
            desc="Akun langsung dikirim setelah bayar"
          />
          <Trust
            icon="🛡️"
            title="Bergaransi"
            desc="Backfree & full garansi sesuai produk"
          />
          <Trust
            icon="💬"
            title="Admin Standby"
            desc="Online setiap hari, balas cepat"
          />
          <Trust
            icon="💸"
            title="Harga Murah"
            desc="Termurah, tanpa biaya tambahan"
          />
        </div>
      </section>

      {/* ===================== QUICK CATEGORIES (CIRCULAR ICON GRID) ===================== */}
      <section id="kategori" className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Pilih Aplikasi"
            subtitle={`${categories.length} aplikasi premium tersedia`}
          />
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-3 md:gap-4">
            <CategoryQuickTile
              active={activeCategory === "all"}
              label="Semua"
              brandColor="#1f2937"
              fallbackInitial="🛍️"
              onClick={() => {
                setActiveCategory("all");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            {categories.map((c) => (
              <CategoryQuickTile
                key={c.slug}
                active={activeCategory === c.slug}
                label={c.name}
                imageUrl={resolveImage(c.image_url)}
                brandColor={c.brand_color}
                onClick={() => {
                  setActiveCategory("all");
                  setSearch("");
                  // smooth scroll to that category section
                  setTimeout(() => {
                    const el = sectionsRef.current[c.slug];
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 80;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }, 50);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PRODUCTS BY CATEGORY ===================== */}
      <section className="flex-1 px-4 pb-16">
        <div className="max-w-6xl mx-auto space-y-12">
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
            <div
              key={cat.id}
              ref={(el) => {
                sectionsRef.current[cat.slug] = el;
              }}
            >
              <CategoryBlock
                category={cat}
                waNumber={waNumber}
                storeName={storeName}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-white/5 py-10 mt-4">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div>
            <Logo size={32} />
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              Toko apps premium terpercaya. Proses instan, garansi resmi, harga
              termurah. Order via WhatsApp 24/7.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-3">
              Kontak
            </h4>
            <a
              href={whatsappLink(
                waNumber,
                `Halo admin ${storeName}, saya mau order.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="text-white/70 hover:text-amber-300 text-sm flex items-center gap-2"
            >
              <WhatsAppIcon />
              <span>WhatsApp: +{waNumber}</span>
            </a>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-3">
              Aplikasi Populer
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {categories.slice(0, 8).map((c) => (
                <span
                  key={c.slug}
                  className="text-xs rounded-full px-2.5 py-1 bg-white/5 border border-white/10 text-white/70"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-white/5 text-center text-xs text-white/40">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </footer>

      {/* ===================== FLOATING WA BUTTON ===================== */}
      {settings && (
        <a
          href={whatsappLink(
            settings.whatsapp_number,
            `Halo admin ${settings.store_name}, saya mau order.`,
          )}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-400 text-white px-5 py-3 font-semibold shadow-2xl shadow-green-500/40"
          aria-label="Chat WhatsApp"
        >
          <WhatsAppIcon />
          <span className="hidden sm:inline">Order WhatsApp</span>
        </a>
      )}
    </div>
  );
}

// ===================== Sub-components =====================

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input pl-10"
        placeholder="Cari aplikasi: CapCut, Netflix, Canva, Disney+..."
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
        <SearchIcon />
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  valueIsString,
}: {
  label: string;
  value: number | string;
  valueIsString?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
      <div className="text-xl font-bold leading-none">
        {valueIsString ? value : `${value}+`}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-white/60 mt-1">
        {label}
      </div>
    </div>
  );
}

function Trust({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 md:p-4 flex items-start gap-3">
      <div className="text-2xl md:text-3xl shrink-0">{icon}</div>
      <div>
        <div className="font-semibold text-sm md:text-base">{title}</div>
        <div className="text-xs text-white/60 mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold">{title}</h2>
        {subtitle && (
          <p className="text-white/60 mt-1 text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function CategoryQuickTile({
  active,
  label,
  imageUrl,
  brandColor,
  fallbackInitial,
  onClick,
}: {
  active: boolean;
  label: string;
  imageUrl?: string | null;
  brandColor?: string | null;
  fallbackInitial?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-1.5 transition ${
        active ? "scale-[1.05]" : ""
      }`}
    >
      <div
        className={`relative ${
          active ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-[#0a0d18] rounded-2xl" : ""
        }`}
      >
        {fallbackInitial ? (
          <div
            className="rounded-2xl flex items-center justify-center text-3xl"
            style={{
              width: 64,
              height: 64,
              background:
                "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 16px rgba(0,0,0,0.3)",
            }}
          >
            {fallbackInitial}
          </div>
        ) : (
          <AppIcon
            name={label}
            imageUrl={imageUrl}
            brandColor={brandColor}
            size={64}
            className="group-hover:scale-105 transition"
          />
        )}
      </div>
      <div
        className={`text-[11px] md:text-xs text-center leading-tight ${
          active ? "text-amber-300 font-semibold" : "text-white/80"
        }`}
        style={{
          width: 76,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {label}
      </div>
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
      <div className="mb-4 flex items-center gap-3">
        <AppIcon
          name={category.name}
          imageUrl={resolveImage(category.image_url)}
          brandColor={category.brand_color}
          size={56}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-extrabold leading-tight">
            {category.name}
          </h2>
          {category.description && (
            <p className="text-xs md:text-sm text-white/65 mt-0.5">
              {category.description}
            </p>
          )}
        </div>
        <div className="hidden md:block text-xs text-white/50">
          {category.products.length} produk
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {category.products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            category={category}
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
  category,
  waNumber,
  storeName,
}: {
  product: StorefrontProduct;
  category: StorefrontCategory;
  waNumber: string;
  storeName: string;
}) {
  const out = product.stock <= 0;
  const message = `Halo admin ${storeName}, saya mau order:\n\n• Kategori: ${category.name}\n• Produk: ${product.name}${product.duration ? `\n• Durasi: ${product.duration}` : ""}\n• Harga: ${formatRupiah(product.price)}\n\nMohon konfirmasi stok & cara bayarnya, terima kasih 🙏`;

  return (
    <div className="product-card">
      <div className="flex items-start gap-3">
        <AppIcon
          name={category.name}
          imageUrl={resolveImage(category.image_url)}
          brandColor={category.brand_color}
          size={48}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">
            {category.name}
          </div>
          <h3 className="font-semibold text-base leading-snug mt-0.5">
            {product.name}
          </h3>
        </div>
        {product.duration && (
          <span className="text-[10px] uppercase tracking-wider rounded-full bg-white/10 border border-white/15 px-2 py-0.5 whitespace-nowrap">
            {product.duration}
          </span>
        )}
      </div>

      {product.note && (
        <p className="text-xs text-white/65 leading-relaxed whitespace-pre-line">
          {product.note}
        </p>
      )}

      <div className="mt-auto flex items-end justify-between gap-2 pt-1">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/50">
            Harga
          </div>
          <div className="text-lg md:text-xl font-extrabold text-amber-300 leading-none">
            {formatRupiah(product.price)}
          </div>
        </div>
        {out ? (
          <span className="rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-200 px-3 py-2 text-xs font-semibold">
            Stok Habis
          </span>
        ) : (
          <a
            href={whatsappLink(waNumber, message)}
            target="_blank"
            rel="noreferrer"
            className="btn-wa text-sm"
          >
            <WhatsAppIcon /> Order
          </a>
        )}
      </div>
    </div>
  );
}

// ===================== Icons =====================

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.821 11.821 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0l2.5 7.5L22 10l-7.5 2.5L12 20l-2.5-7.5L2 10l7.5-2.5z" />
    </svg>
  );
}
