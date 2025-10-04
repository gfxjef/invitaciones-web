"""
Update gfxjef@gmail.com user password for testing
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

TARGET_EMAIL = "gfxjef@gmail.com"
NEW_PASSWORD = "TestPassword123"

with app.app_context():
    # Find user
    user = User.query.filter_by(email=TARGET_EMAIL).first()

    if not user:
        print(f"[ERROR] User '{TARGET_EMAIL}' not found!")
    else:
        print(f"[INFO] Found user '{TARGET_EMAIL}' (ID: {user.id})")
        print(f"[INFO] Updating password to '{NEW_PASSWORD}'...")

        # Update password
        user.set_password(NEW_PASSWORD)
        db.session.commit()

        print(f"[OK] Password updated successfully!")

        # Verify
        if user.check_password(NEW_PASSWORD):
            print(f"[OK] Password verification successful!")
        else:
            print(f"[ERROR] Password verification failed!")

        print(f"\n{'='*60}")
        print(f"USE THESE CREDENTIALS FOR TESTING:")
        print(f"{'='*60}")
        print(f"  Email:    {TARGET_EMAIL}")
        print(f"  Password: {NEW_PASSWORD}")
        print(f"{'='*60}")
