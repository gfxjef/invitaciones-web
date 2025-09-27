from extensions import db
from flask_dance.consumer.storage.sqla import OAuthConsumerMixin
from datetime import datetime


class OAuth(OAuthConsumerMixin, db.Model):
    """OAuth token storage for Flask-Dance integration.

    WHY: Stores OAuth tokens from providers like Google securely in database.
    Follows Flask-Dance pattern for OAuth consumer storage.
    """
    __tablename__ = 'oauth'

    # Flask-Dance required fields (inherited from OAuthConsumerMixin)
    # - provider: OAuth provider name (e.g., 'google')
    # - created_at: Token creation timestamp
    # - token: JSON field containing access/refresh tokens

    # Custom fields for our implementation
    provider_user_id = db.Column(db.String(256), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Additional metadata
    user_email = db.Column(db.String(120))  # Cache user email from provider
    user_name = db.Column(db.String(100))   # Cache display name from provider
    profile_picture = db.Column(db.Text)    # Cache profile picture URL
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    user = db.relationship('User', backref='oauth_accounts')

    def __repr__(self):
        return f'<OAuth {self.provider}:{self.provider_user_id} -> User:{self.user_id}>'

    def to_dict(self):
        """Serialize OAuth record for API responses."""
        return {
            'id': self.id,
            'provider': self.provider,
            'provider_user_id': self.provider_user_id,
            'user_email': self.user_email,
            'user_name': self.user_name,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active
        }

    @classmethod
    def find_by_provider_user_id(cls, provider, provider_user_id):
        """Find OAuth record by provider and external user ID."""
        return cls.query.filter_by(
            provider=provider,
            provider_user_id=str(provider_user_id),
            is_active=True
        ).first()

    @classmethod
    def create_oauth_user(cls, provider, provider_user_id, user_id, **kwargs):
        """Create new OAuth record linking provider account to local user."""
        oauth_record = cls(
            provider=provider,
            provider_user_id=str(provider_user_id),
            user_id=user_id,
            user_email=kwargs.get('user_email'),
            user_name=kwargs.get('user_name'),
            profile_picture=kwargs.get('profile_picture')
        )

        db.session.add(oauth_record)
        return oauth_record

    def update_user_info(self, **kwargs):
        """Update cached user information from provider."""
        if 'user_email' in kwargs:
            self.user_email = kwargs['user_email']
        if 'user_name' in kwargs:
            self.user_name = kwargs['user_name']
        if 'profile_picture' in kwargs:
            self.profile_picture = kwargs['profile_picture']

        self.updated_at = datetime.utcnow()