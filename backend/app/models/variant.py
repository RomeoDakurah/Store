from sqlalchemy import String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .product import Product

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    size: Mapped[str] = mapped_column(String(10))
    sku: Mapped[str] = mapped_column(String(50), unique=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    color: Mapped[str] = mapped_column(String(50), nullable=True)

    images: Mapped[list["VariantImage"]] = relationship("VariantImage", back_populates="variant", cascade="all, delete-orphan")
    product: Mapped["Product"] = relationship("Product", back_populates="variants")
    inventory: Mapped["Inventory"] = relationship("Inventory", back_populates="variant", cascade="all, delete-orphan", uselist=False)

    @property
    def quantity(self) -> int:
        return self.inventory.quantity if self.inventory else 0

class Inventory(Base):
    __tablename__ = "inventory"

    variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.id"), primary_key=True)
    quantity: Mapped[int] = mapped_column(Integer, default=0)

    variant: Mapped["ProductVariant"] = relationship("ProductVariant", back_populates="inventory")

class VariantImage(Base):
    __tablename__ = "variant_images"
    id: Mapped[int] = mapped_column(primary_key=True)
    variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.id"))
    image_url: Mapped[str] = mapped_column(String(500))
    position: Mapped[int] = mapped_column(default=0)

    variant: Mapped["ProductVariant"] = relationship("ProductVariant", back_populates="images")