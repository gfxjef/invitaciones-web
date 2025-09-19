"""
Invitation Media Model

This module defines the InvitationMedia model for managing multimedia files
associated with invitations including images, audio, and other media assets.

WHY: Separates media file management from invitation data to enable proper
file tracking, metadata storage, and optimized media serving. Supports
multiple media types with proper categorization and ordering.
"""

from extensions import db
from datetime import datetime
from typing import Dict, Any, List, Optional
import os
from pathlib import Path


class MediaType:
    """
    Enumeration of supported media types for invitations.
    
    WHY: Centralizes media type definitions to ensure consistency
    across the application and enable proper validation.
    """
    HERO = 'hero'                 # Main hero/banner image
    GALLERY = 'gallery'           # Photo gallery images
    DRESSCODE = 'dresscode'       # Dress code reference images
    OG_IMAGE = 'og_image'         # Open Graph social sharing image
    MUSIC = 'music'               # Background music/audio
    AVATAR = 'avatar'             # Couple avatar/profile images
    ICON = 'icon'                 # Custom icons or graphics
    
    @classmethod
    def get_all(cls) -> List[str]:
        """Get all available media types."""
        return [
            cls.HERO, cls.GALLERY, cls.DRESSCODE, cls.OG_IMAGE,
            cls.MUSIC, cls.AVATAR, cls.ICON
        ]
    
    @classmethod
    def get_image_types(cls) -> List[str]:
        """Get media types that should be images."""
        return [cls.HERO, cls.GALLERY, cls.DRESSCODE, cls.OG_IMAGE, cls.AVATAR, cls.ICON]
    
    @classmethod
    def get_audio_types(cls) -> List[str]:
        """Get media types that should be audio."""
        return [cls.MUSIC]


class InvitationMedia(db.Model):
    """
    Manages multimedia files associated with invitations.
    
    This model stores metadata and file information for all types of media
    used in invitations. Supports proper file organization, metadata tracking,
    and display ordering for galleries and collections.
    
    WHY: Centralizes media file management with proper metadata tracking.
    Enables features like image galleries, background music, and social sharing
    images while maintaining file organization and performance through indexing.
    
    Examples:
        - Hero image: main invitation background
        - Gallery: wedding photo collection  
        - Music: background audio for invitation
        - OG Image: social media sharing thumbnail
    """
    __tablename__ = 'invitation_media'
    
    id = db.Column(db.Integer, primary_key=True)
    invitation_id = db.Column(
        db.Integer,
        db.ForeignKey('invitations.id', ondelete='CASCADE'),
        nullable=False,
        index=True  # WHY: Primary query pattern is by invitation_id
    )
    
    # Media categorization and identification
    media_type = db.Column(
        db.Enum(*MediaType.get_all(), name='media_type_enum'),
        nullable=False,
        index=True,
        comment="Type of media: hero, gallery, dresscode, og_image, music, etc."
    )
    
    # Field association for template binding
    field_name = db.Column(
        db.String(100),
        nullable=True,
        comment="Associated field name in invitation data (e.g., 'hero_image', 'gallery_photo_1')"
    )
    
    # File storage information
    file_path = db.Column(
        db.String(500),
        nullable=False,
        comment="Relative path to file from media root directory"
    )
    
    original_filename = db.Column(
        db.String(200),
        nullable=False,
        comment="Original filename as uploaded by user"
    )
    
    # File metadata
    file_size = db.Column(
        db.Integer,
        nullable=True,
        comment="File size in bytes"
    )
    
    mime_type = db.Column(
        db.String(100),
        nullable=True,
        comment="MIME type: image/jpeg, audio/mp3, etc."
    )
    
    # Image-specific metadata (null for non-images)
    image_width = db.Column(
        db.Integer,
        nullable=True,
        comment="Image width in pixels"
    )
    
    image_height = db.Column(
        db.Integer,
        nullable=True,
        comment="Image height in pixels"
    )
    
    # Display and organization
    display_order = db.Column(
        db.Integer,
        default=0,
        nullable=False,
        comment="Display order for galleries and collections (0 = first)"
    )
    
    # Media processing status
    is_processed = db.Column(
        db.Boolean,
        default=False,
        nullable=False,
        comment="Whether media has been processed (thumbnails, optimization, etc.)"
    )
    
    processing_status = db.Column(
        db.String(50),
        default='pending',
        comment="Processing status: pending, processing, completed, failed"
    )
    
    # Additional metadata for media processing and display
    media_metadata = db.Column(
        db.JSON,
        nullable=True,
        comment="Additional metadata: thumbnails, alt text, captions, etc."
    )
    
    # Audit timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    # Relationships
    invitation = db.relationship(
        'Invitation',
        backref=db.backref(
            'media_files',
            lazy='dynamic',
            cascade='all, delete-orphan',
            order_by='InvitationMedia.media_type, InvitationMedia.display_order'
        )
    )
    
    # Composite indexes for performance
    __table_args__ = (
        db.Index('idx_invitation_media_type', 'invitation_id', 'media_type'),
        db.Index('idx_invitation_media_order', 'invitation_id', 'media_type', 'display_order'),
        db.Index('idx_processing_status', 'processing_status', 'created_at'),
    )
    
    def __init__(self, **kwargs):
        """
        Initialize InvitationMedia with validation and defaults.
        
        WHY: Ensures proper initialization with validation of media types
        and automatic field name generation if not provided.
        """
        super().__init__(**kwargs)
        
        # Auto-generate field_name if not provided
        if not self.field_name and self.media_type:
            self.field_name = self._generate_field_name()
    
    def _generate_field_name(self) -> str:
        """
        Generate field name based on media type and display order.
        
        WHY: Provides consistent field naming convention for template
        data binding and ensures unique identifiers for media files.
        """
        if self.media_type == MediaType.GALLERY:
            return f"gallery_image_{self.display_order + 1}"
        elif self.media_type == MediaType.HERO:
            return "hero_image"
        elif self.media_type == MediaType.MUSIC:
            return "background_music"
        elif self.media_type == MediaType.OG_IMAGE:
            return "og_image"
        elif self.media_type == MediaType.DRESSCODE:
            return f"dresscode_image_{self.display_order + 1}"
        elif self.media_type == MediaType.AVATAR:
            return f"avatar_image_{self.display_order + 1}"
        else:
            return f"{self.media_type}_{self.display_order + 1}"
    
    def get_full_url(self, base_url: str = '') -> str:
        """
        Get full URL for media file.
        
        Args:
            base_url: Base URL for media serving (e.g., CDN URL)
            
        Returns:
            Full URL to access the media file
            
        WHY: Centralizes URL generation for media files, enabling easy
        switching between local storage and CDN serving.
        """
        if base_url:
            return f"{base_url.rstrip('/')}/{self.file_path.lstrip('/')}"
        return f"/media/{self.file_path.lstrip('/')}"
    
    def get_thumbnail_url(self, size: str = 'medium', base_url: str = '') -> Optional[str]:
        """
        Get thumbnail URL if available.
        
        Args:
            size: Thumbnail size (small, medium, large)
            base_url: Base URL for media serving
            
        Returns:
            Thumbnail URL or None if not available
            
        WHY: Provides optimized image serving for better performance.
        Thumbnails are generated during media processing.
        """
        if not self.media_metadata or not self.media_metadata.get('thumbnails'):
            return None
            
        thumbnails = self.media_metadata.get('thumbnails', {})
        thumbnail_path = thumbnails.get(size)
        
        if thumbnail_path:
            if base_url:
                return f"{base_url.rstrip('/')}/{thumbnail_path.lstrip('/')}"
            return f"/media/{thumbnail_path.lstrip('/')}"
        
        return None
    
    def is_image(self) -> bool:
        """Check if this media file is an image."""
        return self.media_type in MediaType.get_image_types()
    
    def is_audio(self) -> bool:
        """Check if this media file is audio."""
        return self.media_type in MediaType.get_audio_types()
    
    def update_processing_status(self, status: str, metadata: Optional[Dict] = None) -> None:
        """
        Update media processing status and metadata.
        
        Args:
            status: New processing status
            metadata: Optional metadata update
            
        WHY: Tracks media processing pipeline status for async operations
        like thumbnail generation and optimization.
        """
        self.processing_status = status
        self.is_processed = (status == 'completed')
        
        if metadata:
            if self.media_metadata:
                self.media_metadata.update(metadata)
            else:
                self.media_metadata = metadata
        
        self.updated_at = datetime.utcnow()
    
    def set_dimensions(self, width: int, height: int) -> None:
        """
        Set image dimensions.
        
        Args:
            width: Image width in pixels
            height: Image height in pixels
            
        WHY: Stores image dimensions for responsive display and
        aspect ratio calculations in templates.
        """
        if self.is_image():
            self.image_width = width
            self.image_height = height
    
    def get_aspect_ratio(self) -> Optional[float]:
        """
        Calculate aspect ratio for images.
        
        Returns:
            Aspect ratio (width/height) or None for non-images
            
        WHY: Enables responsive image display and layout calculations
        in frontend templates.
        """
        if self.is_image() and self.image_width and self.image_height:
            return self.image_width / self.image_height
        return None
    
    @classmethod
    def get_by_type(cls, invitation_id: int, media_type: str) -> List['InvitationMedia']:
        """
        Get all media files of a specific type for an invitation.
        
        Args:
            invitation_id: ID of the invitation
            media_type: Type of media to retrieve
            
        Returns:
            List of media files ordered by display_order
            
        WHY: Efficient retrieval of specific media types for template
        rendering and gallery display.
        """
        return cls.query.filter_by(
            invitation_id=invitation_id,
            media_type=media_type
        ).order_by(cls.display_order).all()
    
    @classmethod
    def get_gallery_images(cls, invitation_id: int) -> List['InvitationMedia']:
        """Get all gallery images for an invitation."""
        return cls.get_by_type(invitation_id, MediaType.GALLERY)
    
    @classmethod
    def get_hero_image(cls, invitation_id: int) -> Optional['InvitationMedia']:
        """Get the hero image for an invitation."""
        images = cls.get_by_type(invitation_id, MediaType.HERO)
        return images[0] if images else None
    
    @classmethod
    def reorder_media(cls, invitation_id: int, media_type: str, media_ids: List[int]) -> None:
        """
        Reorder media files of a specific type.
        
        Args:
            invitation_id: ID of the invitation
            media_type: Type of media to reorder
            media_ids: List of media IDs in desired order
            
        WHY: Enables drag-and-drop reordering in admin interface.
        Updates display_order based on position in list.
        """
        for index, media_id in enumerate(media_ids):
            media = cls.query.filter_by(
                id=media_id,
                invitation_id=invitation_id,
                media_type=media_type
            ).first()
            
            if media:
                media.display_order = index
                media.updated_at = datetime.utcnow()
        
        db.session.commit()
    
    def delete_file(self, media_root: str) -> bool:
        """
        Delete the physical file from storage.
        
        Args:
            media_root: Root directory for media files
            
        Returns:
            True if file was deleted successfully
            
        WHY: Ensures cleanup of physical files when media records are deleted.
        Prevents orphaned files in storage.
        """
        try:
            full_path = Path(media_root) / self.file_path
            if full_path.exists():
                full_path.unlink()
                
                # Also delete thumbnails if they exist
                if self.media_metadata and self.media_metadata.get('thumbnails'):
                    for thumbnail_path in self.media_metadata['thumbnails'].values():
                        thumb_full_path = Path(media_root) / thumbnail_path
                        if thumb_full_path.exists():
                            thumb_full_path.unlink()
                
                return True
        except Exception:
            # WHY: Graceful handling of file deletion errors
            # Database record can still be deleted even if file cleanup fails
            pass
        
        return False
    
    def to_dict(self, include_urls: bool = True, base_url: str = '') -> Dict[str, Any]:
        """
        Serialize invitation media to dictionary.
        
        Args:
            include_urls: Whether to include computed URLs
            base_url: Base URL for media serving
            
        Returns:
            Dictionary representation with metadata and URLs
            
        WHY: Provides consistent API response format with optional URL
        generation for different serving contexts (local, CDN).
        """
        data = {
            'id': self.id,
            'invitation_id': self.invitation_id,
            'media_type': self.media_type,
            'field_name': self.field_name,
            'file_path': self.file_path,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'image_width': self.image_width,
            'image_height': self.image_height,
            'display_order': self.display_order,
            'is_processed': self.is_processed,
            'processing_status': self.processing_status,
            'media_metadata': self.media_metadata,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_urls:
            data['url'] = self.get_full_url(base_url)
            data['thumbnail_urls'] = {
                'small': self.get_thumbnail_url('small', base_url),
                'medium': self.get_thumbnail_url('medium', base_url),
                'large': self.get_thumbnail_url('large', base_url)
            }
            
            if self.is_image():
                data['aspect_ratio'] = self.get_aspect_ratio()
        
        return data
    
    def __repr__(self):
        return f'<InvitationMedia {self.invitation_id}:{self.media_type}:{self.original_filename}>'