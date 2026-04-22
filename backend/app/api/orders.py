from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.models.order import Order, OrderItem
from app.models.variant import ProductVariant
from app.schemas.order import (
    OrderCreate,
    OrderOut,
    OrderUpdateStatus,
    OrderItemCreate,
    OrderStatus,
    OrderUpdate,
)
from app.core.database import get_db
from app.api.deps import get_current_user, admin_required
from app.models.user import User

router = APIRouter(prefix="/orders", tags=["orders"])


# GET all orders
@router.get("", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = db.query(Order).all()

    result = []

    for order in orders:
        items = []

        for item in order.items:
            variant = item.variant

            items.append({
                "variant_id": item.variant_id,
                "quantity": item.quantity,
                "price": item.price,
                "product_name": variant.product.name if variant and variant.product else None,
                "variant_name": variant.sku if variant else None,
            })

        result.append({
            "id": order.id,
            "shopper_name": order.shopper_name,
            "shopper_email": order.shopper_email,
            "status": order.status,
            "created_at": order.created_at,
            "items": items
        })

    return result

@router.put("/{order_id}", response_model=OrderOut)
def update_order(order_id: int, order_data: OrderUpdate, db: Session = Depends(get_db)):

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.shopper_name = order_data.shopper_name
    order.shopper_email = order_data.shopper_email
    order.status = order_data.status

    db.query(OrderItem).filter(OrderItem.order_id == order_id).delete()

    items_data = []

    for item in order_data.items:
        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()

        if not variant:
            raise HTTPException(status_code=400, detail=f"Variant {item.variant_id} not found")

        price = float(variant.product.base_price)

        order_item = OrderItem(
            order_id=order.id,
            variant_id=item.variant_id,
            quantity=item.quantity,
            price=price,
        )
        db.add(order_item)

        items_data.append({
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "price": price,
            "product_name": variant.product.name,
            "variant_name": variant.sku,
        })

    db.commit()
    db.refresh(order)

    return {
        "id": order.id,
        "shopper_name": order.shopper_name,
        "shopper_email": order.shopper_email,
        "status": order.status,
        "created_at": order.created_at,
        "items": items_data
    }

# GET a single order by ID
@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items_data = []

    for item in order.items:
        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()

        items_data.append({
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "price": float(item.price),
            "product_name": variant.product.name if variant else None,
            "variant_name": variant.sku if variant else None
        })

    return {
        "id": order.id,
        "shopper_name": order.shopper_name,
        "shopper_email": order.shopper_email,
        "status": order.status,
        "created_at": order.created_at,
        "items": items_data
    }


# POST create an order with inventory check
@router.post("", response_model=OrderOut)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    order = Order(
        shopper_name=order_in.shopper_name,
        shopper_email=order_in.shopper_email,
        status=OrderStatus.pending
    )
    db.add(order)
    db.flush()  # Assign order.id before adding items

    items_data = []
    for item_in in order_in.items:
        # Fetch the variant and its inventory
        variant = db.query(ProductVariant).filter(ProductVariant.id == item_in.variant_id).first()
        if not variant:
            raise HTTPException(status_code=404, detail=f"Variant {item_in.variant_id} not found")

        if not variant.inventory or variant.inventory.quantity < item_in.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for variant {variant.id}. Available: {variant.inventory.quantity if variant.inventory else 0}"
            )
        
        product_name = variant.product.name
        variant_name = variant.sku
        price = variant.product.base_price

        # Deduct inventory
        variant.inventory.quantity -= item_in.quantity

        items_data.append({
            "variant_id": item_in.variant_id,
            "quantity": item_in.quantity,
            "price": price,
            "product_name": product_name,
            "variant_name": variant_name
        })
        # Create order item
        order_item = OrderItem(
            order_id=order.id,
            variant_id=variant.id,
            quantity=item_in.quantity,
            price=float(price),  # capture price at order time
        )
        db.add(order_item)

    try:
        db.commit()
    except:
        db.rollback()
        raise
    db.refresh(order)
        
    return {
        "id": order.id,
        "shopper_name": order.shopper_name,
        "shopper_email": order.shopper_email,
        "status": order.status,
        "created_at": order.created_at,
        "items": items_data
    }


# PATCH update order status
@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    status_in: OrderUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restock inventory if cancelling
    if status_in.status == OrderStatus.cancelled and order.status != OrderStatus.cancelled:
        for item in order.items:
            if item.variant.inventory:
                item.variant.inventory.quantity += item.quantity

    order.status = status_in.status

    db.commit()
    db.refresh(order)

    # rebuild response
    items_data = []

    for item in order.items:
        variant = item.variant

        items_data.append({
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "price": item.price,
            "product_name": variant.product.name if variant else None,
            "variant_name": variant.sku if variant else None,
        })

    return {
        "id": order.id,
        "shopper_name": order.shopper_name,
        "shopper_email": order.shopper_email,
        "status": order.status,
        "created_at": order.created_at,
        "items": items_data
    }


# DELETE an order (also restocks inventory)
@router.delete("/{order_id}")
def delete_order(
    order_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restock inventory before deleting
    for item in order.items:
        if item.variant:
            if item.variant.inventory:
                item.variant.inventory.quantity += item.quantity
        else:
            continue

    db.delete(order)
    db.commit()
    return {"detail": "Order deleted"}
