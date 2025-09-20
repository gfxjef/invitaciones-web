from extensions import db
from datetime import datetime
from collections import OrderedDict
import json


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

    # Sistema modular de secciones
    template_type = db.Column(db.String(20), default='legacy')  # 'legacy' or 'modular'
    _sections_config = db.Column('sections_config', db.Text)  # Campo TEXT en BD

    @property
    def sections_config(self):
        """Puente transparente: TEXT → dict automáticamente"""
        if self._sections_config:
            try:
                return json.loads(self._sections_config)
            except (json.JSONDecodeError, TypeError):
                return {}
        return {}

    @sections_config.setter
    def sections_config(self, value):
        """Puente transparente: dict → TEXT automáticamente"""
        if value:
            self._sections_config = json.dumps(value)
        else:
            self._sections_config = None

    # Plan asociado
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'))
    
    # Estados
    is_active = db.Column(db.Boolean, default=True)
    is_premium = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0)
    is_deleted = db.Column(db.Boolean, default=False)  # Soft delete
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime)  # Timestamp for soft delete
    
    # Relationships
    plan = db.relationship('Plan', backref='templates')
    
    def _preserve_sections_order(self):
        """WHY: Preserves the order of sections_config keys during JSON serialization.
        Enforces specific order to ensure consistency across API responses."""
        if not self.sections_config:
            return None

        # Force the specific order expected by frontend
        desired_order = ['hero', 'story', 'video', 'couple', 'footer', 'gallery', 'welcome', 'countdown']

        if isinstance(self.sections_config, dict):
            # Create OrderedDict with desired order
            ordered_sections = OrderedDict()

            # Add sections in desired order if they exist
            for section_name in desired_order:
                if section_name in self.sections_config:
                    ordered_sections[section_name] = self.sections_config[section_name]

            # Add any remaining sections that weren't in desired_order
            for section_name, section_value in self.sections_config.items():
                if section_name not in ordered_sections:
                    ordered_sections[section_name] = section_value

            return ordered_sections

        return self.sections_config

    def soft_delete(self):
        """WHY: Implements soft delete by marking the template as deleted
        instead of removing it from database to preserve data integrity"""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
        self.is_active = False
    
    def to_dict(self):
        """WHY: Serializes template data for API responses, including
        all relevant fields for frontend consumption including plan pricing"""
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'preview_image_url': self.preview_image_url,
            'thumbnail_url': self.thumbnail_url,
            'template_file': self.template_file,  # Added missing template_file field
            'is_premium': self.is_premium,
            'is_active': self.is_active,
            'display_order': self.display_order,
            'supported_features': self.supported_features,
            'default_colors': self.default_colors,
            'template_type': self.template_type,  # New field for modular system
            'sections_config': self._preserve_sections_order(),  # Preserve order from database
            'plan_id': self.plan_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Include plan information with pricing
        if self.plan:
            data['plan'] = {
                'id': self.plan.id,
                'name': self.plan.name,
                'price': float(self.plan.price),
                'currency': self.plan.currency
            }
            data['price'] = float(self.plan.price)
            data['currency'] = self.plan.currency
        else:
            data['plan'] = None
            data['price'] = None
            data['currency'] = 'PEN'
            
        return data