from app.core.database import Base, engine
from app.models import *  # IMPORTANT: loads all models

def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done!")

if __name__ == "__main__":
    init_db()