# VannnStore — Toko Apps Premium

Aplikasi storefront jualan apps premium (CapCut, Canva, Netflix, Vidio, Disney+, dll) dengan panel admin untuk mengelola produk, kategori, harga, dan stok.

## Live Demo

- **Storefront:** https://dist-gazvcwqj.devinapps.com
- **Admin login:** https://dist-gazvcwqj.devinapps.com/#/admin/login

Default admin credentials (segera diganti setelah login pertama):

- Username: `admin`
- Password: `vannnstore2025`

## Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + React Router (HashRouter)
- **Backend:** FastAPI + SQLModel + SQLite + JWT auth (bcrypt)
- **Deploy:** Frontend di devinapps.com, Backend di Fly.io (dengan persistent volume untuk SQLite)

## Fitur

### Storefront publik

- Logo & branding VannnStore
- 17 kategori produk siap pakai (CapCut Pro, Canva Pro, Netflix Premium, Vidio, dll)
- Search bar + filter per kategori
- Tombol "Order Sekarang" auto-generate pesan WhatsApp ke nomor admin (lengkap dengan kategori, produk, durasi, harga)
- Indikator stok tersedia / kosong
- Responsive (mobile-friendly)

### Admin panel

- Login JWT (bcrypt password hashing)
- Tab **Produk:** tambah / edit / hapus produk (nama, kategori, durasi, harga, stok, catatan/garansi, aktif/nonaktif)
- Tab **Kategori:** tambah / edit / hapus kategori (nama, slug, ikon emoji, deskripsi, urutan)
- Tab **Toko:** edit nama toko, tagline, hero text, **nomor WhatsApp**, logo URL
- Tab **Akun:** ubah password admin

## Struktur proyek

```
vannnstore/
├── backend/                 # FastAPI + SQLite
│   ├── app/
│   │   ├── main.py          # endpoint definitions
│   │   ├── models.py        # SQLModel tables
│   │   ├── schemas.py       # Pydantic request/response
│   │   ├── auth.py          # JWT + bcrypt helpers
│   │   ├── database.py      # engine + session
│   │   └── seed.py          # initial data (admin + 17 kategori + 39 produk)
│   └── pyproject.toml
└── frontend/                # React + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── Storefront.tsx
    │   │   ├── AdminLogin.tsx
    │   │   └── AdminDashboard.tsx
    │   ├── components/Logo.tsx
    │   ├── lib/api.ts       # fetch helpers
    │   └── main.tsx
    └── package.json
```

## Run lokal

### Backend

```bash
cd backend
uv sync                                                   # install deps
uv run uvicorn app.main:app --reload --port 8888          # http://localhost:8888
```

API docs otomatis di http://localhost:8888/docs

### Frontend

```bash
cd frontend
npm install
npm run dev                                               # http://localhost:5173
```

Frontend membaca `VITE_API_BASE` (di `.env.production` untuk build production). Saat running di `localhost`, otomatis fallback ke `http://localhost:8888`.

## Deploy ulang

### Backend (Fly.io)

Backend sudah di-deploy ke `https://vannnstore-api-ckqcixvl.fly.dev` dengan persistent volume di `/data` (SQLite database `vannnstore.db` disimpan di sana — data aman saat redeploy).

### Frontend (devinapps.com)

```bash
cd frontend
npm run build
# Upload isi dist/ ke static host pilihan
```

`.env.production` berisi:

```
VITE_API_BASE=https://vannnstore-api-ckqcixvl.fly.dev
```

Ganti URL ini bila kamu deploy backend ke host lain.

## API endpoints

### Public

- `GET /healthz` — health check
- `GET /api/storefront` — semua kategori + produk aktif + settings toko

### Auth

- `POST /api/auth/login` — form `username` + `password` → JWT token
- `GET /api/auth/me` — info admin saat ini (auth required)
- `POST /api/auth/change-password` — ubah password (auth required)

### Admin (auth required)

- `GET|PUT /api/admin/settings` — pengaturan toko
- `GET|POST /api/admin/categories` — list / create kategori
- `PUT|DELETE /api/admin/categories/{id}` — update / delete kategori (delete cascade ke produk-produknya)
- `GET|POST /api/admin/products` — list / create produk
- `PUT|DELETE /api/admin/products/{id}` — update / delete produk

## Catatan keamanan

- Password admin disimpan sebagai bcrypt hash, JWT signed dengan secret di env `JWT_SECRET`
- Default password (`vannnstore2025`) **wajib** diganti setelah deploy via tab "Akun"
- Untuk production yang lebih aman: set env var `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` saat deploy backend

## Lisensi

Privat / sesuai kebutuhan owner toko.
