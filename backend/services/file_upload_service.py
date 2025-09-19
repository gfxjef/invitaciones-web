"""
File Upload Service for Invitation Media Management

This service handles the complete file upload workflow including validation,
processing, FTP upload, and database record creation for invitation media files.

WHY: Centralizes file upload logic with comprehensive validation, processing,
and error handling. Integrates FTP operations with database management and
provides a clean API for the application layers.
"""

import os
import tempfile
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union, Any
from werkzeug.datastructures import FileStorage
from PIL import Image, ImageOps
import hashlib
from datetime import datetime

from models.invitation_media import InvitationMedia, MediaType
from models.invitation import Invitation
from utils.ftp_manager import FTPManager, create_ftp_manager, FTPUploadError
from extensions import db

logger = logging.getLogger(__name__)


class FileValidationError(Exception):
    """Raised when file validation fails."""
    pass


class FileProcessingError(Exception):
    """Raised when file processing fails."""
    pass


class FileUploadService:
    """
    Service for handling invitation media file uploads.
    
    Provides comprehensive file upload functionality including validation,
    image processing, FTP upload, and database record management. Supports
    multiple media types with automatic optimization and thumbnail generation.
    
    WHY: Centralizes all file upload logic to ensure consistent validation,
    processing, and storage across the invitation system. Provides robust
    error handling and cleanup mechanisms.
    """
    
    def __init__(self):
        """Initialize file upload service with FTP manager."""
        self.ftp_manager = None
        
        # Image processing configurations
        self.thumbnail_sizes = {
            'small': (150, 150),
            'medium': (300, 300),
            'large': (800, 600)
        }
        
        # Image quality settings for optimization
        self.image_quality = {
            'thumbnail': 80,
            'optimized': 85,
            'original': 95
        }
        
        # Maximum dimensions for different media types
        self.max_dimensions = {
            'hero': (1920, 1080),
            'gallery': (1200, 800),
            'dresscode': (800, 600),
            'og_image': (1200, 630),  # Optimal for social sharing
            'avatar': (400, 400),
            'icon': (200, 200)
        }
    
    def _get_ftp_manager(self):
        """Get FTP manager instance, creating it if necessary."""
        if self.ftp_manager is None:
            self.ftp_manager = create_ftp_manager()
        return self.ftp_manager
    
    def upload_media_file(self, file: FileStorage, invitation_id: int, 
                         media_type: str, field_name: str = None,
                         display_order: int = 0, metadata: Dict = None) -> InvitationMedia:
        """
        Upload a media file for an invitation.
        
        Args:
            file: Uploaded file from Flask request
            invitation_id: ID of the invitation
            media_type: Type of media (hero, gallery, music, etc.)
            field_name: Custom field name (optional)
            display_order: Display order for galleries
            metadata: Additional metadata (optional)
            
        Returns:
            Created InvitationMedia record
            
        Raises:
            FileValidationError: If file validation fails
            FileProcessingError: If file processing fails
            FTPUploadError: If FTP upload fails
            
        WHY: Provides complete file upload workflow with proper error handling
        and cleanup. Ensures data consistency between FTP storage and database.
        """
        # Validate invitation exists and user has access
        invitation = self._validate_invitation_access(invitation_id)
        
        # Validate file
        self._validate_uploaded_file(file, media_type)
        
        # Create temporary file for processing
        temp_file_path = None
        try:
            # Save uploaded file to temporary location
            temp_file_path = self._save_temp_file(file)
            
            # Process file (optimization, thumbnails, etc.)
            processed_files = self._process_file(temp_file_path, media_type, invitation_id)
            
            # Upload main file to FTP
            ftp_manager = self._get_ftp_manager()
            main_upload_result = ftp_manager.upload_file(
                processed_files['main'], 
                invitation_id, 
                media_type,
                self._generate_filename(file.filename, media_type)
            )
            
            # Upload thumbnails if they exist
            thumbnail_urls = {}
            if 'thumbnails' in processed_files:
                for size, thumb_path in processed_files['thumbnails'].items():
                    thumb_filename = f"thumb_{size}_{Path(main_upload_result['filename']).stem}.jpg"
                    thumb_result = ftp_manager.upload_file(
                        thumb_path, 
                        invitation_id, 
                        media_type,
                        thumb_filename
                    )
                    thumbnail_urls[size] = thumb_result['relative_path']
            
            # Create database record
            media_metadata = metadata or {}
            if thumbnail_urls:
                media_metadata['thumbnails'] = thumbnail_urls
            
            # Add processing metadata
            media_metadata.update({
                'original_filename': file.filename,
                'processed_at': datetime.utcnow().isoformat(),
                'file_hash': self._calculate_file_hash(processed_files['main'])
            })
            
            media_record = InvitationMedia(
                invitation_id=invitation_id,
                media_type=media_type,
                field_name=field_name,
                file_path=main_upload_result['relative_path'],
                original_filename=file.filename,
                file_size=main_upload_result['file_size'],
                mime_type=main_upload_result['mime_type'],
                image_width=main_upload_result.get('image_width'),
                image_height=main_upload_result.get('image_height'),
                display_order=display_order,
                is_processed=True,
                processing_status='completed',
                media_metadata=media_metadata
            )
            
            db.session.add(media_record)
            db.session.commit()
            
            logger.info(f"Media file uploaded successfully: {main_upload_result['public_url']}")
            return media_record
            
        except Exception as e:
            # Cleanup on error
            db.session.rollback()
            
            # Try to clean up uploaded files
            try:
                if 'main_upload_result' in locals():
                    ftp_manager.delete_file(main_upload_result['remote_path'])
                    
                if 'thumbnail_urls' in locals():
                    for thumb_path in thumbnail_urls.values():
                        full_thumb_path = f"{ftp_manager.base_path}/{thumb_path}"
                        ftp_manager.delete_file(full_thumb_path)
            except:
                logger.warning("Could not clean up uploaded files after error")
            
            logger.error(f"File upload failed: {str(e)}")
            raise FileProcessingError(f"Upload failed: {str(e)}")
            
        finally:
            # Cleanup temporary files
            temp_files_to_clean = []
            if temp_file_path:
                temp_files_to_clean.append(temp_file_path)
            
            if 'processed_files' in locals() and processed_files:
                # Add main file
                if 'main' in processed_files:
                    temp_files_to_clean.append(processed_files['main'])
                # Add thumbnail files
                if 'thumbnails' in processed_files and isinstance(processed_files['thumbnails'], dict):
                    temp_files_to_clean.extend(processed_files['thumbnails'].values())
            
            self._cleanup_temp_files(temp_files_to_clean)
    
    def upload_multiple_files(self, files: List[FileStorage], invitation_id: int,
                            media_type: str, metadata: Dict = None) -> List[InvitationMedia]:
        """
        Upload multiple media files for an invitation.
        
        Args:
            files: List of uploaded files
            invitation_id: ID of the invitation
            media_type: Type of media
            metadata: Additional metadata (optional)
            
        Returns:
            List of created InvitationMedia records
            
        WHY: Efficient batch upload processing with proper ordering and
        transaction management. Provides all-or-nothing semantics.
        """
        if not files:
            return []
        
        results = []
        try:
            for index, file in enumerate(files):
                if file and file.filename:
                    media_record = self.upload_media_file(
                        file, invitation_id, media_type,
                        display_order=index,
                        metadata=metadata
                    )
                    results.append(media_record)
            
            return results
            
        except Exception as e:
            # Cleanup uploaded files on batch failure
            for media_record in results:
                try:
                    self.delete_media_file(media_record.id)
                except:
                    pass
            
            logger.error(f"Batch upload failed: {str(e)}")
            raise FileProcessingError(f"Batch upload failed: {str(e)}")
    
    def delete_media_file(self, media_id: int) -> bool:
        """
        Delete a media file and its database record.
        
        Args:
            media_id: ID of the media record
            
        Returns:
            True if deletion was successful
            
        WHY: Ensures complete cleanup of both database records and FTP files.
        Maintains data consistency and prevents orphaned files.
        """
        try:
            media_record = InvitationMedia.query.get(media_id)
            if not media_record:
                return False
            
            # Delete main file from FTP
            ftp_manager = self._get_ftp_manager()
            main_file_path = f"{ftp_manager.base_path}/{media_record.file_path}"
            ftp_manager.delete_file(main_file_path)
            
            # Delete thumbnails if they exist
            if media_record.media_metadata and media_record.media_metadata.get('thumbnails'):
                for thumb_path in media_record.media_metadata['thumbnails'].values():
                    full_thumb_path = f"{ftp_manager.base_path}/{thumb_path}"
                    ftp_manager.delete_file(full_thumb_path)
            
            # Delete database record
            db.session.delete(media_record)
            db.session.commit()
            
            logger.info(f"Media file deleted successfully: {media_id}")
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting media file {media_id}: {str(e)}")
            return False
    
    def reprocess_media_file(self, media_id: int, force: bool = False) -> bool:
        """
        Reprocess an existing media file (regenerate thumbnails, etc.).
        
        Args:
            media_id: ID of the media record
            force: Force reprocessing even if already processed
            
        Returns:
            True if reprocessing was successful
            
        WHY: Enables updating of processed files when processing logic changes
        or when files need optimization updates.
        """
        try:
            media_record = InvitationMedia.query.get(media_id)
            if not media_record:
                return False
            
            if media_record.is_processed and not force:
                return True
            
            # Download file from FTP to temporary location
            temp_file_path = self._download_temp_file(media_record)
            
            try:
                # Reprocess file
                processed_files = self._process_file(
                    temp_file_path, 
                    media_record.media_type, 
                    media_record.invitation_id
                )
                
                # Upload new thumbnails
                ftp_manager = self._get_ftp_manager()
                thumbnail_urls = {}
                if 'thumbnails' in processed_files:
                    for size, thumb_path in processed_files['thumbnails'].items():
                        thumb_filename = f"thumb_{size}_{Path(media_record.original_filename).stem}.jpg"
                        thumb_result = ftp_manager.upload_file(
                            thumb_path,
                            media_record.invitation_id,
                            media_record.media_type,
                            thumb_filename
                        )
                        thumbnail_urls[size] = thumb_result['relative_path']
                
                # Update metadata
                if not media_record.media_metadata:
                    media_record.media_metadata = {}
                
                media_record.media_metadata['thumbnails'] = thumbnail_urls
                media_record.media_metadata['reprocessed_at'] = datetime.utcnow().isoformat()
                media_record.is_processed = True
                media_record.processing_status = 'completed'
                
                db.session.commit()
                
                logger.info(f"Media file reprocessed successfully: {media_id}")
                return True
                
            finally:
                temp_files_to_clean = [temp_file_path] if temp_file_path else []
                if 'processed_files' in locals() and processed_files:
                    if 'main' in processed_files:
                        temp_files_to_clean.append(processed_files['main'])
                    if 'thumbnails' in processed_files and isinstance(processed_files['thumbnails'], dict):
                        temp_files_to_clean.extend(processed_files['thumbnails'].values())
                self._cleanup_temp_files(temp_files_to_clean)
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error reprocessing media file {media_id}: {str(e)}")
            return False
    
    def _validate_invitation_access(self, invitation_id: int) -> Invitation:
        """
        Validate that invitation exists and user has access.
        
        Args:
            invitation_id: ID of the invitation
            
        Returns:
            Invitation record
            
        Raises:
            FileValidationError: If invitation not found or no access
        """
        invitation = Invitation.query.get(invitation_id)
        if not invitation:
            raise FileValidationError(f"Invitation not found: {invitation_id}")
        
        # TODO: Add user access validation based on JWT token
        # current_user_id = get_jwt_identity()
        # if invitation.user_id != current_user_id:
        #     raise FileValidationError("Access denied to invitation")
        
        return invitation
    
    def _validate_uploaded_file(self, file: FileStorage, media_type: str) -> None:
        """
        Validate uploaded file for security and compatibility.
        
        Args:
            file: Uploaded file from Flask request
            media_type: Expected media type
            
        Raises:
            FileValidationError: If file validation fails
        """
        if not file:
            raise FileValidationError("No file provided")
        
        if not file.filename:
            raise FileValidationError("No filename provided")
        
        # Check file extension
        file_ext = Path(file.filename).suffix.lower().lstrip('.')
        
        # Get allowed extensions (use hardcoded values to avoid FTP manager dependency)
        allowed_extensions_map = {
            'images': {'jpg', 'jpeg', 'png', 'webp', 'gif'},
            'audio': {'mp3', 'wav', 'ogg'},
            'video': {'mp4', 'webm'},
            'documents': {'pdf', 'doc', 'docx'}
        }
        
        # Determine expected category based on media type
        if media_type in MediaType.get_image_types():
            allowed_extensions = allowed_extensions_map['images']
        elif media_type in MediaType.get_audio_types():
            allowed_extensions = allowed_extensions_map['audio']
        else:
            # Allow any category that matches the extension
            allowed_extensions = set()
            for exts in allowed_extensions_map.values():
                allowed_extensions.update(exts)
        
        if file_ext not in allowed_extensions:
            allowed = ', '.join(sorted(allowed_extensions))
            raise FileValidationError(f"Invalid file type '{file_ext}'. Allowed: {allowed}")
        
        # Check file size (approximate from content-length header)
        max_file_size = 5 * 1024 * 1024  # 5MB
        if hasattr(file, 'content_length') and file.content_length:
            if file.content_length > max_file_size:
                max_mb = max_file_size / (1024 * 1024)
                raise FileValidationError(f"File too large. Maximum size: {max_mb:.1f}MB")
    
    def _save_temp_file(self, file: FileStorage) -> str:
        """
        Save uploaded file to temporary location.
        
        Args:
            file: Uploaded file from Flask request
            
        Returns:
            Path to temporary file
            
        WHY: Provides secure temporary storage for file processing.
        Ensures consistent file handling across upload workflows.
        """
        file_ext = Path(file.filename).suffix.lower()
        
        # Create temporary file with original extension
        temp_fd, temp_path = tempfile.mkstemp(suffix=file_ext, prefix='upload_')
        
        try:
            with os.fdopen(temp_fd, 'wb') as temp_file:
                file.save(temp_file)
            
            # Validate actual file size
            max_file_size = 5 * 1024 * 1024  # 5MB
            file_size = os.path.getsize(temp_path)
            if file_size > max_file_size:
                os.unlink(temp_path)
                max_mb = max_file_size / (1024 * 1024)
                raise FileValidationError(f"File too large: {file_size} bytes. Maximum: {max_mb:.1f}MB")
            
            return temp_path
            
        except Exception as e:
            # Cleanup temp file on error
            try:
                os.unlink(temp_path)
            except:
                pass
            raise FileProcessingError(f"Error saving uploaded file: {str(e)}")
    
    def _process_file(self, file_path: str, media_type: str, invitation_id: int) -> Dict[str, Union[str, Dict[str, str]]]:
        """
        Process file for optimization and thumbnail generation.
        
        Args:
            file_path: Path to file to process
            media_type: Type of media
            invitation_id: ID of the invitation
            
        Returns:
            Dictionary with paths to processed files
            
        WHY: Optimizes files for web delivery and generates thumbnails
        for better user experience and performance.
        """
        result = {'main': file_path}
        
        # Only process images
        if media_type in MediaType.get_image_types():
            try:
                result = self._process_image(file_path, media_type, invitation_id)
            except Exception as e:
                logger.warning(f"Image processing failed, using original: {str(e)}")
                # Fall back to original file if processing fails
                result = {'main': file_path}
        
        return result
    
    def _process_image(self, image_path: str, media_type: str, invitation_id: int) -> Dict[str, Union[str, Dict[str, str]]]:
        """
        Process image for optimization and thumbnail generation.
        
        Args:
            image_path: Path to image file
            media_type: Type of media
            invitation_id: ID of the invitation
            
        Returns:
            Dictionary with paths to processed image and thumbnails
            
        WHY: Optimizes images for web delivery with appropriate compression
        and generates multiple thumbnail sizes for responsive display.
        """
        result = {}
        thumbnails = {}
        
        try:
            with Image.open(image_path) as img:
                # Convert to RGB if necessary (for JPEG optimization)
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Create white background for transparent images
                    background = Image.new('RGB', img.size, 'white')
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Apply auto-rotation based on EXIF data
                img = ImageOps.exif_transpose(img)
                
                # Optimize main image
                optimized_path = self._optimize_main_image(img, image_path, media_type)
                result['main'] = optimized_path
                
                # Generate thumbnails for image types that need them
                if media_type in ['gallery', 'hero', 'avatar']:
                    thumbnails = self._generate_thumbnails(img, image_path)
                    if thumbnails:
                        result['thumbnails'] = thumbnails
                
        except Exception as e:
            logger.error(f"Error processing image {image_path}: {str(e)}")
            raise FileProcessingError(f"Image processing failed: {str(e)}")
        
        return result
    
    def _optimize_main_image(self, img: Image.Image, original_path: str, media_type: str) -> str:
        """
        Optimize main image for web delivery.
        
        Args:
            img: PIL Image object
            original_path: Path to original image
            media_type: Type of media
            
        Returns:
            Path to optimized image
        """
        # Get maximum dimensions for this media type
        max_dimensions = self.max_dimensions.get(media_type, (1920, 1080))
        
        # Resize if necessary
        if img.size[0] > max_dimensions[0] or img.size[1] > max_dimensions[1]:
            img.thumbnail(max_dimensions, Image.Resampling.LANCZOS)
        
        # Create optimized file
        optimized_fd, optimized_path = tempfile.mkstemp(suffix='.jpg', prefix='optimized_')
        
        try:
            with os.fdopen(optimized_fd, 'wb') as f:
                img.save(f, 'JPEG', quality=self.image_quality['optimized'], optimize=True)
            
            return optimized_path
            
        except Exception as e:
            try:
                os.unlink(optimized_path)
            except:
                pass
            raise FileProcessingError(f"Image optimization failed: {str(e)}")
    
    def _generate_thumbnails(self, img: Image.Image, original_path: str) -> Dict[str, str]:
        """
        Generate thumbnails in multiple sizes.
        
        Args:
            img: PIL Image object
            original_path: Path to original image
            
        Returns:
            Dictionary mapping size names to thumbnail file paths
        """
        thumbnails = {}
        
        for size_name, dimensions in self.thumbnail_sizes.items():
            try:
                # Create thumbnail
                thumb_img = img.copy()
                thumb_img.thumbnail(dimensions, Image.Resampling.LANCZOS)
                
                # Save thumbnail
                thumb_fd, thumb_path = tempfile.mkstemp(suffix='.jpg', prefix=f'thumb_{size_name}_')
                
                with os.fdopen(thumb_fd, 'wb') as f:
                    thumb_img.save(f, 'JPEG', quality=self.image_quality['thumbnail'], optimize=True)
                
                thumbnails[size_name] = thumb_path
                
            except Exception as e:
                logger.warning(f"Failed to generate {size_name} thumbnail: {str(e)}")
                continue
        
        return thumbnails
    
    def _generate_filename(self, original_filename: str, media_type: str) -> str:
        """
        Generate a safe filename for uploaded file.
        
        Args:
            original_filename: Original filename from upload
            media_type: Type of media
            
        Returns:
            Generated safe filename
            
        WHY: Creates safe, unique filenames while preserving file extensions.
        Prevents filename conflicts and security issues.
        """
        # Get file extension
        file_ext = Path(original_filename).suffix.lower()
        
        # Create safe base name
        base_name = Path(original_filename).stem
        safe_name = "".join(c for c in base_name if c.isalnum() or c in '-_').strip()
        
        if not safe_name:
            safe_name = media_type
        
        # Add timestamp for uniqueness
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        
        return f"{safe_name}_{timestamp}{file_ext}"
    
    def _calculate_file_hash(self, file_path: str) -> str:
        """
        Calculate MD5 hash of file for integrity verification.
        
        Args:
            file_path: Path to file
            
        Returns:
            MD5 hash string
        """
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def _download_temp_file(self, media_record: InvitationMedia) -> str:
        """
        Download file from FTP to temporary location for reprocessing.
        
        Args:
            media_record: Media record to download
            
        Returns:
            Path to temporary file
        """
        # This is a placeholder - would need to implement FTP download
        # For now, we'll assume files are available locally
        raise NotImplementedError("FTP file download not implemented yet")
    
    def _cleanup_temp_files(self, file_paths: List[str]) -> None:
        """
        Clean up temporary files.
        
        Args:
            file_paths: List of file paths to clean up
            
        WHY: Prevents accumulation of temporary files and ensures proper
        resource cleanup after processing operations.
        """
        for file_path in file_paths:
            if file_path and os.path.exists(file_path):
                try:
                    os.unlink(file_path)
                except Exception as e:
                    logger.warning(f"Could not delete temporary file {file_path}: {str(e)}")


# Global service instance
file_upload_service = FileUploadService()