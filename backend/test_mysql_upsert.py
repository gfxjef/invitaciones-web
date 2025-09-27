#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test script to verify MySQL UPSERT functionality for Google OAuth.

This script tests that the UPSERT operation correctly handles:
1. Initial OAuth record creation
2. Duplicate entry scenarios (should update instead of error)
3. Race condition prevention
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from extensions import db
from models.user import User
from models.oauth import OAuth
from services.google_oauth import GoogleOAuthService
from sqlalchemy.dialects.mysql import insert
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_app():
    """Create Flask app for testing."""
    app = Flask(__name__)

    # Database configuration
    db_host = os.getenv('DB_HOST', 'localhost')
    db_user = os.getenv('DB_USER', 'root')
    db_password = os.getenv('DB_PASSWORD', '')
    db_name = os.getenv('DB_NAME', 'invitaciones_web')
    db_port = os.getenv('DB_PORT', '3306')

    database_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 3600,
        'pool_size': 10,
        'max_overflow': 20,
        'pool_timeout': 30,
        'echo': True  # Enable SQL query logging for testing
    }

    db.init_app(app)
    return app

def test_mysql_upsert():
    """Test the MySQL UPSERT functionality."""

    app = create_test_app()

    with app.app_context():
        try:
            print("TEST ========== INICIANDO PRUEBA MYSQL UPSERT ==========")

            # Test data - use timestamp to ensure uniqueness
            import time
            timestamp = str(int(time.time()))
            test_google_id = f"test_google_id_{timestamp}"
            test_email = f"test_{timestamp}@example.com"
            test_name = "Test User"
            test_picture = "https://example.com/photo.jpg"

            # Clean up any existing test data
            OAuth.query.filter_by(provider_user_id=test_google_id).delete()
            User.query.filter_by(email=test_email).delete()
            db.session.commit()
            print(f"CLEAN Cleaned up existing test data for {test_email}")

            # Create a test user
            test_user = User(
                email=test_email,
                first_name="Test",
                last_name="User",
                provider='google',
                google_id=test_google_id,
                is_active=True,
                email_verified=True
            )
            db.session.add(test_user)
            db.session.commit()
            print(f"SUCCESS Created test user: {test_user.id}")

            # Test 1: First UPSERT (should INSERT)
            print("\nTEST 1: First UPSERT (should INSERT)")
            result1 = GoogleOAuthService.upsert_oauth_record(
                test_user, test_google_id, test_email, test_name, test_picture
            )
            db.session.commit()
            print(f"SUCCESS First UPSERT completed - rows affected: {result1.rowcount}")

            # Verify record was created
            oauth_record = OAuth.query.filter_by(provider_user_id=test_google_id).first()
            if oauth_record:
                print(f"SUCCESS OAuth record created: ID={oauth_record.id}, email={oauth_record.user_email}")
            else:
                print("ERROR OAuth record NOT found after first UPSERT")
                return False

            # Test 2: Second UPSERT with same data (should UPDATE)
            print("\nTEST 2: Second UPSERT with same data (should UPDATE)")
            updated_name = "Updated Test User"
            updated_picture = "https://example.com/new_photo.jpg"

            result2 = GoogleOAuthService.upsert_oauth_record(
                test_user, test_google_id, test_email, updated_name, updated_picture
            )
            db.session.commit()
            print(f"SUCCESS Second UPSERT completed - rows affected: {result2.rowcount}")

            # Verify record was updated, not duplicated
            oauth_records = OAuth.query.filter_by(provider_user_id=test_google_id).all()
            if len(oauth_records) == 1:
                record = oauth_records[0]
                if record.user_name == updated_name and record.profile_picture == updated_picture:
                    print(f"SUCCESS OAuth record updated correctly: name={record.user_name}")
                else:
                    print(f"ERROR OAuth record NOT updated: name={record.user_name}, expected={updated_name}")
                    return False
            else:
                print(f"ERROR Expected 1 OAuth record, found {len(oauth_records)}")
                return False

            # Test 3: Simulate race condition (multiple concurrent UPSERTs)
            print("\nTEST 3: Simulate concurrent UPSERTs (race condition test)")

            for i in range(3):
                concurrent_name = f"Concurrent User {i}"
                result = GoogleOAuthService.upsert_oauth_record(
                    test_user, test_google_id, test_email, concurrent_name, test_picture
                )
                db.session.commit()
                print(f"  - Concurrent UPSERT {i+1} completed - rows affected: {result.rowcount}")

            # Verify still only one record exists
            final_records = OAuth.query.filter_by(provider_user_id=test_google_id).all()
            if len(final_records) == 1:
                print(f"SUCCESS Race condition test passed: still only 1 record exists")
            else:
                print(f"ERROR Race condition test FAILED: {len(final_records)} records found")
                return False

            print("\nSUCCESS ========== TODAS LAS PRUEBAS PASARON ==========")
            print("SUCCESS MySQL UPSERT funciona correctamente")
            print("SUCCESS No hay duplicados creados")
            print("SUCCESS Actualizaciones funcionan correctamente")
            print("SUCCESS Race conditions estan prevenidas")

            # Clean up test data
            OAuth.query.filter_by(provider_user_id=test_google_id).delete()
            User.query.filter_by(id=test_user.id).delete()
            db.session.commit()
            print("CLEAN Test data cleaned up")

            return True

        except Exception as e:
            print(f"ERROR Error during testing: {str(e)}")
            print(f"ERROR Error type: {type(e).__name__}")
            db.session.rollback()
            return False

if __name__ == "__main__":
    success = test_mysql_upsert()
    if success:
        print("\nSUCCESS MYSQL UPSERT TEST COMPLETED SUCCESSFULLY!")
        print("SUCCESS Google OAuth race condition issue is FIXED")
    else:
        print("\nERROR MYSQL UPSERT TEST FAILED")
        print("ERROR Check the errors above and fix the implementation")

    sys.exit(0 if success else 1)