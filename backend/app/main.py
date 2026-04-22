from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import auth, products, orders
import os

from app.api.health import router as health_router
from app.api.products import router as products_router
from app.api.variants import router as variants_router
from app.api.orders import router as orders_router
from app.api import auth, admin_example

app = FastAPI(title="Clothing Store API")

origins = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health_router)
app.include_router(products_router)
app.include_router(variants_router)
app.include_router(orders_router)
app.include_router(auth.router)
app.include_router(admin_example.router)

# Root
@app.get("/")
def root():
    return {"status": "ok"}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # one level up from app/
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")