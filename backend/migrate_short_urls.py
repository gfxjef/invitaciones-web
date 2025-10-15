"""
Migrate existing short URLs from '&' separator to 'y' separator

WHY: The '&' character is a special URL character (query parameter separator)
     Using 'y' instead avoids all URL encoding issues

WHAT: Updates all invitations with short URLs to use 'y' separator
"""

from app import create_app
from extensions import db
from models.invitation import Invitation

def migrate_short_urls():
    """Migrate all short URLs from & to y separator"""
    app = create_app()

    with app.app_context():
        # Find all invitations with short URLs
        invitations = Invitation.query.filter(
            Invitation.short_code.isnot(None),
            Invitation.custom_names.isnot(None)
        ).all()

        print(f"\n[MIGRATION] Found {len(invitations)} invitations with short URLs")

        updated_count = 0
        for invitation in invitations:
            old_names = invitation.custom_names

            # Check if it contains '&'
            if '&' in old_names:
                # Replace '&' with 'y'
                new_names = old_names.replace('&', 'y')
                invitation.custom_names = new_names

                print(f"[UPDATE] ID {invitation.id}: '{old_names}' -> '{new_names}'")
                updated_count += 1
            else:
                print(f"[SKIP] ID {invitation.id}: '{old_names}' (already correct)")

        if updated_count > 0:
            db.session.commit()
            print(f"\n[SUCCESS] Updated {updated_count} invitation(s)")
        else:
            print(f"\n[INFO] No invitations needed updating")

        print("\n[DONE] Migration complete!")

        # Show all short URLs after migration
        print("\n" + "=" * 60)
        print("CURRENT SHORT URLS IN DATABASE:")
        print("=" * 60)

        invitations = Invitation.query.filter(
            Invitation.short_code.isnot(None)
        ).all()

        for inv in invitations:
            print(f"ID: {inv.id}, Code: {inv.short_code}, Names: {inv.custom_names}")
            print(f"   URL: /{inv.short_code}/{inv.custom_names}")
            print(f"   Full: http://localhost:3000/{inv.short_code}/{inv.custom_names}")
            print()

if __name__ == '__main__':
    migrate_short_urls()
