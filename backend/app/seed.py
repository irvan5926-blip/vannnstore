"""Seed initial data: admin user, categories, and products."""
import os
from typing import Optional

from sqlalchemy import text
from sqlmodel import Session, select

from app.auth import hash_password
from app.database import engine
from app.models import AdminUser, Category, Product, StoreSettings

DEFAULT_ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "vannnstore2025")
DEFAULT_WA = "6289505674504"
PLACEHOLDER_WA = "6281234567890"


# https://cdn.simpleicons.org/<slug>/<color hex without #> — returns SVG.
# For brands not on simpleicons we use a curated CDN URL or fallback to None
# (frontend renders a colored letter tile).
APP_BRAND: dict[str, dict[str, Optional[str]]] = {
    "capcut-pro":         {"image_url": "/logos/capcut.svg",       "brand_color": "#000000"},
    "canva-pro":          {"image_url": "/logos/canva.svg",        "brand_color": "#00C4CC"},
    "vidio-premium":      {"image_url": "/logos/vidio.svg",        "brand_color": "#1B47B8"},
    "getcontact-premium": {"image_url": "/logos/getcontact.svg",   "brand_color": "#0EBE7F"},
    "gemini-ai":          {"image_url": "/logos/googlegemini.svg", "brand_color": "#8E75B2"},
    "netflix-premium":    {"image_url": "/logos/netflix.svg",      "brand_color": "#E50914"},
    "loklok-vip":         {"image_url": "/logos/loklok.svg",       "brand_color": "#FFB300"},
    "bstation":           {"image_url": "/logos/bilibili.svg",     "brand_color": "#00A1D6"},
    "alight-motion":      {"image_url": "/logos/alightmotion.svg", "brand_color": "#FF5F1F"},
    "youtube-premium":    {"image_url": "/logos/youtube.svg",      "brand_color": "#FF0000"},
    "amazon-prime":       {"image_url": "/logos/primevideo.svg",   "brand_color": "#00A8E1"},
    "duolingo":           {"image_url": "/logos/duolingo.svg",     "brand_color": "#58CC02"},
    "disney-hotstar":     {"image_url": "/logos/disneyplus.svg",   "brand_color": "#113CCF"},
    "scribd":             {"image_url": "/logos/scribd.svg",       "brand_color": "#1A7BBA"},
    "blackbox-ai":        {"image_url": "/logos/blackboxai.svg",   "brand_color": "#0F1117"},
    "gmail-fresh":        {"image_url": "/logos/gmail.svg",        "brand_color": "#EA4335"},
    "wetv-vip":           {"image_url": "/logos/wetv.svg",         "brand_color": "#FF6500"},
}


CATEGORIES_DATA = [
    {
        "slug": "capcut-pro",
        "name": "CapCut Pro",
        "icon": "🎬",
        "description": "Edit video pro tanpa watermark, semua fitur premium terbuka.",
        "products": [
            {"name": "Private 7 Hari", "duration": "7 Hari", "price": 7000, "note": "Bebas Ganti Email Pass & Dapat Email Akses", "stock": 99},
            {"name": "Private 30 Hari (Backfree 7 Hari)", "duration": "30 Hari", "price": 10000, "note": "Garansi Backfree 7 Hari", "stock": 99},
            {"name": "Private 30 Hari (Fullgaransi)", "duration": "30 Hari", "price": 15000, "note": "Fullgaransi 30 Hari. Bisa hold 3-4 hari, durasi tidak terhitung selama akun tidak login. Wajib pakai aplikasi versi terbaru.", "stock": 99},
        ],
    },
    {
        "slug": "canva-pro",
        "name": "Canva Pro",
        "icon": "🎨",
        "description": "Desain grafis premium, member hanya menikmati fitur unlock. Garansi 6 bulan, all device.",
        "products": [
            {"name": "Canva Pro 1 Bulan", "duration": "1 Bulan", "price": 5000, "note": "Member only — hanya bisa nikmati fitur yang dilock.", "stock": 99},
            {"name": "Canva EDU Lifetime (Promo)", "duration": "Selamanya", "price": 15000, "note": "Promo durasi selamanya.", "stock": 50},
            {"name": "Canva Head Owner 1 Bulan", "duration": "1 Bulan", "price": 10000, "note": "Bisa invite 100 anggota.", "stock": 30},
        ],
    },
    {
        "slug": "vidio-premium",
        "name": "Vidio Premium",
        "icon": "📺",
        "description": "Akses Bein Channel, Liga 1 & Premier TV. Garansi backfree.",
        "products": [
            {"name": "Platinum Alldev Sharing 2U", "duration": "1 Bulan", "price": 25000, "note": "Sharing 2u — wajib login 1 device, tidak akan limit screen.", "stock": 50},
            {"name": "Platinum Alldev Private", "duration": "1 Bulan", "price": 40000, "note": "Private alldevice.", "stock": 20},
            {"name": "Private Mobile (HP Only)", "duration": "1 Bulan", "price": 27000, "note": "Pakai nomor buyer/pembeli. Hanya bisa login di HP.", "stock": 30},
            {"name": "Platinum TV Only Private", "duration": "1 Tahun", "price": 10000, "note": "Garansi 1 bulan.", "stock": 30},
        ],
    },
    {
        "slug": "getcontact-premium",
        "name": "Getcontact Premium",
        "icon": "📞",
        "description": "Limit pencarian 300/bulan, daftar tag 40/bulan. Stok tidak terbatas. Garansi 23 hari.",
        "products": [
            {"name": "Langganan 1 Bulan", "duration": "1 Bulan", "price": 15000, "note": "Proses satset wajib standby. Nomor GTC = nomor WA aktif.", "stock": 999},
            {"name": "Langganan 2 Bulan", "duration": "2 Bulan", "price": 25000, "note": "23-30 hari terhitung 1 bulan.", "stock": 999},
            {"name": "Langganan 3 Bulan", "duration": "3 Bulan", "price": 30000, "note": "23-30 hari terhitung 1 bulan.", "stock": 999},
        ],
    },
    {
        "slug": "gemini-ai",
        "name": "Gemini AI",
        "icon": "✨",
        "description": "Akses Gemini AI + Gdrive 2TB + Veo 3.",
        "products": [
            {"name": "1 Bulan (Email Buyer)", "duration": "1 Bulan", "price": 10000, "note": "Pakai email buyer.", "stock": 50},
            {"name": "1 Bulan (Email Seller)", "duration": "1 Bulan", "price": 15000, "note": "Pakai email dari seller.", "stock": 50},
            {"name": "12 Bulan Invite", "duration": "12 Bulan", "price": 20000, "note": "Cukup kirim email untuk invite.", "stock": 30},
            {"name": "12 Bulan Admin", "duration": "12 Bulan", "price": 30000, "note": "Admin bisa invite 5 member. Gdrive 2TB + Veo 3.", "stock": 15},
        ],
    },
    {
        "slug": "netflix-premium",
        "name": "Netflix Premium",
        "icon": "🎥",
        "description": "Durasi 25-30 hari, full garansi selama durasi. Wajib paham sharing bisa limit.",
        "products": [
            {"name": "Netflix 1P1U", "duration": "1 Bulan", "price": 30000, "note": "1 Profile 1 User.", "stock": 20},
            {"name": "Netflix Semi Private", "duration": "1 Bulan", "price": 45000, "note": "Login 2 device tapi tidak boleh nonton bersamaan. +2k bisa req nama profil & PIN.", "stock": 15},
            {"name": "Private Account", "duration": "1 Bulan", "price": 120000, "note": "STOK KOSONG. 5 Profile, login 5-10 device. Wajib isi form admin. Nomor warning GTC tidak bisa order Netflix di sini.", "stock": 0},
        ],
    },
    {
        "slug": "loklok-vip",
        "name": "Loklok VIP",
        "icon": "🎞️",
        "description": "Streaming film & drama. Garansi backfree. Tidak bisa TV.",
        "products": [
            {"name": "Sharing Account 1 Bulan", "duration": "1 Bulan", "price": 10000, "note": "Sharing — hanya bisa login 1 device.", "stock": 50},
            {"name": "Private 7 Hari", "duration": "7 Hari", "price": 10000, "note": "Private bisa login max 5 device.", "stock": 30},
            {"name": "Private 20 Hari", "duration": "20 Hari", "price": 20000, "note": "Private bisa login max 5 device.", "stock": 30},
            {"name": "Private 1 Bulan", "duration": "1 Bulan", "price": 30000, "note": "Private bisa login max 5 device.", "stock": 30},
        ],
    },
    {
        "slug": "bstation",
        "name": "Bstation",
        "icon": "🎌",
        "description": "Akun dari seller, fullgar. 25-30 hari terhitung 1 bulan. Sharing bisa limit.",
        "products": [
            {"name": "Sharing 1 Bulan", "duration": "1 Bulan", "price": 15000, "note": "Tanya stok dulu sebelum order.", "stock": 20},
        ],
    },
    {
        "slug": "alight-motion",
        "name": "Alight Motion",
        "icon": "🎞️",
        "description": "Edit video animasi. Andro/iOS support. Garansi 6 bulan.",
        "products": [
            {"name": "Private Akun 1 Tahun", "duration": "1 Tahun", "price": 20000, "note": "Tanya stok dulu sebelum order.", "stock": 30},
        ],
    },
    {
        "slug": "youtube-premium",
        "name": "YouTube Premium",
        "icon": "▶️",
        "description": "Sudah termasuk YouTube Music.",
        "products": [
            {"name": "Via Invite 1 Bulan", "duration": "1 Bulan", "price": 15000, "note": "Cukup kirim email untuk invite.", "stock": 50},
        ],
    },
    {
        "slug": "amazon-prime",
        "name": "Amazon Prime Video",
        "icon": "📦",
        "description": "Bisa alldevice. Garansi backfree.",
        "products": [
            {"name": "Sharing 5U 1 Bulan", "duration": "1 Bulan", "price": 10000, "note": "Sharing — hanya bisa login 1 device.", "stock": 50},
            {"name": "Sharing 3U 1 Bulan", "duration": "1 Bulan", "price": 15000, "note": "Sharing 3u tidak akan sering limit screen.", "stock": 30},
            {"name": "Private 1 Bulan", "duration": "1 Bulan", "price": 25000, "note": "Private bisa login max 5 device.", "stock": 20},
        ],
    },
    {
        "slug": "duolingo",
        "name": "Duolingo Super",
        "icon": "🦉",
        "description": "Belajar bahasa asing. Fullgar. Tanya stok dulu.",
        "products": [
            {"name": "Via Invite 1 Bulan", "duration": "1 Bulan", "price": 10000, "note": "Cukup klik undangan dari admin.", "stock": 30},
            {"name": "Super Head Private 1 Bulan", "duration": "1 Bulan", "price": 15000, "note": "Bisa invite 5-6 user.", "stock": 15},
        ],
    },
    {
        "slug": "disney-hotstar",
        "name": "Disney+ Hotstar",
        "icon": "🏰",
        "description": "Plan Premium (bukan Basic). Fullgar.",
        "products": [
            {"name": "Sharing 6U 1 Bulan", "duration": "1 Bulan", "price": 16000, "note": "Plan Premium bukan Basic. Fullgar.", "stock": 30},
        ],
    },
    {
        "slug": "scribd",
        "name": "Scribd",
        "icon": "📚",
        "description": "Akun seller, bergaransi.",
        "products": [
            {"name": "Private 1 Bulan", "duration": "1 Bulan", "price": 10000, "note": "Akun seller, bergaransi.", "stock": 20},
        ],
    },
    {
        "slug": "blackbox-ai",
        "name": "Blackbox AI",
        "icon": "🤖",
        "description": "Akses ChatGPT 4.0, Claude Sonnet 3.5, Gemini Pro, Deepseek AI dll. Garansi 1 bulan.",
        "products": [
            {"name": "Private 3 Bulan", "duration": "3 Bulan", "price": 25000, "note": "Tanya stok. Fitur: ChatGPT 4.0, Claude Sonnet 3.5, Gemini Pro, Deepseek AI dll. Garansi 1 bulan.", "stock": 20},
        ],
    },
    {
        "slug": "gmail-fresh",
        "name": "Gmail Fresh",
        "icon": "📧",
        "description": "Akun Gmail fresh tinggal login. Akun dari seller. Langsung ganti sandi setelah dikirim.",
        "products": [
            {"name": "1 Email Gmail Fresh", "duration": "Selamanya", "price": 5000, "note": "Akun dari seller. Wajib langsung ganti sandi setelah dikirim.", "stock": 100},
        ],
    },
    {
        "slug": "wetv-vip",
        "name": "WeTV VIP",
        "icon": "🐉",
        "description": "Streaming drama China. Limit screen ada di apk, nonton via web. Fullgar backfree.",
        "products": [
            {"name": "Sharing 6U 1 Bulan", "duration": "1 Bulan", "price": 5000, "note": "Sharing 6 user.", "stock": 50},
            {"name": "Sharing 3U 1 Bulan", "duration": "1 Bulan", "price": 12000, "note": "Sharing 3u tidak akan sering limit screen.", "stock": 30},
            {"name": "Private 1 Bulan", "duration": "1 Bulan", "price": 26000, "note": "Private bisa login max 6 user.", "stock": 20},
        ],
    },
]


def _column_exists(conn, table: str, column: str) -> bool:
    rows = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
    return any(r[1] == column for r in rows)


def run_migrations() -> None:
    """Apply ALTER TABLE migrations idempotently for SQLite."""
    with engine.begin() as conn:
        # Add image_url + brand_color to category if missing
        if not _column_exists(conn, "category", "image_url"):
            conn.execute(text("ALTER TABLE category ADD COLUMN image_url TEXT"))
        if not _column_exists(conn, "category", "brand_color"):
            conn.execute(text("ALTER TABLE category ADD COLUMN brand_color TEXT"))


def patch_existing_data() -> None:
    """Update existing rows with new defaults / brand metadata.

    Idempotent — only updates fields where current value is null/placeholder.
    """
    with Session(engine) as session:
        # Update WhatsApp number from placeholder → real number
        settings = session.get(StoreSettings, 1)
        if settings and settings.whatsapp_number == PLACEHOLDER_WA:
            settings.whatsapp_number = DEFAULT_WA
            session.add(settings)

        # Set image_url + brand_color on existing categories where missing
        for cat in session.exec(select(Category)).all():
            brand = APP_BRAND.get(cat.slug)
            if not brand:
                continue
            changed = False
            if not cat.image_url and brand.get("image_url"):
                cat.image_url = brand["image_url"]
                changed = True
            if not cat.brand_color and brand.get("brand_color"):
                cat.brand_color = brand["brand_color"]
                changed = True
            if changed:
                session.add(cat)
        session.commit()


def run_seed() -> None:
    with Session(engine) as session:
        # Admin user
        existing_admin = session.exec(
            select(AdminUser).where(AdminUser.username == DEFAULT_ADMIN_USERNAME)
        ).first()
        if not existing_admin:
            session.add(
                AdminUser(
                    username=DEFAULT_ADMIN_USERNAME,
                    password_hash=hash_password(DEFAULT_ADMIN_PASSWORD),
                )
            )

        # Store settings
        settings = session.get(StoreSettings, 1)
        if not settings:
            session.add(
                StoreSettings(
                    id=1,
                    whatsapp_number=DEFAULT_WA,
                )
            )

        # Categories + products (only seed if categories table is empty)
        existing_count = len(session.exec(select(Category)).all())
        if existing_count == 0:
            for idx, cat_data in enumerate(CATEGORIES_DATA):
                brand = APP_BRAND.get(cat_data["slug"], {})
                category = Category(
                    name=cat_data["name"],
                    slug=cat_data["slug"],
                    icon=cat_data["icon"],
                    description=cat_data["description"],
                    image_url=brand.get("image_url"),
                    brand_color=brand.get("brand_color"),
                    sort_order=idx,
                )
                session.add(category)
                session.flush()
                for p_idx, prod in enumerate(cat_data["products"]):
                    session.add(
                        Product(
                            category_id=category.id,
                            name=prod["name"],
                            duration=prod.get("duration"),
                            price=prod["price"],
                            note=prod.get("note"),
                            stock=prod.get("stock", 0),
                            sort_order=p_idx,
                        )
                    )
        session.commit()


if __name__ == "__main__":
    from app.database import init_db

    init_db()
    run_migrations()
    run_seed()
    patch_existing_data()
    print(f"Seed selesai. Admin: {DEFAULT_ADMIN_USERNAME} / {DEFAULT_ADMIN_PASSWORD}")
