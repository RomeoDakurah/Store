from app.core.database import Base, engine, SessionLocal
from app.models.user import User

def reset_db():
    # Drop + recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Tables recreated")

    db = SessionLocal()

    # Seed admin
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            name="Admin User",
            email="admin@example.com",
            is_admin=True
        )
        admin.set_password("adminpass")
        db.add(admin)
        db.commit()
        print("✅ Admin user seeded")

    # Seed normal user
    user = db.query(User).filter(User.email == "user@example.com").first()
    if not user:
        user = User(
            name="Regular User",
            email="user@example.com"
        )
        user.set_password("userpass")
        db.add(user)
        db.commit()
        print("✅ Normal user seeded")

    db.close()

if __name__ == "__main__":
    reset_db()