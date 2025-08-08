from app import db
from datetime import datetime
import uuid


class Invitation(db.Model):
    __tablename__ = 'invitations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))
    
    # Información básica
    title = db.Column(db.String(200), nullable=False)
    groom_name = db.Column(db.String(100), nullable=False)
    bride_name = db.Column(db.String(100), nullable=False)
    
    # Fecha y ubicación
    wedding_date = db.Column(db.DateTime, nullable=False)
    ceremony_location = db.Column(db.String(500))
    ceremony_address = db.Column(db.Text)
    reception_location = db.Column(db.String(500))
    reception_address = db.Column(db.Text)
    
    # Multimedia
    main_photo_url = db.Column(db.String(500))
    music_url = db.Column(db.String(500))  # YouTube URL para plan Exclusivo
    
    # Contenido
    welcome_message = db.Column(db.Text)
    dress_code = db.Column(db.String(200))
    special_message = db.Column(db.Text)
    
    # URLs y configuración
    unique_url = db.Column(db.String(100), unique=True, nullable=False)
    template_name = db.Column(db.String(100))
    custom_colors = db.Column(db.JSON)
    
    # Estados
    is_active = db.Column(db.Boolean, default=True)
    is_published = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime)
    
    # Relationships
    guests = db.relationship('Guest', backref='invitation', lazy='dynamic')
    confirmations = db.relationship('Confirmation', backref='invitation', lazy='dynamic')
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.unique_url:
            self.unique_url = str(uuid.uuid4())[:8]
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'groom_name': self.groom_name,
            'bride_name': self.bride_name,
            'wedding_date': self.wedding_date.isoformat() if self.wedding_date else None,
            'ceremony_location': self.ceremony_location,
            'ceremony_address': self.ceremony_address,
            'reception_location': self.reception_location,
            'reception_address': self.reception_address,
            'main_photo_url': self.main_photo_url,
            'unique_url': self.unique_url,
            'is_published': self.is_published,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Guest(db.Model):
    __tablename__ = 'guests'
    
    id = db.Column(db.Integer, primary_key=True)
    invitation_id = db.Column(db.Integer, db.ForeignKey('invitations.id'), nullable=False)
    
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    custom_message = db.Column(db.Text)  # Mensaje personalizado para plan Exclusivo
    guest_url = db.Column(db.String(100), unique=True)  # URL única por invitado
    
    # Tracking
    visits_count = db.Column(db.Integer, default=0)
    last_visit = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.guest_url:
            self.guest_url = str(uuid.uuid4())[:12]
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'guest_url': self.guest_url,
            'visits_count': self.visits_count,
            'last_visit': self.last_visit.isoformat() if self.last_visit else None
        }


class Confirmation(db.Model):
    __tablename__ = 'confirmations'
    
    id = db.Column(db.Integer, primary_key=True)
    invitation_id = db.Column(db.Integer, db.ForeignKey('invitations.id'), nullable=False)
    guest_id = db.Column(db.Integer, db.ForeignKey('guests.id'))
    
    # Datos de confirmación
    guest_name = db.Column(db.String(200), nullable=False)
    guest_email = db.Column(db.String(120))
    guest_phone = db.Column(db.String(20))
    will_attend = db.Column(db.Boolean, nullable=False)
    guest_count = db.Column(db.Integer, default=1)
    
    # Información adicional (plan Exclusivo)
    dietary_restrictions = db.Column(db.Text)
    special_requests = db.Column(db.Text)
    additional_notes = db.Column(db.Text)
    
    # Método de confirmación
    confirmation_method = db.Column(db.String(50))  # 'whatsapp', 'form', 'email'
    
    confirmed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'guest_name': self.guest_name,
            'guest_email': self.guest_email,
            'will_attend': self.will_attend,
            'guest_count': self.guest_count,
            'dietary_restrictions': self.dietary_restrictions,
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None
        }