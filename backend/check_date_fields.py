from app import create_app
from models.invitation_sections_data import InvitationSectionsData
from extensions import db

app = create_app()
app.app_context().push()

for inv_id in [1, 4, 29, 30, 31, 52]:
    sections = InvitationSectionsData.query.filter_by(invitation_id=inv_id).all()
    print(f'\n=== INVITACION {inv_id} ===')

    for s in sections:
        if s.variables_json:
            has_wedding = 'weddingDate' in s.variables_json
            has_date = 'date' in s.variables_json
            if has_wedding or has_date:
                val_wedding = s.variables_json.get('weddingDate', 'NO')
                val_date = s.variables_json.get('date', 'NO')
                print(f'  {s.section_type}: weddingDate={val_wedding[:20] if isinstance(val_wedding, str) else val_wedding}, date={val_date[:20] if isinstance(val_date, str) else val_date}')
