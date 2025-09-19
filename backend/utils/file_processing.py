"""
File Processing Utilities for Invitation Media

This module provides advanced file processing capabilities including image optimization,
thumbnail generation, format conversion, and quality adjustments for invitation media files.

WHY: Centralizes file processing logic with optimized algorithms for web delivery.
Ensures consistent image quality and performance across the invitation system.
"""

import os
import tempfile
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union, Any
from PIL import Image, ImageOps, ImageFilter, ImageEnhance
import io
import base64

logger = logging.getLogger(__name__)


class ImageProcessor:
    """
    Advanced image processing for invitation media files.
    
    Provides comprehensive image optimization, resizing, format conversion,
    and quality enhancement capabilities. Optimized for web delivery and
    responsive design requirements.
    
    WHY: Ensures optimal image quality and performance for web delivery.
    Supports multiple output formats and quality levels for different use cases.
    """
    
    def __init__(self):
        """Initialize image processor with default configurations."""
        
        # Quality settings for different purposes
        self.quality_profiles = {
            'thumbnail': {
                'jpeg_quality': 75,
                'webp_quality': 70,
                'png_optimize': True,
                'progressive': False
            },
            'optimized': {
                'jpeg_quality': 85,
                'webp_quality': 80,
                'png_optimize': True,
                'progressive': True
            },
            'high_quality': {
                'jpeg_quality': 95,
                'webp_quality': 90,
                'png_optimize': True,
                'progressive': True
            }
        }
        
        # Size configurations for different media types
        self.size_configs = {
            'hero': {
                'max_size': (1920, 1080),
                'thumbnails': {
                    'small': (400, 225),
                    'medium': (800, 450),
                    'large': (1200, 675)
                }
            },
            'gallery': {
                'max_size': (1200, 800),
                'thumbnails': {
                    'small': (200, 200),
                    'medium': (400, 400),
                    'large': (600, 600)
                }
            },
            'dresscode': {
                'max_size': (800, 600),
                'thumbnails': {
                    'small': (150, 150),
                    'medium': (300, 300)
                }
            },
            'og_image': {
                'max_size': (1200, 630),  # Optimal for social media
                'thumbnails': {
                    'small': (300, 157),
                    'medium': (600, 315)
                }
            },
            'avatar': {
                'max_size': (400, 400),
                'thumbnails': {
                    'small': (100, 100),
                    'medium': (200, 200)
                }
            },
            'icon': {
                'max_size': (200, 200),
                'thumbnails': {
                    'small': (32, 32),
                    'medium': (64, 64),
                    'large': (128, 128)
                }
            }
        }
        
        # Supported input formats
        self.supported_formats = {
            'JPEG', 'JPG', 'PNG', 'WEBP', 'GIF', 'BMP', 'TIFF'
        }
        
        # Output format mapping
        self.output_formats = {
            'jpeg': 'JPEG',
            'jpg': 'JPEG', 
            'png': 'PNG',
            'webp': 'WEBP'
        }
    
    def process_image_for_media_type(self, input_path: str, media_type: str,
                                   quality_profile: str = 'optimized',
                                   output_format: str = 'jpeg') -> Dict[str, str]:
        """
        Process image optimally for specific media type.
        
        Args:
            input_path: Path to input image
            media_type: Type of media (hero, gallery, etc.)
            quality_profile: Quality profile to use
            output_format: Desired output format
            
        Returns:
            Dictionary with paths to processed images
            
        WHY: Provides media type-specific optimization with appropriate
        sizing and quality settings for different use cases.
        """
        if media_type not in self.size_configs:
            raise ValueError(f"Unsupported media type: {media_type}")
        
        size_config = self.size_configs[media_type]
        results = {}
        
        try:
            with Image.open(input_path) as img:
                # Prepare image (orientation, format conversion)
                img = self._prepare_image(img)
                
                # Generate main optimized image
                main_image_path = self._create_optimized_image(
                    img, size_config['max_size'], quality_profile, output_format
                )
                results['main'] = main_image_path
                
                # Generate thumbnails if configured
                if 'thumbnails' in size_config:
                    thumbnails = {}
                    for size_name, dimensions in size_config['thumbnails'].items():
                        thumbnail_path = self._create_thumbnail(
                            img, dimensions, size_name, 'thumbnail', output_format
                        )
                        thumbnails[size_name] = thumbnail_path
                    results['thumbnails'] = thumbnails
                
                return results
                
        except Exception as e:
            # Cleanup any created files on error
            self._cleanup_files(results)
            logger.error(f"Image processing failed for {input_path}: {str(e)}")
            raise
    
    def optimize_image(self, input_path: str, max_size: Tuple[int, int] = None,
                      quality_profile: str = 'optimized',
                      output_format: str = 'jpeg') -> str:
        """
        Optimize a single image file.
        
        Args:
            input_path: Path to input image
            max_size: Maximum dimensions (width, height)
            quality_profile: Quality profile to use
            output_format: Desired output format
            
        Returns:
            Path to optimized image
            
        WHY: Provides general-purpose image optimization for single files
        with customizable size and quality constraints.
        """
        try:
            with Image.open(input_path) as img:
                img = self._prepare_image(img)
                
                if max_size:
                    return self._create_optimized_image(img, max_size, quality_profile, output_format)
                else:
                    return self._create_optimized_image(img, img.size, quality_profile, output_format)
                    
        except Exception as e:
            logger.error(f"Image optimization failed for {input_path}: {str(e)}")
            raise
    
    def create_thumbnail(self, input_path: str, size: Tuple[int, int],
                        quality_profile: str = 'thumbnail',
                        output_format: str = 'jpeg') -> str:
        """
        Create a single thumbnail from an image.
        
        Args:
            input_path: Path to input image
            size: Thumbnail size (width, height)
            quality_profile: Quality profile to use
            output_format: Desired output format
            
        Returns:
            Path to thumbnail image
            
        WHY: Enables creation of individual thumbnails with specific dimensions
        and quality settings for flexible UI requirements.
        """
        try:
            with Image.open(input_path) as img:
                img = self._prepare_image(img)
                return self._create_thumbnail(img, size, 'custom', quality_profile, output_format)
                
        except Exception as e:
            logger.error(f"Thumbnail creation failed for {input_path}: {str(e)}")
            raise
    
    def create_multiple_thumbnails(self, input_path: str,
                                 sizes: Dict[str, Tuple[int, int]],
                                 quality_profile: str = 'thumbnail',
                                 output_format: str = 'jpeg') -> Dict[str, str]:
        """
        Create multiple thumbnails from a single image.
        
        Args:
            input_path: Path to input image
            sizes: Dictionary mapping size names to dimensions
            quality_profile: Quality profile to use
            output_format: Desired output format
            
        Returns:
            Dictionary mapping size names to thumbnail paths
            
        WHY: Efficient batch thumbnail generation from a single source image.
        Reduces processing time and maintains consistency across sizes.
        """
        thumbnails = {}
        
        try:
            with Image.open(input_path) as img:
                img = self._prepare_image(img)
                
                for size_name, dimensions in sizes.items():
                    thumbnail_path = self._create_thumbnail(
                        img, dimensions, size_name, quality_profile, output_format
                    )
                    thumbnails[size_name] = thumbnail_path
                
                return thumbnails
                
        except Exception as e:
            # Cleanup created thumbnails on error
            self._cleanup_files({'thumbnails': thumbnails})
            logger.error(f"Multiple thumbnail creation failed for {input_path}: {str(e)}")
            raise
    
    def convert_format(self, input_path: str, output_format: str,
                      quality_profile: str = 'optimized') -> str:
        """
        Convert image to a different format.
        
        Args:
            input_path: Path to input image
            output_format: Target format (jpeg, png, webp)
            quality_profile: Quality profile to use
            
        Returns:
            Path to converted image
            
        WHY: Enables format conversion for compatibility and optimization.
        Supports modern formats like WebP for better compression.
        """
        try:
            with Image.open(input_path) as img:
                img = self._prepare_image(img, target_format=output_format)
                
                # Create converted image with same dimensions
                return self._save_image_with_format(img, img.size, quality_profile, output_format)
                
        except Exception as e:
            logger.error(f"Format conversion failed for {input_path}: {str(e)}")
            raise
    
    def enhance_image(self, input_path: str, 
                     brightness: float = 1.0,
                     contrast: float = 1.0, 
                     saturation: float = 1.0,
                     sharpness: float = 1.0) -> str:
        """
        Apply image enhancements.
        
        Args:
            input_path: Path to input image
            brightness: Brightness adjustment (1.0 = no change)
            contrast: Contrast adjustment (1.0 = no change)
            saturation: Saturation adjustment (1.0 = no change)
            sharpness: Sharpness adjustment (1.0 = no change)
            
        Returns:
            Path to enhanced image
            
        WHY: Provides basic image enhancement capabilities for improving
        image quality and visual appeal in invitations.
        """
        try:
            with Image.open(input_path) as img:
                img = self._prepare_image(img)
                
                # Apply enhancements
                if brightness != 1.0:
                    enhancer = ImageEnhance.Brightness(img)
                    img = enhancer.enhance(brightness)
                
                if contrast != 1.0:
                    enhancer = ImageEnhance.Contrast(img)
                    img = enhancer.enhance(contrast)
                
                if saturation != 1.0:
                    enhancer = ImageEnhance.Color(img)
                    img = enhancer.enhance(saturation)
                
                if sharpness != 1.0:
                    enhancer = ImageEnhance.Sharpness(img)
                    img = enhancer.enhance(sharpness)
                
                # Save enhanced image
                return self._save_image_with_format(img, img.size, 'high_quality', 'jpeg')
                
        except Exception as e:
            logger.error(f"Image enhancement failed for {input_path}: {str(e)}")
            raise
    
    def get_image_info(self, input_path: str) -> Dict[str, Any]:
        """
        Get comprehensive information about an image.
        
        Args:
            input_path: Path to image file
            
        Returns:
            Dictionary with image information
            
        WHY: Provides metadata extraction for database storage and
        processing decisions. Enables informed optimization choices.
        """
        try:
            with Image.open(input_path) as img:
                info = {
                    'format': img.format,
                    'mode': img.mode,
                    'size': img.size,
                    'width': img.width,
                    'height': img.height,
                    'aspect_ratio': img.width / img.height,
                    'file_size': os.path.getsize(input_path)
                }
                
                # Add EXIF data if available
                if hasattr(img, '_getexif') and img._getexif():
                    info['has_exif'] = True
                    # Get orientation info
                    exif = img.getexif()
                    if exif and 274 in exif:  # Orientation tag
                        info['orientation'] = exif[274]
                else:
                    info['has_exif'] = False
                
                # Estimate memory usage
                info['estimated_memory_mb'] = (img.width * img.height * len(img.getbands())) / (1024 * 1024)
                
                return info
                
        except Exception as e:
            logger.error(f"Could not get image info for {input_path}: {str(e)}")
            return {}
    
    def _prepare_image(self, img: Image.Image, target_format: str = None) -> Image.Image:
        """
        Prepare image for processing (orientation, format conversion).
        
        Args:
            img: PIL Image object
            target_format: Target format for conversion
            
        Returns:
            Prepared Image object
            
        WHY: Ensures consistent image orientation and format preparation
        before processing operations. Handles EXIF orientation automatically.
        """
        # Apply auto-rotation based on EXIF data
        img = ImageOps.exif_transpose(img)
        
        # Convert image mode based on target format
        if target_format in ['jpeg', 'jpg']:
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create white background for transparent images when converting to JPEG
                background = Image.new('RGB', img.size, 'white')
                if img.mode == 'P':
                    img = img.convert('RGBA')
                if img.mode in ('RGBA', 'LA'):
                    background.paste(img, mask=img.split()[-1])
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
        elif target_format == 'png':
            if img.mode not in ('RGB', 'RGBA'):
                if img.mode in ('LA', 'L'):
                    img = img.convert('RGBA')
                else:
                    img = img.convert('RGB')
        elif target_format == 'webp':
            if img.mode not in ('RGB', 'RGBA'):
                img = img.convert('RGBA' if 'transparency' in img.info else 'RGB')
        else:
            # Default preparation for JPEG
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, 'white')
                if img.mode == 'P':
                    img = img.convert('RGBA')
                if img.mode in ('RGBA', 'LA'):
                    background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
        
        return img
    
    def _create_optimized_image(self, img: Image.Image, max_size: Tuple[int, int],
                              quality_profile: str, output_format: str) -> str:
        """
        Create an optimized version of the image.
        
        Args:
            img: PIL Image object
            max_size: Maximum dimensions
            quality_profile: Quality profile to use
            output_format: Output format
            
        Returns:
            Path to optimized image
        """
        # Resize if necessary while maintaining aspect ratio
        if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
            img = img.copy()
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        return self._save_image_with_format(img, img.size, quality_profile, output_format)
    
    def _create_thumbnail(self, img: Image.Image, size: Tuple[int, int],
                         size_name: str, quality_profile: str, output_format: str) -> str:
        """
        Create a thumbnail from an image.
        
        Args:
            img: PIL Image object
            size: Thumbnail dimensions
            size_name: Name of the size (for filename)
            quality_profile: Quality profile to use
            output_format: Output format
            
        Returns:
            Path to thumbnail image
        """
        # Create thumbnail maintaining aspect ratio
        thumb_img = img.copy()
        
        # Calculate dimensions to maintain aspect ratio
        img_ratio = img.width / img.height
        thumb_ratio = size[0] / size[1]
        
        if img_ratio > thumb_ratio:
            # Image is wider, fit to height
            new_height = size[1]
            new_width = int(new_height * img_ratio)
        else:
            # Image is taller, fit to width
            new_width = size[0]
            new_height = int(new_width / img_ratio)
        
        # Resize and crop to exact dimensions
        thumb_img = thumb_img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Center crop if necessary
        if new_width > size[0] or new_height > size[1]:
            left = (new_width - size[0]) // 2
            top = (new_height - size[1]) // 2
            right = left + size[0]
            bottom = top + size[1]
            thumb_img = thumb_img.crop((left, top, right, bottom))
        
        # Save thumbnail
        return self._save_image_with_format(thumb_img, size, quality_profile, output_format, f'thumb_{size_name}')
    
    def _save_image_with_format(self, img: Image.Image, size: Tuple[int, int],
                              quality_profile: str, output_format: str,
                              prefix: str = 'processed') -> str:
        """
        Save image with specific format and quality settings.
        
        Args:
            img: PIL Image object
            size: Image size for filename
            quality_profile: Quality profile to use
            output_format: Output format
            prefix: Filename prefix
            
        Returns:
            Path to saved image
        """
        # Get quality settings
        quality_settings = self.quality_profiles.get(quality_profile, self.quality_profiles['optimized'])
        
        # Determine file extension
        ext_map = {'jpeg': '.jpg', 'jpg': '.jpg', 'png': '.png', 'webp': '.webp'}
        file_ext = ext_map.get(output_format.lower(), '.jpg')
        
        # Create temporary file
        temp_fd, temp_path = tempfile.mkstemp(suffix=file_ext, prefix=f'{prefix}_')
        
        try:
            pil_format = self.output_formats.get(output_format.lower(), 'JPEG')
            
            with os.fdopen(temp_fd, 'wb') as f:
                if pil_format == 'JPEG':
                    img.save(f, pil_format,
                            quality=quality_settings['jpeg_quality'],
                            optimize=True,
                            progressive=quality_settings['progressive'])
                elif pil_format == 'PNG':
                    img.save(f, pil_format,
                            optimize=quality_settings['png_optimize'])
                elif pil_format == 'WEBP':
                    img.save(f, pil_format,
                            quality=quality_settings['webp_quality'],
                            optimize=True)
                else:
                    img.save(f, pil_format)
            
            return temp_path
            
        except Exception as e:
            # Cleanup temp file on error
            try:
                os.unlink(temp_path)
            except:
                pass
            raise
    
    def _cleanup_files(self, file_dict: Dict[str, Union[str, Dict[str, str]]]) -> None:
        """
        Clean up temporary files created during processing.
        
        Args:
            file_dict: Dictionary containing file paths to cleanup
        """
        def cleanup_path(path):
            if path and os.path.exists(path):
                try:
                    os.unlink(path)
                except Exception as e:
                    logger.warning(f"Could not delete temp file {path}: {str(e)}")
        
        for key, value in file_dict.items():
            if isinstance(value, str):
                cleanup_path(value)
            elif isinstance(value, dict):
                for sub_path in value.values():
                    cleanup_path(sub_path)


class FileUtilities:
    """
    Utility functions for general file operations.
    
    Provides common file manipulation, validation, and metadata
    extraction capabilities used across the file processing system.
    
    WHY: Centralizes common file operations to ensure consistency
    and reusability across different file processing workflows.
    """
    
    @staticmethod
    def validate_file_size(file_path: str, max_size_mb: float = 5.0) -> bool:
        """
        Validate file size against maximum limit.
        
        Args:
            file_path: Path to file
            max_size_mb: Maximum size in megabytes
            
        Returns:
            True if file size is acceptable
        """
        try:
            file_size = os.path.getsize(file_path)
            max_bytes = max_size_mb * 1024 * 1024
            return file_size <= max_bytes
        except:
            return False
    
    @staticmethod
    def get_file_extension(filename: str) -> str:
        """
        Get file extension in lowercase.
        
        Args:
            filename: Filename or path
            
        Returns:
            File extension without dot (e.g., 'jpg', 'png')
        """
        return Path(filename).suffix.lower().lstrip('.')
    
    @staticmethod
    def is_image_file(filename: str) -> bool:
        """
        Check if file is a supported image format.
        
        Args:
            filename: Filename or path
            
        Returns:
            True if file is a supported image format
        """
        ext = FileUtilities.get_file_extension(filename)
        return ext in {'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'}
    
    @staticmethod
    def is_audio_file(filename: str) -> bool:
        """
        Check if file is a supported audio format.
        
        Args:
            filename: Filename or path
            
        Returns:
            True if file is a supported audio format
        """
        ext = FileUtilities.get_file_extension(filename)
        return ext in {'mp3', 'wav', 'ogg', 'aac', 'm4a'}
    
    @staticmethod
    def create_safe_filename(filename: str, max_length: int = 100) -> str:
        """
        Create a safe filename for filesystem storage.
        
        Args:
            filename: Original filename
            max_length: Maximum filename length
            
        Returns:
            Safe filename suitable for filesystem storage
        """
        # Get base name and extension
        path = Path(filename)
        base_name = path.stem
        extension = path.suffix
        
        # Create safe base name
        safe_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"
        safe_name = "".join(c if c in safe_chars else "_" for c in base_name)
        
        # Remove consecutive underscores
        import re
        safe_name = re.sub(r'_+', '_', safe_name).strip('_')
        
        # Ensure name is not empty
        if not safe_name:
            safe_name = "file"
        
        # Truncate if too long (leaving room for extension)
        max_base_length = max_length - len(extension)
        if len(safe_name) > max_base_length:
            safe_name = safe_name[:max_base_length]
        
        return f"{safe_name}{extension}"
    
    @staticmethod
    def get_mime_type_from_extension(extension: str) -> str:
        """
        Get MIME type from file extension.
        
        Args:
            extension: File extension (with or without dot)
            
        Returns:
            MIME type string
        """
        ext = extension.lower().lstrip('.')
        
        mime_types = {
            # Images
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'bmp': 'image/bmp',
            'tiff': 'image/tiff',
            'svg': 'image/svg+xml',
            
            # Audio
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'aac': 'audio/aac',
            'm4a': 'audio/mp4',
            
            # Documents
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            
            # Archives
            'zip': 'application/zip',
            'tar': 'application/x-tar',
            'gz': 'application/gzip'
        }
        
        return mime_types.get(ext, 'application/octet-stream')


# Global instances for easy access
image_processor = ImageProcessor()
file_utilities = FileUtilities()