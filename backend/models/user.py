from extensions import db
from datetime import datetime
import bcrypt
from enum import Enum


class UserRole(Enum):
    CLIENT = 'CLIENT'
    ADMIN = 'ADMIN'
    DESIGNER = 'DESIGNER'


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)  # Allow null for OAuth users
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.Enum(UserRole), default=UserRole.CLIENT, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)

    # OAuth integration fields
    google_id = db.Column(db.String(100), unique=True, nullable=True, index=True)
    provider = db.Column(db.String(50), nullable=True)  # 'google', 'facebook', etc.
    profile_picture = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    orders = db.relationship('Order', backref='user', lazy='dynamic')
    invitations = db.relationship('Invitation', backref='user', lazy='dynamic')
    cart = db.relationship('Cart', backref='user', uselist=False)
    testimonials = db.relationship('Testimonial', backref='user', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        if not self.password_hash:
            return False  # OAuth users don't have passwords
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'role': self.role.value,
            'is_active': self.is_active,
            'email_verified': self.email_verified,
            'google_id': self.google_id,
            'provider': self.provider,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    @property
    def is_oauth_user(self):
        """Check if user was created via OAuth (no password)."""
        return self.provider is not None and self.password_hash is None

    @classmethod
    def create_oauth_user(cls, email, first_name, last_name, provider, google_id=None, profile_picture=None):
        """Create new user from OAuth provider."""
        user = cls(
            email=email,
            first_name=first_name,
            last_name=last_name,
            provider=provider,
            google_id=google_id,
            profile_picture=profile_picture,
            email_verified=True  # OAuth providers verify emails
        )
        return user

    @classmethod
    def find_by_google_id(cls, google_id):
        """Find user by Google ID."""
        return cls.query.filter_by(google_id=str(google_id), is_active=True).first()

    @classmethod
    def find_by_email_and_provider(cls, email, provider):
        """Find user by email and provider combination."""
        return cls.query.filter_by(email=email, provider=provider, is_active=True).first()