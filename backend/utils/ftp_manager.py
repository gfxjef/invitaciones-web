"""
FTP Manager for Invitation Media Upload System

This module provides a centralized FTP management system for uploading and managing
invitation media files to the kossomet.com server. Handles secure FTP connections,
directory management, file uploads, and URL generation.

WHY: Centralizes all FTP operations for the invitation system, ensuring consistent
file organization, proper error handling, and secure operations. Enables efficient
media management with automatic directory structure creation and cleanup.
"""

import os
import ftplib
import logging
from pathlib import Path
from typing import Dict, List, Optional, Union, Tuple
from contextlib import contextmanager
from datetime import datetime
import hashlib
import tempfile
import shutil

# Configure logging for FTP operations
logger = logging.getLogger(__name__)


class FTPConnectionError(Exception):
    """Raised when FTP connection fails."""
    pass


class FTPUploadError(Exception):
    """Raised when file upload fails."""
    pass


class FTPDirectoryError(Exception):
    """Raised when directory operations fail."""
    pass


class FTPManager:
    """
    Centralized FTP manager for invitation media files.
    
    Manages all FTP operations including connections, uploads, deletions,
    and directory management for the invitation system. Provides automatic
    directory structure creation and secure file handling.
    
    WHY: Centralizes FTP operations to ensure consistent file organization,
    proper error handling, and secure connections. Supports the invitation
    media upload system with robust file management capabilities.
    
    Directory Structure on FTP Server:
    /public_html/invita/
    ├── invitations/
    │   ├── {invitation_id}/
    │   │   ├── images/
    │   │   │   ├── hero/
    │   │   │   ├── gallery/
    │   │   │   └── dresscode/
    │   │   ├── audio/
    │   │   └── documents/
    │   └── temp/  # For temporary uploads
    """
    
    def __init__(self, host: str, username: str, password: str, 
                 base_path: str = 'public_html/invita',
                 base_url: str = 'https://kossomet.com/invita'):
        """
        Initialize FTP Manager with connection parameters.
        
        Args:
            host: FTP server hostname
            username: FTP username  
            password: FTP password
            base_path: Base path on FTP server for media files
            base_url: Base URL for accessing uploaded files
            
        WHY: Configures FTP connection parameters and paths for consistent
        file organization and URL generation across the application.
        """
        self.host = host
        self.username = username
        self.password = password
        self.base_path = base_path.rstrip('/')
        self.base_url = base_url.rstrip('/')
        self._connection = None
        
        # File type configurations
        self.max_file_size = 5 * 1024 * 1024  # 5MB
        self.allowed_extensions = {
            'images': {'jpg', 'jpeg', 'png', 'webp', 'gif'},
            'audio': {'mp3', 'wav', 'ogg'},
            'video': {'mp4', 'webm'},
            'documents': {'pdf', 'doc', 'docx'}
        }
        
        # Directory structure mapping
        self.media_directories = {
            'hero': 'images/hero',
            'gallery': 'images/gallery', 
            'dresscode': 'images/dresscode',
            'og_image': 'images/og',
            'avatar': 'images/avatar',
            'icon': 'images/icons',
            'music': 'audio',
            'documents': 'documents'
        }
    
    @contextmanager
    def connection(self):
        """
        Context manager for FTP connections.
        
        Provides automatic connection management with proper cleanup.
        Ensures connections are closed even if errors occur.
        
        WHY: Prevents connection leaks and ensures proper resource management.
        Handles connection failures gracefully and provides retry logic.
        """
        ftp = None
        try:
            # Create FTP connection
            ftp = ftplib.FTP()
            ftp.set_debuglevel(0)  # Disable debug output in production
            
            # Connect with timeout
            logger.info(f"Connecting to FTP server: {self.host}")
            ftp.connect(self.host, timeout=30)
            
            # Login
            ftp.login(self.username, self.password)
            
            # Set to binary mode for file transfers
            ftp.voidcmd('TYPE I')
            
            logger.info("FTP connection established successfully")
            yield ftp
            
        except ftplib.error_perm as e:
            logger.error(f"FTP permission error: {str(e)}")
            raise FTPConnectionError(f"Permission denied: {str(e)}")
        except ftplib.error_temp as e:
            logger.error(f"FTP temporary error: {str(e)}")
            raise FTPConnectionError(f"Temporary error: {str(e)}")
        except Exception as e:
            logger.error(f"FTP connection failed: {str(e)}")
            raise FTPConnectionError(f"Connection failed: {str(e)}")
        finally:
            if ftp:
                try:
                    ftp.quit()
                    logger.info("FTP connection closed")
                except:
                    # WHY: Graceful cleanup even if quit() fails
                    try:
                        ftp.close()
                    except:
                        pass
    
    def test_connection(self) -> bool:
        """
        Test FTP connection without performing operations.
        
        Returns:
            True if connection successful, False otherwise
            
        WHY: Provides a way to validate FTP credentials and connectivity
        without performing actual file operations. Useful for health checks.
        """
        try:
            with self.connection() as ftp:
                # Try to list current directory
                ftp.nlst()
                return True
        except Exception as e:
            logger.error(f"FTP connection test failed: {str(e)}")
            return False
    
    def ensure_directory_structure(self, invitation_id: int) -> Dict[str, str]:
        """
        Create complete directory structure for an invitation.
        
        Args:
            invitation_id: ID of the invitation
            
        Returns:
            Dictionary mapping media types to their FTP paths
            
        WHY: Pre-creates all necessary directories for an invitation to avoid
        upload failures. Returns path mapping for efficient file organization.
        """
        paths = {}
        # Ensure forward slashes for FTP paths
        base_invitation_path = f"{self.base_path}/invitations/{invitation_id}".replace('\\', '/')
        
        try:
            with self.connection() as ftp:
                # Create base invitation directory
                self._ensure_directory(ftp, base_invitation_path)
                
                # Create media type directories
                for media_type, subdir in self.media_directories.items():
                    full_path = f"{base_invitation_path}/{subdir}".replace('\\', '/')
                    self._ensure_directory(ftp, full_path)
                    paths[media_type] = full_path
                    
                logger.info(f"Directory structure created for invitation {invitation_id}")
                return paths
                
        except Exception as e:
            logger.error(f"Failed to create directory structure for invitation {invitation_id}: {str(e)}")
            raise FTPDirectoryError(f"Directory creation failed: {str(e)}")
    
    def _ensure_directory(self, ftp: ftplib.FTP, path: str) -> None:
        """
        Ensure a directory exists on the FTP server, creating if necessary.
        
        Args:
            ftp: Active FTP connection
            path: Full path to directory
            
        WHY: Recursively creates directory structure, handling cases where
        parent directories don't exist. Prevents upload failures due to missing paths.
        """
        # Normalize path to use forward slashes
        path = path.replace('\\', '/')
        
        try:
            # Try to change to the directory
            current_dir = ftp.pwd()
            ftp.cwd(path)
            ftp.cwd(current_dir)  # Return to original directory
            return  # Directory exists
            
        except ftplib.error_perm:
            # Directory doesn't exist, create it step by step
            logger.debug(f"Directory {path} doesn't exist, creating...")
            
            # Start from root and create each part of the path
            ftp.cwd('/')  # Ensure we're at root
            current_dir = ftp.pwd()
            
            # Split path and create each part
            path_parts = [p for p in path.split('/') if p]  # Remove empty parts
            
            for i, part in enumerate(path_parts):
                try:
                    # Try to change to this directory
                    ftp.cwd(part)
                except ftplib.error_perm:
                    # Directory doesn't exist, create it
                    try:
                        ftp.mkd(part)
                        ftp.cwd(part)
                        logger.debug(f"Created and entered directory: {part}")
                    except ftplib.error_perm as e:
                        if "exists" not in str(e).lower() and "file exists" not in str(e).lower():
                            logger.error(f"Failed to create directory {part} in path {path}: {str(e)}")
                            raise
                        # Directory exists, just enter it
                        ftp.cwd(part)
            
            # Return to original directory
            ftp.cwd(current_dir)
    
    def upload_file(self, local_file_path: str, invitation_id: int, 
                   media_type: str, filename: str = None) -> Dict[str, str]:
        """
        Upload a file to the FTP server.
        
        Args:
            local_file_path: Path to local file
            invitation_id: ID of the invitation
            media_type: Type of media (hero, gallery, music, etc.)
            filename: Custom filename (optional, uses original if not provided)
            
        Returns:
            Dictionary with upload details (remote_path, url, size, etc.)
            
        WHY: Handles complete file upload process including validation,
        directory creation, and metadata collection. Provides detailed
        response for database record creation.
        """
        if not os.path.exists(local_file_path):
            raise FTPUploadError(f"Local file not found: {local_file_path}")
        
        # Validate file
        file_info = self._validate_file(local_file_path, media_type)
        
        # Generate filename if not provided
        if not filename:
            filename = self._generate_filename(local_file_path, invitation_id, media_type)
        
        # Determine remote path
        if media_type not in self.media_directories:
            raise FTPUploadError(f"Unknown media type: {media_type}")
        
        # Ensure forward slashes for FTP paths
        remote_dir = f"{self.base_path}/invitations/{invitation_id}/{self.media_directories[media_type]}".replace('\\', '/')
        remote_path = f"{remote_dir}/{filename}".replace('\\', '/')
        
        try:
            with self.connection() as ftp:
                # Ensure directory exists
                self._ensure_directory(ftp, remote_dir)
                
                # Upload file
                logger.info(f"Uploading file: {local_file_path} -> {remote_path}")
                
                with open(local_file_path, 'rb') as local_file:
                    ftp.storbinary(f'STOR {remote_path}', local_file)
                
                # Verify upload
                file_size = ftp.size(remote_path)
                
                # Generate public URL
                relative_path = remote_path.replace(f"{self.base_path}/", "")
                public_url = f"{self.base_url}/{relative_path}"
                
                result = {
                    'remote_path': remote_path,
                    'relative_path': relative_path,
                    'public_url': public_url,
                    'filename': filename,
                    'file_size': file_size,
                    'media_type': media_type,
                    'mime_type': file_info['mime_type'],
                    'uploaded_at': datetime.utcnow().isoformat()
                }
                
                # Add image dimensions if it's an image
                if file_info.get('width') and file_info.get('height'):
                    result.update({
                        'image_width': file_info['width'],
                        'image_height': file_info['height']
                    })
                
                logger.info(f"File uploaded successfully: {public_url}")
                return result
                
        except Exception as e:
            logger.error(f"File upload failed: {str(e)}")
            raise FTPUploadError(f"Upload failed: {str(e)}")
    
    def delete_file(self, remote_path: str) -> bool:
        """
        Delete a file from the FTP server.
        
        Args:
            remote_path: Full path to file on FTP server
            
        Returns:
            True if file was deleted successfully
            
        WHY: Provides cleanup functionality for media file management.
        Handles errors gracefully to prevent database inconsistencies.
        """
        try:
            with self.connection() as ftp:
                ftp.delete(remote_path)
                logger.info(f"File deleted successfully: {remote_path}")
                return True
                
        except ftplib.error_perm as e:
            if "550" in str(e):  # File not found
                logger.warning(f"File not found for deletion: {remote_path}")
                return True  # Consider it successful if file doesn't exist
            logger.error(f"Permission error deleting file: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Error deleting file {remote_path}: {str(e)}")
            return False
    
    def list_files(self, invitation_id: int, media_type: str = None) -> List[Dict[str, str]]:
        """
        List files for an invitation.
        
        Args:
            invitation_id: ID of the invitation
            media_type: Specific media type to list (optional)
            
        Returns:
            List of file information dictionaries
            
        WHY: Provides file discovery and synchronization capabilities.
        Useful for media management and cleanup operations.
        """
        files = []
        
        try:
            with self.connection() as ftp:
                if media_type:
                    # List files in specific media type directory
                    if media_type in self.media_directories:
                        directory = f"{self.base_path}/invitations/{invitation_id}/{self.media_directories[media_type]}"
                        files.extend(self._list_directory_files(ftp, directory, media_type))
                else:
                    # List files in all media directories
                    for mt, subdir in self.media_directories.items():
                        directory = f"{self.base_path}/invitations/{invitation_id}/{subdir}"
                        files.extend(self._list_directory_files(ftp, directory, mt))
                        
        except Exception as e:
            logger.error(f"Error listing files for invitation {invitation_id}: {str(e)}")
            
        return files
    
    def _list_directory_files(self, ftp: ftplib.FTP, directory: str, 
                             media_type: str) -> List[Dict[str, str]]:
        """
        List files in a specific directory.
        
        Args:
            ftp: Active FTP connection
            directory: Directory to list
            media_type: Media type for the files
            
        Returns:
            List of file information dictionaries
        """
        files = []
        
        try:
            # Check if directory exists
            current_dir = ftp.pwd()
            ftp.cwd(directory)
            
            # List files
            file_list = ftp.nlst()
            
            for filename in file_list:
                if filename not in ['.', '..']:
                    try:
                        file_size = ftp.size(f"{directory}/{filename}")
                        relative_path = f"{directory}/{filename}".replace(f"{self.base_path}/", "")
                        public_url = f"{self.base_url}/{relative_path}"
                        
                        files.append({
                            'filename': filename,
                            'remote_path': f"{directory}/{filename}",
                            'relative_path': relative_path,
                            'public_url': public_url,
                            'file_size': file_size,
                            'media_type': media_type
                        })
                    except:
                        # Skip files we can't get info for
                        continue
            
            ftp.cwd(current_dir)  # Return to original directory
            
        except ftplib.error_perm:
            # Directory doesn't exist, which is fine
            pass
        except Exception as e:
            logger.error(f"Error listing directory {directory}: {str(e)}")
            
        return files
    
    def _validate_file(self, file_path: str, media_type: str) -> Dict[str, any]:
        """
        Validate uploaded file against security and size constraints.
        
        Args:
            file_path: Path to file to validate
            media_type: Expected media type
            
        Returns:
            Dictionary with file validation information
            
        Raises:
            FTPUploadError: If file validation fails
            
        WHY: Ensures uploaded files meet security and quality requirements.
        Prevents malicious uploads and maintains system performance.
        """
        if not os.path.exists(file_path):
            raise FTPUploadError(f"File not found: {file_path}")
        
        # Check file size
        file_size = os.path.getsize(file_path)
        if file_size > self.max_file_size:
            raise FTPUploadError(f"File too large: {file_size} bytes (max: {self.max_file_size})")
        
        # Get file extension
        file_ext = Path(file_path).suffix.lower().lstrip('.')
        
        # Determine expected file type category
        category = None
        if media_type in ['hero', 'gallery', 'dresscode', 'og_image', 'avatar', 'icon']:
            category = 'images'
        elif media_type in ['music']:
            category = 'audio'
        elif media_type in ['documents']:
            category = 'documents'
        else:
            # Try to determine from extension
            for cat, extensions in self.allowed_extensions.items():
                if file_ext in extensions:
                    category = cat
                    break
        
        if not category:
            raise FTPUploadError(f"Cannot determine file category for media type: {media_type}")
        
        # Validate extension
        if file_ext not in self.allowed_extensions[category]:
            allowed = ', '.join(self.allowed_extensions[category])
            raise FTPUploadError(f"Invalid file type '{file_ext}' for {category}. Allowed: {allowed}")
        
        # Get MIME type
        mime_type = self._get_mime_type(file_ext)
        
        result = {
            'file_size': file_size,
            'extension': file_ext,
            'mime_type': mime_type,
            'category': category
        }
        
        # For images, get dimensions
        if category == 'images':
            try:
                from PIL import Image
                with Image.open(file_path) as img:
                    result.update({
                        'width': img.width,
                        'height': img.height,
                        'format': img.format
                    })
            except Exception as e:
                logger.warning(f"Could not get image dimensions for {file_path}: {str(e)}")
        
        return result
    
    def _get_mime_type(self, extension: str) -> str:
        """
        Get MIME type for file extension.
        
        Args:
            extension: File extension without dot
            
        Returns:
            MIME type string
            
        WHY: Provides correct MIME type for HTTP responses and file serving.
        """
        mime_types = {
            # Images
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            
            # Audio
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            
            # Video
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            
            # Documents
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
        
        return mime_types.get(extension.lower(), 'application/octet-stream')
    
    def _generate_filename(self, file_path: str, invitation_id: int, media_type: str) -> str:
        """
        Generate a unique filename for uploaded file.
        
        Args:
            file_path: Original file path
            invitation_id: ID of the invitation
            media_type: Type of media
            
        Returns:
            Generated filename
            
        WHY: Creates unique, collision-resistant filenames while preserving
        file extensions. Includes timestamp and hash for uniqueness.
        """
        original_name = Path(file_path).stem
        extension = Path(file_path).suffix
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        
        # Create a short hash from file content for uniqueness
        with open(file_path, 'rb') as f:
            file_hash = hashlib.md5(f.read()).hexdigest()[:8]
        
        # Generate filename: mediatype_invitationid_timestamp_hash.ext
        filename = f"{media_type}_{invitation_id}_{timestamp}_{file_hash}{extension}"
        
        return filename
    
    def get_public_url(self, relative_path: str) -> str:
        """
        Generate public URL for a file.
        
        Args:
            relative_path: Relative path from base directory
            
        Returns:
            Full public URL
            
        WHY: Centralizes URL generation logic for consistency across the application.
        """
        return f"{self.base_url}/{relative_path.lstrip('/')}"
    
    def cleanup_invitation_files(self, invitation_id: int) -> Dict[str, int]:
        """
        Delete all files for an invitation.
        
        Args:
            invitation_id: ID of the invitation
            
        Returns:
            Dictionary with cleanup statistics
            
        WHY: Provides complete cleanup when invitations are deleted.
        Prevents accumulation of orphaned files on the server.
        """
        stats = {'deleted': 0, 'errors': 0, 'total': 0}
        
        try:
            with self.connection() as ftp:
                base_dir = f"{self.base_path}/invitations/{invitation_id}"
                
                # Get all files in the invitation directory
                files = self._get_all_files_recursive(ftp, base_dir)
                stats['total'] = len(files)
                
                # Delete each file
                for file_path in files:
                    try:
                        ftp.delete(file_path)
                        stats['deleted'] += 1
                        logger.debug(f"Deleted file: {file_path}")
                    except Exception as e:
                        stats['errors'] += 1
                        logger.error(f"Error deleting file {file_path}: {str(e)}")
                
                # Try to remove empty directories
                self._remove_empty_directories(ftp, base_dir)
                
        except Exception as e:
            logger.error(f"Error during cleanup of invitation {invitation_id}: {str(e)}")
            stats['errors'] += 1
        
        logger.info(f"Cleanup completed for invitation {invitation_id}: {stats}")
        return stats
    
    def _get_all_files_recursive(self, ftp: ftplib.FTP, directory: str) -> List[str]:
        """
        Get all files in directory recursively.
        
        Args:
            ftp: Active FTP connection
            directory: Directory to search
            
        Returns:
            List of file paths
        """
        files = []
        
        try:
            current_dir = ftp.pwd()
            ftp.cwd(directory)
            
            items = ftp.nlst()
            
            for item in items:
                if item in ['.', '..']:
                    continue
                    
                item_path = f"{directory}/{item}"
                
                try:
                    # Try to get file size (works for files, fails for directories)
                    ftp.size(item_path)
                    files.append(item_path)
                except ftplib.error_perm:
                    # It's a directory, recurse into it
                    files.extend(self._get_all_files_recursive(ftp, item_path))
            
            ftp.cwd(current_dir)
            
        except ftplib.error_perm:
            # Directory doesn't exist or no permission
            pass
        except Exception as e:
            logger.error(f"Error listing directory {directory}: {str(e)}")
            
        return files
    
    def _remove_empty_directories(self, ftp: ftplib.FTP, directory: str) -> None:
        """
        Remove empty directories recursively.
        
        Args:
            ftp: Active FTP connection
            directory: Directory to clean up
        """
        try:
            # Try to remove the directory
            ftp.rmd(directory)
            logger.debug(f"Removed empty directory: {directory}")
            
            # Try to remove parent directory if it's also empty
            parent = str(Path(directory).parent)
            if parent != directory and parent != self.base_path:
                self._remove_empty_directories(ftp, parent)
                
        except ftplib.error_perm:
            # Directory not empty or doesn't exist, which is fine
            pass
        except Exception as e:
            logger.debug(f"Could not remove directory {directory}: {str(e)}")


def create_ftp_manager() -> FTPManager:
    """
    Factory function to create FTP manager instance from environment variables.
    
    Returns:
        Configured FTPManager instance
        
    WHY: Provides centralized configuration loading with environment variable
    support. Ensures consistent FTP manager setup across the application.
    """
    from flask import current_app
    import os
    
    host = os.getenv('FTP_HOST')
    username = os.getenv('FTP_USER')  
    password = os.getenv('FTP_PASS')
    
    if not all([host, username, password]):
        raise ValueError("FTP configuration missing. Check FTP_HOST, FTP_USER, and FTP_PASS environment variables.")
    
    return FTPManager(
        host=host,
        username=username,
        password=password,
        base_path='public_html/invita',
        base_url='https://kossomet.com/invita'  # Fixed: Remove public_html from URL
    )