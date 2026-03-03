from fastapi import APIRouter, Depends
from app.dependencies import admin_required
from app.schemas.user import UserRead
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/dashboard", response_model=UserRead)
def admin_dashboard(current_user: User = Depends(admin_required)):
    return current_user  # Just a placeholder example
