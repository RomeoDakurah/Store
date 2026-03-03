from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, selectinload
from typing import List
import shutil
import os
from uuid import uuid4

from app.models.product import Product, ProductImage
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut, ProductImageOut
from app.schemas.variant import VariantOut, VariantImageOut
from app.core.database import get_db
from app.api.deps import get_current_user, admin_required
from app.models.user import User
from app.models.variant import ProductVariant
from app.api.variants import get_variant

router = APIRouter(prefix="/products", tags=["products"])

# GET all products
@router.get("", response_model=List[ProductOut])
def list_products(
    db: Session = Depends(get_db),
):
    products = (
        db.query(Product)
        .options(selectinload(Product.variants).selectinload(ProductVariant.images))
        .all()
    )
    return products

# GET product by id
@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


# POST create product
@router.post("", response_model=ProductOut)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    if current_user.is_admin != True:
        raise HTTPException(status_code=403, detail="Admin privileges required")

    if db.query(Product).filter(Product.slug == product_in.slug).first():
        raise HTTPException(status_code=400, detail="Product slug already exists")
    
    product = Product(**product_in.dict())
    db.add(product)
    db.commit()
    db.refresh(product)

    return product

# PUT update product
@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int, 
    product_in: ProductUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product_in.dict(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

# DELETE product
@router.delete("/{product_id}")
def delete_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"detail": "Product deleted"}

# Upload image
UPLOAD_DIR = "uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/{product_id}/upload-image")
async def upload_image(
    product_id: int,
    position: int = Form(0),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    # 1️⃣ Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # 2️⃣ SAVE FILE TO DISK
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 3️⃣ Save record in DB
    new_image = ProductImage(
        product_id=product_id,
        image_url=f"/uploads/{unique_filename}",
        position=position
    )
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return ProductImageOut(
        id=new_image.id,
        image_url=new_image.image_url,
        position=new_image.position
    )

@router.delete("/product-images/{image_id}")
def delete_product_image(image_id: int, db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    # 1️⃣ Find image in DB
    image = db.query(ProductImage).filter(ProductImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Product image not found")

    # 2️⃣ Delete file from disk
    file_path = image.image_url.replace("/uploads/", "uploads/")
    if os.path.exists(file_path):
        os.remove(file_path)

    # 3️⃣ Delete DB record
    db.delete(image)
    db.commit()

    return {"detail": "Product image deleted"}