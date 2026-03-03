from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_admin: bool
    is_active: bool

    model_config = {
        "from_attributes": True
    }

class UserLogin(BaseModel):
    email: EmailStr
    password: str

