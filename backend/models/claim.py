from app import db
from datetime import datetime
from enum import Enum
import uuid


class ClaimType(Enum):
    COMPLAINT = 'COMPLAINT'
    CLAIM = 'CLAIM'
    SUGGESTION = 'SUGGESTION'


class ClaimStatus(Enum):
    RECEIVED = 'RECEIVED'
    IN_PROGRESS = 'IN_PROGRESS'
    RESOLVED = 'RESOLVED'
    CLOSED = 'CLOSED'


class Claim(db.Model):
    __tablename__ = 'claims'
    
    id = db.Column(db.Integer, primary_key=True)
    claim_number = db.Column(db.String(50), unique=True, nullable=False)
    
    # Información del cliente
    client_name = db.Column(db.String(200), nullable=False)
    client_email = db.Column(db.String(120), nullable=False)
    client_phone = db.Column(db.String(20))
    client_document = db.Column(db.String(20))  # DNI/RUC
    
    # Tipo y contenido
    claim_type = db.Column(db.Enum(ClaimType), nullable=False)
    subject = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Producto/servicio relacionado
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))
    product_service = db.Column(db.String(200))
    
    # Estado y seguimiento
    status = db.Column(db.Enum(ClaimStatus), default=ClaimStatus.RECEIVED, nullable=False)
    assigned_to = db.Column(db.String(200))  # Responsable del caso
    
    # Respuesta
    response_text = db.Column(db.Text)
    response_date = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order = db.relationship('Order', backref='claims')
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.claim_number:
            # Generar número de reclamo único
            timestamp = datetime.now().strftime('%Y%m%d')
            random_code = str(uuid.uuid4())[:6].upper()
            self.claim_number = f"REC-{timestamp}-{random_code}"
    
    def to_dict(self):
        return {
            'id': self.id,
            'claim_number': self.claim_number,
            'client_name': self.client_name,
            'client_email': self.client_email,
            'claim_type': self.claim_type.value,
            'subject': self.subject,
            'description': self.description,
            'status': self.status.value,
            'response_text': self.response_text,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'response_date': self.response_date.isoformat() if self.response_date else None
        }