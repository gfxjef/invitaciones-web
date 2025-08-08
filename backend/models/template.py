from app import db
from datetime import datetime


class Template(db.Model):
    __tablename__ = 'templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))  # 'classic', 'modern', 'minimalist', etc.
    
    # Archivos
    preview_image_url = db.Column(db.String(500))
    thumbnail_url = db.Column(db.String(500))
    template_file = db.Column(db.String(200))  # Nombre del archivo HTML/CSS
    
    # Configuración
    supported_features = db.Column(db.JSON)  # Lista de características soportadas
    default_colors = db.Column(db.JSON)  # Paleta de colores por defecto
    
    # Plan asociado
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'))
    
    # Estados
    is_active = db.Column(db.Boolean, default=True)
    is_premium = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    plan = db.relationship('Plan', backref='templates')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'preview_image_url': self.preview_image_url,
            'thumbnail_url': self.thumbnail_url,
            'is_premium': self.is_premium,
            'supported_features': self.supported_features,
            'default_colors': self.default_colors
        }