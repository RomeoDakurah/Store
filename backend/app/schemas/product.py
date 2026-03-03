from pydantic import BaseModel
from typing import List, Optional
from app.schemas.variant import VariantImageOut

class ProductVariantOut(BaseModel):
    id: int
    size: str
    sku: str
    active: bool
    quantity: int
    color: Optional[str]
    images: Optional[list[VariantImageOut]]

    class Config:
        from_attributes = True

class ProductImageOut(BaseModel):
    id: int
    image_url: str
    position: Optional[int] = 0

class ProductBase(BaseModel):
    name: str
    slug: str
    description: str
    base_price: float
    active: bool = True
    images: List[ProductImageOut] = []

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str]
    slug: Optional[str]
    description: Optional[str]
    base_price: Optional[float]
    active: Optional[bool]
    images: List[ProductImageOut] = []

class ProductOut(ProductBase):
    id: int
    name: str
    slug: str
    description: str
    base_price: float
    active: bool
    images: List[ProductImageOut] = []
    variants: List[ProductVariantOut] = []

    model_config = {
        "from_attributes": True
    }