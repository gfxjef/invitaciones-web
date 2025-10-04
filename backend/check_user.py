"""
Check user credentials in database
"""
from models.user import User
from extensions import db
from flask import Flask
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Get DB credentials from env
db_user = os.getenv('DB_USER', 'root')
db_password = os.getenv('DB_PASSWORD', '')
db_host = os.getenv('DB_HOST', 'localhost')
db_name = os.getenv('DB_NAME', 'invitaciones_web')
db_port = os.getenv('DB_PORT', '3306')

print(f"[INFO] Connecting to database:")
print(f"  Host: {db_host}")
print(f"  Database: {db_name}")
print(f"  User: {db_user}")
print(f"  Port: {db_port}")
print()

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)

with app.app_context():
    # Query user
    user = User.query.filter_by(email='gfxjef@gmail.com').first()

    if user:
        print(f"[OK] User found!")
        print(f"  Email: {user.email}")
        print(f"  ID: {user.id}")
        print(f"  First Name: {user.first_name}")
        print(f"  Last Name: {user.last_name}")
        print(f"  Active: {user.is_active}")
        print(f"  Has Password Hash: {bool(user.password_hash)}")
        print(f"  OAuth User: {user.is_oauth_user}")
        print(f"  Provider: {user.provider}")

        # Test password check if exists
        if user.password_hash:
            test_passwords = ['password', 'Password123', 'admin123', '12345678']
            print("\nTesting common passwords:")
            for pwd in test_passwords:
                if user.check_password(pwd):
                    print(f"  [OK] Password '{pwd}' is CORRECT!")
                    break
            else:
                print("  [WARN] None of the common passwords match")
                print("  [INFO] User might be using a different password")
        else:
            print("\n[WARN] User has no password hash (OAuth-only account)")
    else:
        print("[ERROR] User not found!")
        print("\nLet's check what users exist:")
        all_users = User.query.limit(5).all()
        if all_users:
            print(f"Found {User.query.count()} users in database:")
            for u in all_users:
                print(f"  - {u.email} (ID: {u.id})")
        else:
            print("No users found in database!")
