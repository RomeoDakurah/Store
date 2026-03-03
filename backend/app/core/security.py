from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str, pwd_context) -> str:
    # truncate password to 72 bytes
    password = password[:72]
    return pwd_context.hash(password)

def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password[:72], self.password_hash)
