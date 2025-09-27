"""
Manual migration script for Google OAuth support.
This script adds only the necessary columns and tables for Google OAuth integration.
"""

import os
import sys
from dotenv import load_dotenv
import pymysql

# Load environment variables
load_dotenv()

def get_db_connection():
    """Get database connection from environment variables."""
    return pymysql.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'invitaciones_web'),
        port=int(os.getenv('DB_PORT', '3306')),
        charset='utf8mb4'
    )

def run_migration():
    """Execute Google OAuth migration."""
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        print("Starting Google OAuth migration...")

        # 1. Add new columns to users table
        print("Adding OAuth fields to users table...")

        # Check if columns already exist
        cursor.execute("SHOW COLUMNS FROM users LIKE 'google_id'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR(100) NULL UNIQUE")
            print("[OK] Added google_id column")
        else:
            print("[OK] google_id column already exists")

        cursor.execute("SHOW COLUMNS FROM users LIKE 'provider'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN provider VARCHAR(50) NULL")
            print("[OK] Added provider column")
        else:
            print("[OK] provider column already exists")

        cursor.execute("SHOW COLUMNS FROM users LIKE 'profile_picture'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN profile_picture TEXT NULL")
            print("[OK] Added profile_picture column")
        else:
            print("[OK] profile_picture column already exists")

        # 2. Modify password_hash to allow NULL (for OAuth users)
        print("Modifying password_hash to allow NULL...")
        cursor.execute("ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL")
        print("[OK] Modified password_hash to allow NULL")

        # 3. Add index on google_id
        cursor.execute("SHOW INDEX FROM users WHERE Key_name = 'ix_users_google_id'")
        if not cursor.fetchone():
            cursor.execute("CREATE INDEX ix_users_google_id ON users (google_id)")
            print("[OK] Added index on google_id")
        else:
            print("[OK] Index on google_id already exists")

        # 4. Create oauth table
        print("Creating oauth table...")
        oauth_table_sql = """
        CREATE TABLE IF NOT EXISTS oauth (
            id INTEGER NOT NULL AUTO_INCREMENT,
            provider VARCHAR(50) NOT NULL,
            created_at DATETIME NULL,
            token JSON NULL,
            provider_user_id VARCHAR(256) NOT NULL UNIQUE,
            user_id INTEGER NOT NULL,
            user_email VARCHAR(120) NULL,
            user_name VARCHAR(100) NULL,
            profile_picture TEXT NULL,
            updated_at DATETIME NULL,
            is_active BOOLEAN NULL DEFAULT 1,
            PRIMARY KEY (id),
            FOREIGN KEY(user_id) REFERENCES users (id),
            INDEX ix_oauth_provider_user_id (provider_user_id)
        )
        """
        cursor.execute(oauth_table_sql)
        print("[OK] Created oauth table")

        # Commit all changes
        connection.commit()
        print("[SUCCESS] Google OAuth migration completed successfully!")

        # Update alembic version table
        print("Updating alembic version...")
        cursor.execute("SELECT version_num FROM alembic_version")
        current_version = cursor.fetchone()
        if current_version:
            new_version = "google_oauth_manual"
            cursor.execute("UPDATE alembic_version SET version_num = %s", (new_version,))
            connection.commit()
            print(f"[OK] Updated alembic version to {new_version}")

    except Exception as e:
        connection.rollback()
        print(f"[ERROR] Migration failed: {e}")
        raise

    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    try:
        run_migration()
        print("\n[SUCCESS] Google OAuth migration completed! You can now use Google login.")
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        sys.exit(1)