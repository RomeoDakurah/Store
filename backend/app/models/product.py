from __future__ import annotations
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import JSON, String, Numeric, Boolean, DateTime, ForeignKey
from app.core.database import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .variant import ProductVariant

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True)
    description: Mapped[str] = mapped_column(String)
    base_price: Mapped[float] = mapped_column(Numeric(10, 2))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    images: Mapped[list["ProductImage"]] = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    # relationship to variants
    variants: Mapped[list["ProductVariant"]] = relationship(
        "ProductVariant", back_populates="product", cascade="all, delete-orphan"
    )

class ProductImage(Base):
    __tablename__ = "product_images"
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    image_url: Mapped[str] = mapped_column(String(500))
    position: Mapped[int] = mapped_column(default=0)  # order of images

    product = relationship("Product", back_populates="images")