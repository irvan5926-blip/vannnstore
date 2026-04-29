from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(index=True, unique=True)
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    brand_color: Optional[str] = None
    sort_order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    products: list["Product"] = Relationship(
        back_populates="category",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="category.id", index=True)
    name: str
    duration: Optional[str] = None
    price: int = 0
    note: Optional[str] = None
    stock: int = 0
    is_active: bool = True
    sort_order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    category: Optional[Category] = Relationship(back_populates="products")


class AdminUser(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class StoreSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=1, primary_key=True)
    store_name: str = "VannnStore"
    tagline: str = "Apps Premium Murah & Bergaransi"
    whatsapp_number: str = "6281234567890"
    logo_url: Optional[str] = None
    hero_text: str = "Toko apps premium terpercaya — proses cepat, harga bersahabat, garansi nyata."
