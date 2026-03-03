from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserRead, UserCreate, UserLogin
from app.core.database import get_db
from app.core.security import pwd_context
from app.core.jwt import create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserRead)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = User(
        name=user.name,
        email=user.email
    )
    db_user.set_password(user.password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    print(user)
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not db_user.verify_password(user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": str(db_user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "is_admin": db_user.is_admin
        }
    }

@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
