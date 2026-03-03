from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Numeric
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.database import Base
from enum import Enum
from sqlalchemy import String
from app.schemas.order import OrderStatus
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .variant import ProductVariant

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    shopper_name: Mapped[str] = mapped_column(String(255))
    shopper_email: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[OrderStatus] = mapped_column(SQLEnum(OrderStatus), default=OrderStatus.pending)

    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    price: Mapped[float] = mapped_column(Numeric(10, 2))

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    variant: Mapped["ProductVariant"] = relationship("ProductVariant")

class OrderStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELED = "canceled"