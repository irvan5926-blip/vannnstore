from datetime import datetime
from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app import schemas
from app.auth import (
    create_access_token,
    get_current_admin,
    hash_password,
    verify_password,
)
from app.database import get_session, init_db
from app.models import AdminUser, Category, Product, StoreSettings
from app.seed import run_seed

app = FastAPI(title="VannnStore API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    run_seed()


@app.get("/healthz")
def healthz():
    return {"status": "ok", "service": "vannnstore-api"}


# ---------- Auth ----------
@app.post("/api/auth/login", response_model=schemas.Token)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = session.exec(
        select(AdminUser).where(AdminUser.username == form.username)
    ).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
        )
    token = create_access_token({"sub": user.username})
    return schemas.Token(access_token=token, username=user.username)


@app.get("/api/auth/me")
def me(current: AdminUser = Depends(get_current_admin)):
    return {"username": current.username}


@app.post("/api/auth/change-password")
def change_password(
    body: schemas.ChangePassword,
    current: AdminUser = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    if not verify_password(body.current_password, current.password_hash):
        raise HTTPException(status_code=400, detail="Password lama salah")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password baru minimal 6 karakter")
    current.password_hash = hash_password(body.new_password)
    session.add(current)
    session.commit()
    return {"ok": True}


# ---------- Public storefront ----------
@app.get("/api/storefront")
def storefront(session: Session = Depends(get_session)):
    settings = session.get(StoreSettings, 1) or StoreSettings(id=1)
    categories = session.exec(
        select(Category).order_by(Category.sort_order, Category.id)
    ).all()
    result_cats = []
    for cat in categories:
        products = session.exec(
            select(Product)
            .where(Product.category_id == cat.id, Product.is_active == True)  # noqa: E712
            .order_by(Product.sort_order, Product.id)
        ).all()
        result_cats.append(
            {
                "id": cat.id,
                "name": cat.name,
                "slug": cat.slug,
                "icon": cat.icon,
                "description": cat.description,
                "products": [
                    {
                        "id": p.id,
                        "name": p.name,
                        "duration": p.duration,
                        "price": p.price,
                        "note": p.note,
                        "stock": p.stock,
                    }
                    for p in products
                ],
            }
        )
    return {
        "settings": {
            "store_name": settings.store_name,
            "tagline": settings.tagline,
            "whatsapp_number": settings.whatsapp_number,
            "logo_url": settings.logo_url,
            "hero_text": settings.hero_text,
        },
        "categories": result_cats,
    }


# ---------- Admin: settings ----------
@app.get("/api/admin/settings")
def get_settings(
    _: AdminUser = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    settings = session.get(StoreSettings, 1)
    if not settings:
        settings = StoreSettings(id=1)
        session.add(settings)
        session.commit()
        session.refresh(settings)
    return settings


@app.put("/api/admin/settings")
def update_settings(
    body: schemas.StoreSettingsUpdate,
    _: AdminUser = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    settings = session.get(StoreSettings, 1)
    if not settings:
        settings = StoreSettings(id=1)
        session.add(settings)
        session.flush()
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings


# ---------- Admin: categories ----------
@app.get("/api/admin/categories")
def list_categories(
    _: AdminUser = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    cats = session.exec(
        select(Category).order_by(Category.sort_order, Category.id)
    ).all()
    return cats


@app.post("/api/admin/categories")
def create_category(
    body: schemas.CategoryCreate,
    _: AdminUser = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    existing = session.exec(
        select(Category).where(Category.slug == body.slug)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug sudah dipakai")
    cat = Category(**body.model_dump())
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


@app.put("/api/admin/categories/{cat_id}")
def update_category(
    cat_id: int,
    body: schemas.CategoryUpdate,
    _: AdminUser = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    cat = session.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    data = body.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] != cat.slug:
        existing = session.exec(
            select(Category).where(Category.slug == data["slug"])
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug sudah dipakai")
    for field, value in data.items():
        setattr(cat, field, value)
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


@app.delete("/api/admin/categories/{cat_id}")
def delete_category(
    cat_id: int,
    _: AdminUser = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    cat = session.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    # Delete products in this category
    products = session.exec(
        select(Product).where(Product.category_id == cat_id)
    ).all()
    for p in products:
        session.delete(p)
    session.delete(cat)
    session.commit()
    return {"ok": True}


# ---------- Admin: products ----------
@app.get("/api/admin/products")
def list_products(
    _: AdminUser = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    products = session.exec(
        select(Product).order_by(Product.category_id, Product.sort_order, Product.id)
    ).all()
    return products


@app.post("/api/admin/products")
def create_product(
    body: schemas.ProductCreate,
    _: AdminUser = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    cat = session.get(Category, body.category_id)
    if not cat:
        raise HTTPException(status_code=400, detail="Kategori tidak valid")
    p = Product(**body.model_dump())
    session.add(p)
    session.commit()
    session.refresh(p)
    return p


@app.put("/api/admin/products/{prod_id}")
def update_product(
    prod_id: int,
    body: schemas.ProductUpdate,
    _: AdminUser = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    p = session.get(Product, prod_id)
    if not p:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    data = body.model_dump(exclude_unset=True)
    if "category_id" in data:
        cat = session.get(Category, data["category_id"])
        if not cat:
            raise HTTPException(status_code=400, detail="Kategori tidak valid")
    for field, value in data.items():
        setattr(p, field, value)
    p.updated_at = datetime.utcnow()
    session.add(p)
    session.commit()
    session.refresh(p)
    return p


@app.delete("/api/admin/products/{prod_id}")
def delete_product(
    prod_id: int,
    _: AdminUser = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    p = session.get(Product, prod_id)
    if not p:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    session.delete(p)
    session.commit()
    return {"ok": True}
