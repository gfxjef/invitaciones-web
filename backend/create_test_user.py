"""
Create a test user for endpoint testing
WHY: Need a user with known credentials to test the orders API
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

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)

TEST_EMAIL = "test_orders@example.com"
TEST_PASSWORD = "TestPassword123"

with app.app_context():
    # Check if test user exists
    existing_user = User.query.filter_by(email=TEST_EMAIL).first()

    if existing_user:
        print(f"[WARN] Test user '{TEST_EMAIL}' already exists!")
        print(f"  ID: {existing_user.id}")
        print(f"  Active: {existing_user.is_active}")

        # Update password to ensure it's correct
        print(f"\n[INFO] Updating password to '{TEST_PASSWORD}'...")
        existing_user.set_password(TEST_PASSWORD)
        db.session.commit()
        print(f"[OK] Password updated successfully!")

        # Verify
        if existing_user.check_password(TEST_PASSWORD):
            print(f"[OK] Password verification successful!")
        else:
            print(f"[ERROR] Password verification failed!")

    else:
        print(f"[INFO] Creating test user '{TEST_EMAIL}'...")

        # Create test user
        test_user = User(
            email=TEST_EMAIL,
            first_name="Test",
            last_name="Orders",
            phone="999999999",
            is_active=True
        )
        test_user.set_password(TEST_PASSWORD)

        db.session.add(test_user)
        db.session.commit()

        print(f"[OK] Test user created successfully!")
        print(f"  ID: {test_user.id}")
        print(f"  Email: {test_user.email}")
        print(f"  Password: {TEST_PASSWORD}")

    print(f"\n{'='*60}")
    print(f"USE THESE CREDENTIALS FOR TESTING:")
    print(f"{'='*60}")
    print(f"  Email:    {TEST_EMAIL}")
    print(f"  Password: {TEST_PASSWORD}")
    print(f"{'='*60}")
