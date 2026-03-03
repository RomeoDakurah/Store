# app/models/user.py
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)  # new: track active users
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Optional helper methods for password hashing
    def set_password(self, password: str):
        # truncate password to 72 bytes for bcrypt
        truncated = password[:72]
        self.password_hash = pwd_context.hash(truncated)

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password[:72], self.password_hash)
