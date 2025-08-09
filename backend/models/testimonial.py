from extensions import db
from datetime import datetime
from enum import Enum


class TestimonialStatus(Enum):
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'


class Testimonial(db.Model):
    __tablename__ = 'testimonials'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Datos del testimonio
    client_name = db.Column(db.String(200), nullable=False)
    client_email = db.Column(db.String(120))
    testimonial_text = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer)  # 1-5 estrellas
    
    # Información adicional
    wedding_date = db.Column(db.Date)
    client_photo_url = db.Column(db.String(500))
    plan_used = db.Column(db.String(100))
    
    # Estado
    status = db.Column(db.Enum(TestimonialStatus), default=TestimonialStatus.PENDING, nullable=False)
    is_featured = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'client_name': self.client_name,
            'testimonial_text': self.testimonial_text,
            'rating': self.rating,
            'wedding_date': self.wedding_date.isoformat() if self.wedding_date else None,
            'client_photo_url': self.client_photo_url,
            'plan_used': self.plan_used,
            'is_featured': self.is_featured,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }