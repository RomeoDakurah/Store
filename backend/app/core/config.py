import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
