"""Seed initial data: admin user, categories, and products from Muhammad's price list."""
import os

from sqlmodel import Session, select

from app.auth import hash_password
from app.database import engine
from app.models import AdminUser, Category, Product, StoreSettings

DEFAULT_ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "vannnstore2025")


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
            session.add(StoreSettings(id=1))

        # Categories + products (only seed if categories table is empty)
        existing_count = len(session.exec(select(Category)).all())
        if existing_count == 0:
            for idx, cat_data in enumerate(CATEGORIES_DATA):
                category = Category(
                    name=cat_data["name"],
                    slug=cat_data["slug"],
                    icon=cat_data["icon"],
                    description=cat_data["description"],
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
    run_seed()
    print(f"Seed selesai. Admin: {DEFAULT_ADMIN_USERNAME} / {DEFAULT_ADMIN_PASSWORD}")
