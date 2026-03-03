from pydantic import BaseModel
from typing import List, Optional

class VariantImageOut(BaseModel):
    id: int
    image_url: str
    position: Optional[int] = 0

class VariantBase(BaseModel):
    size: str
    sku: str
    active: bool
    quantity: int
    color: Optional[str] = None
    images: List[VariantImageOut] = []

class VariantCreate(VariantBase):
    size: str
    color: Optional[str]
    sku: str
    active: bool = True
    images: List[VariantImageOut] = []

class VariantUpdate(BaseModel):
    size: Optional[str]
    sku: Optional[str]
    active: Optional[bool]
    quantity: Optional[int]
    color: Optional[str]
    images: List[VariantImageOut] = []

class VariantOut(VariantBase):
    id: int
    product_id: int
    size: str
    sku: str
    active: bool
    quantity: int
    color: Optional[str]
    images: Optional[List[VariantImageOut]] = []

    model_config = {
        "from_attributes": True
    }
