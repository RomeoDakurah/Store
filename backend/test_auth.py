import requests

BASE_URL = "http://127.0.0.1:8000"

# ---------- 1. Define test user ----------
normal_user = {"name": "Regular User", "email": "user@example.com", "password": "userpass"}
admin_email = "admin@example.com"  # seeded admin
admin_password = "adminpass"

# ---------- 2. Create normal user ----------
resp = requests.post(f"{BASE_URL}/auth/signup", json=normal_user)
if resp.status_code == 200:
    print(f"✅ Created user: {normal_user['email']}")
else:
    print(f"⚠️ Could not create {normal_user['email']}: {resp.text}")

# ---------- 3. Login both users ----------
tokens = {}
for u in [(normal_user["email"], normal_user["password"]), (admin_email, admin_password)]:
    email, password = u
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if resp.status_code == 200:
        tokens[email] = resp.json()["access_token"]
        print(f"✅ Logged in {email}")
    else:
        print(f"⚠️ Login failed for {email}: {resp.text}")

# ---------- 4. Access /auth/me ----------
for email, token in tokens.items():
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"/auth/me for {email}: {resp.json()}")

# ---------- 5. Access /admin/dashboard ----------
for email, token in tokens.items():
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/admin/dashboard", headers=headers)
    if resp.status_code == 200:
        print(f"✅ Admin access granted for {email}")
    else:
        print(f"❌ Admin access denied for {email}: {resp.text}")

