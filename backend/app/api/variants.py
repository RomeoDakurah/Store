from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from uuid import uuid4

from app.models.variant import ProductVariant, Inventory, VariantImage
from app.schemas.variant import VariantCreate, VariantUpdate, VariantOut, VariantImageOut
from app.core.database import get_db
from app.api.deps import get_current_user, admin_required
from app.models.product import Product
from app.models.user import User


router = APIRouter(prefix="/variants", tags=["variants"])

# List variants for a product
@router.get("/{variant_id}", response_model=VariantOut)
def get_variant(variant_id: int, db: Session = Depends(get_db)):
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    return variant


# Create variant
@router.post("/product/{product_id}", response_model=VariantOut)
def create_variant(
    product_id: int,
    variant_in: VariantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    # Admin check
    if current_user.is_admin != True:
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required",
        )

    # Ensure product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    variant = ProductVariant(
        product_id=product_id,
        size=variant_in.size,
        color=variant_in.color,
        sku=variant_in.sku,
        active=variant_in.active,
        images=variant_in.images,
    )
    db.add(variant)
    db.flush()

    # Create inventory
    inventory = Inventory(variant_id=variant.id, quantity=variant_in.quantity)
    db.add(inventory)
    db.commit()
    db.refresh(variant)

    return variant

# Update variant
@router.put("/{variant_id}", response_model=VariantOut)
def update_variant(
    variant_id: int, 
    variant_in: VariantUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(admin_required)
):
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    for key, value in variant_in.dict(exclude_unset=True).items():
        if key == "quantity":
            variant.inventory.quantity = value
        else:
            setattr(variant, key, value)
    db.commit()
    db.refresh(variant)
    return variant

# Delete variant
@router.delete("/{variant_id}")
def delete_variant(
    variant_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    # Delete inventory first
    if variant.inventory:
        db.delete(variant.inventory)
    db.delete(variant)
    db.commit()
    return {"detail": "Variant deleted"}

# Upload image
UPLOAD_DIR = "uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/{variant_id}/upload-image")
async def upload_image(
    variant_id: int,
    position: int = Form(0),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_image = VariantImage(
        variant_id=variant_id,
        image_url=f"/uploads/{unique_filename}",
        position=position
    )
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return VariantImageOut(
        id=new_image.id,
        image_url=new_image.image_url,
        position=new_image.position
    )

@router.delete("/variant-images/{image_id}")
def delete_variant_image(image_id: int, db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    image = db.query(VariantImage).filter(VariantImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Variant image not found")

    file_path = image.image_url.replace("/uploads/", "uploads/")
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(image)
    db.commit()

    return {"detail": "Variant image deleted"}