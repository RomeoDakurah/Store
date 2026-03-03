from typing import List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel
from typing import Optional

# Enum for order status
class OrderStatus(str, Enum):
    pending = "pending"
    shipped = "shipped"
    completed = "completed"
    cancelled = "cancelled"

# Nested schema for order items
class OrderItemOut(BaseModel):
    variant_id: int
    quantity: int
    price: float

    model_config = {
        "from_attributes": True
    }

# Schema for creating an order
class OrderItemCreate(BaseModel):
    variant_id: int
    quantity: int

class OrderCreate(BaseModel):
    shopper_name: str
    shopper_email: Optional[str] = None
    items: List[OrderItemCreate]

# Schema for updating order status
class OrderUpdateStatus(BaseModel):
    status: OrderStatus

class OrderItemUpdate(BaseModel):
    variant_id: int
    quantity: int
    unit_price: float

class OrderUpdate(BaseModel):
    shopper_name: str
    shopper_email: Optional[str] = None
    status: OrderStatus
    items: List[OrderItemUpdate]

# Schema for returning order data
class OrderOut(BaseModel):
    id: int
    shopper_name: str
    shopper_email: Optional[str] = None
    status: OrderStatus
    created_at: datetime
    items: List[OrderItemOut]

    model_config = {
        "from_attributes": True
    }
