"""Google OAuth Service

Centralized service for handling Google OAuth authentication.
Provides clean separation between Flask-Dance integration and business logic.
"""

import os
from flask import current_app, url_for
from flask_jwt_extended import create_access_token, create_refresh_token
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from models.user import User
from models.oauth import OAuth
from extensions import db
import logging

logger = logging.getLogger(__name__)


class GoogleOAuthService:
    """Service for Google OAuth operations."""

    @staticmethod
    def get_google_client_config():
        """Get Google OAuth client configuration from environment."""
        return {
            'client_id': os.getenv('GOOGLE_CLIENT_ID'),
            'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
            'scope': ['openid', 'email', 'profile'],
            'redirect_uri': os.getenv('GOOGLE_REDIRECT_URI')
        }

    @staticmethod
    def verify_google_token(credential):
        """Verify Google ID token and extract user information.

        Args:
            credential (str): Google ID token from frontend

        Returns:
            dict: Verified user information from Google

        Raises:
            ValueError: If token is invalid or verification fails
        """
        try:
            client_id = os.getenv('GOOGLE_CLIENT_ID')
            if not client_id:
                raise ValueError("GOOGLE_CLIENT_ID not configured")

            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                client_id
            )

            # Verify issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')

            logger.info(f"Google token verified for user: {idinfo.get('email')}")
            return idinfo

        except ValueError as e:
            logger.error(f"Google token verification failed: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error verifying Google token: {e}")
            raise ValueError(f"Token verification failed: {str(e)}")

    @staticmethod
    def process_google_user(user_info):
        """Process Google user information and create/update local user.

        Args:
            user_info (dict): Verified user information from Google

        Returns:
            tuple: (User object, boolean indicating if user was created)
        """
        google_user_id = str(user_info['sub'])
        email = user_info['email']
        name = user_info.get('name', '')
        picture = user_info.get('picture', '')

        # Split name into first and last name
        name_parts = name.split(' ', 1) if name else ['', '']
        first_name = name_parts[0] or 'Usuario'
        last_name = name_parts[1] if len(name_parts) > 1 else 'Google'

        # Try to find existing user by Google ID first
        user = User.find_by_google_id(google_user_id)
        user_created = False

        if user:
            # Update existing user's information
            user.profile_picture = picture
            user.updated_at = db.func.now()
            logger.info(f"Updated existing user {user.id} from Google")

        else:
            # Check if user exists with same email but different provider
            existing_user = User.query.filter_by(email=email, is_active=True).first()

            if existing_user and existing_user.provider != 'google':
                # User exists with traditional login - link Google account
                existing_user.google_id = google_user_id
                existing_user.provider = 'google'  # Update primary provider
                existing_user.profile_picture = picture
                user = existing_user
                logger.info(f"Linked Google account to existing user {user.id}")
            else:
                # Create new Google user
                user = User.create_oauth_user(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    provider='google',
                    google_id=google_user_id,
                    profile_picture=picture
                )
                user_created = True
                logger.info(f"Created new Google user: {email}")

        # Create or update OAuth record
        oauth_record = OAuth.find_by_provider_user_id('google', google_user_id)

        if oauth_record:
            # Update existing OAuth record
            oauth_record.update_user_info(
                user_email=email,
                user_name=name,
                profile_picture=picture
            )
        else:
            # Create new OAuth record
            OAuth.create_oauth_user(
                provider='google',
                provider_user_id=google_user_id,
                user_id=user.id,
                user_email=email,
                user_name=name,
                profile_picture=picture
            )

        # Save all changes
        db.session.add(user)
        db.session.commit()

        return user, user_created

    @staticmethod
    def generate_tokens_for_user(user):
        """Generate JWT tokens for authenticated user.

        Args:
            user (User): Authenticated user object

        Returns:
            dict: Dictionary containing access_token, refresh_token, and user data
        """
        # Create JWT tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'user': user.to_dict(),
            'expires_in': 900  # 15 minutes for access token
        }

    @staticmethod
    def handle_google_login(credential):
        """Complete Google login flow.

        Args:
            credential (str): Google ID token from frontend

        Returns:
            dict: Login response with tokens and user data

        Raises:
            ValueError: If login process fails
        """
        try:
            # Step 1: Verify Google token
            user_info = GoogleOAuthService.verify_google_token(credential)

            # Step 2: Process user (create/update)
            user, user_created = GoogleOAuthService.process_google_user(user_info)

            # Step 3: Generate our JWT tokens
            token_data = GoogleOAuthService.generate_tokens_for_user(user)

            # Step 4: Add login metadata
            response_data = token_data.copy()
            response_data.update({
                'message': 'Google login successful',
                'user_created': user_created,
                'login_method': 'google'
            })

            logger.info(f"Google login completed for user {user.id} ({user.email})")
            return response_data

        except ValueError:
            # Re-raise validation errors
            raise
        except Exception as e:
            logger.error(f"Google login failed: {e}")
            raise ValueError(f"Login process failed: {str(e)}")

    @staticmethod
    def get_google_login_url():
        """Generate Google OAuth login URL for redirect flow.

        Returns:
            str: Google OAuth authorization URL
        """
        # This would be used for server-side redirect flow
        # Currently implementing token-based flow from frontend
        return url_for('google.login', _external=True)

    @staticmethod
    def revoke_google_access(user_id):
        """Revoke Google OAuth access for user (logout).

        Args:
            user_id (int): User ID to revoke access for
        """
        try:
            oauth_record = OAuth.query.filter_by(
                user_id=user_id,
                provider='google',
                is_active=True
            ).first()

            if oauth_record:
                oauth_record.is_active = False
                db.session.commit()
                logger.info(f"Revoked Google access for user {user_id}")

        except Exception as e:
            logger.error(f"Failed to revoke Google access: {e}")
            # Don't raise - this is best effort