from typing import Optional

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None


class ProductCreate(BaseModel):
    category_id: int
    name: str
    duration: Optional[str] = None
    price: int = 0
    note: Optional[str] = None
    stock: int = 0
    is_active: bool = True
    sort_order: int = 0


class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    duration: Optional[str] = None
    price: Optional[int] = None
    note: Optional[str] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class StoreSettingsUpdate(BaseModel):
    store_name: Optional[str] = None
    tagline: Optional[str] = None
    whatsapp_number: Optional[str] = None
    logo_url: Optional[str] = None
    hero_text: Optional[str] = None


class ChangePassword(BaseModel):
    current_password: str
    new_password: str
