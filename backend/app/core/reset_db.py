from app.core.database import Base, engine, get_db
from app.models.user import User
from sqlalchemy.orm import Session

def reset_db():
    # Drop and recreate all tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Tables recreated")

    # Seed admin user
    db: Session = next(get_db())
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(name="Admin User", email="admin@example.com", is_admin=True)
        admin.set_password("adminpass")
        db.add(admin)
        db.commit()
        print("✅ Admin user seeded")

    # Seed normal user for test
    user = db.query(User).filter(User.email == "user@example.com").first()
    if not user:
        user = User(name="Regular User", email="user@example.com")
        user.set_password("userpass")
        db.add(user)
        db.commit()
        print("✅ Normal user seeded")

if __name__ == "__main__":
    reset_db()

