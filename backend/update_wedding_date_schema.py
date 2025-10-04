"""
Script temporal para actualizar el esquema de la columna wedding_date a NULL.
WHY: Los cambios en el modelo Python no se reflejan automáticamente en MySQL.
"""
from app import create_app
from sqlalchemy import text
from extensions import db

app = create_app()

with app.app_context():
    # Ejecutar ALTER TABLE para permitir NULL en wedding_date
    db.session.execute(text('ALTER TABLE invitations MODIFY wedding_date DATETIME NULL'))
    db.session.commit()
    print('OK - Columna wedding_date ahora permite NULL')
    print('OK - Esquema actualizado correctamente')
