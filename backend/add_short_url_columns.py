"""
Add short_code and custom_names columns to invitations table

WHY: Manual migration to add short URL columns without using Flask-Migrate
"""

from extensions import db
from app import create_app

app = create_app()

with app.app_context():
    # Check if columns already exist
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    columns = [col['name'] for col in inspector.get_columns('invitations')]

    print("Current columns in invitations table:")
    print(columns)

    if 'short_code' not in columns:
        print("\nAdding short_code column...")
        with db.engine.connect() as conn:
            conn.execute(db.text("""
                ALTER TABLE invitations
                ADD COLUMN short_code VARCHAR(10) UNIQUE NULL
                COMMENT 'Short code for personalized URLs (e.g., w3d, xv2)'
            """))
            conn.commit()
        print("[OK] short_code column added")
    else:
        print("\n[OK] short_code column already exists")

    if 'custom_names' not in columns:
        print("\nAdding custom_names column...")
        with db.engine.connect() as conn:
            conn.execute(db.text("""
                ALTER TABLE invitations
                ADD COLUMN custom_names VARCHAR(100) NULL
                COMMENT 'Custom couple names for URL (e.g., Carlos&Nayeli)'
            """))
            conn.commit()
        print("[OK] custom_names column added")
    else:
        print("\n[OK] custom_names column already exists")

    # Add index for performance
    print("\nAdding index on short_code...")
    try:
        with db.engine.connect() as conn:
            conn.execute(db.text("CREATE INDEX idx_invitations_short_code ON invitations(short_code)"))
            conn.commit()
        print("[OK] Index created")
    except Exception as e:
        if "Duplicate key name" in str(e):
            print("[OK] Index already exists")
        else:
            print(f"[WARNING] Error creating index: {e}")

    print("\n[SUCCESS] Migration completed successfully!")
