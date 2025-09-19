"""
Logging Configuration for FTP File Management System

This module provides centralized logging configuration for the file upload and
FTP management system. Ensures consistent logging format, levels, and handlers
across all file processing operations.

WHY: Centralizes logging configuration to provide comprehensive monitoring
and debugging capabilities for file operations, FTP transfers, and error tracking.
"""

import logging
import logging.config
import os
from datetime import datetime
from pathlib import Path


class FTPLogFilter(logging.Filter):
    """
    Custom filter for FTP-related log messages.
    
    Adds context information and filters sensitive data from FTP operations.
    
    WHY: Ensures FTP credentials and sensitive information are not logged
    while maintaining useful debug information for troubleshooting.
    """
    
    def filter(self, record):
        """
        Filter and enhance FTP log records.
        
        Args:
            record: LogRecord to filter/enhance
            
        Returns:
            True if record should be logged
        """
        # Add FTP context if available
        if hasattr(record, 'ftp_operation'):
            record.msg = f"[FTP:{record.ftp_operation}] {record.msg}"
        
        # Filter out FTP credentials from log messages
        if hasattr(record, 'msg') and isinstance(record.msg, str):
            # Remove password patterns
            import re
            record.msg = re.sub(r'password=[^&\s]+', 'password=***', record.msg)
            record.msg = re.sub(r'pass=[^&\s]+', 'pass=***', record.msg)
            record.msg = re.sub(r'#k55d\.202\$INT', '***', record.msg)
        
        return True


class MediaProcessingLogFilter(logging.Filter):
    """
    Custom filter for media processing log messages.
    
    Adds media processing context and performance metrics.
    """
    
    def filter(self, record):
        """Filter and enhance media processing log records."""
        if hasattr(record, 'media_operation'):
            record.msg = f"[MEDIA:{record.media_operation}] {record.msg}"
        
        return True


def setup_logging(log_level: str = 'INFO', log_to_file: bool = True) -> None:
    """
    Setup comprehensive logging configuration for the file management system.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
        log_to_file: Whether to log to file in addition to console
        
    WHY: Provides structured logging with appropriate levels and handlers
    for both development and production environments.
    """
    
    # Create logs directory if it doesn't exist
    log_dir = Path('logs')
    if log_to_file:
        log_dir.mkdir(exist_ok=True)
    
    # Define log format with comprehensive information
    detailed_format = (
        '%(asctime)s - %(name)s - %(levelname)s - '
        '[%(filename)s:%(lineno)d] - %(funcName)s - %(message)s'
    )
    
    simple_format = '%(asctime)s - %(levelname)s - %(message)s'
    
    # Logging configuration dictionary
    config = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'detailed': {
                'format': detailed_format,
                'datefmt': '%Y-%m-%d %H:%M:%S'
            },
            'simple': {
                'format': simple_format,
                'datefmt': '%Y-%m-%d %H:%M:%S'
            }
        },
        'filters': {
            'ftp_filter': {
                '()': FTPLogFilter,
            },
            'media_filter': {
                '()': MediaProcessingLogFilter,
            }
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'level': log_level,
                'formatter': 'simple',
                'stream': 'ext://sys.stdout'
            }
        },
        'loggers': {
            # FTP Manager Logger
            'utils.ftp_manager': {
                'level': log_level,
                'handlers': ['console'],
                'filters': ['ftp_filter'],
                'propagate': False
            },
            # File Upload Service Logger
            'services.file_upload_service': {
                'level': log_level,
                'handlers': ['console'],
                'filters': ['media_filter'],
                'propagate': False
            },
            # File Processing Logger
            'utils.file_processing': {
                'level': log_level,
                'handlers': ['console'],
                'filters': ['media_filter'],
                'propagate': False
            },
            # API Logger
            'api.invitations': {
                'level': log_level,
                'handlers': ['console'],
                'propagate': False
            }
        },
        'root': {
            'level': 'WARNING',
            'handlers': ['console']
        }
    }
    
    # Add file handlers if requested
    if log_to_file:
        # General application log
        config['handlers']['file_general'] = {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': str(log_dir / 'invitations_app.log'),
            'maxBytes': 10 * 1024 * 1024,  # 10MB
            'backupCount': 5,
            'level': log_level,
            'formatter': 'detailed'
        }
        
        # FTP operations log
        config['handlers']['file_ftp'] = {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': str(log_dir / 'ftp_operations.log'),
            'maxBytes': 5 * 1024 * 1024,  # 5MB
            'backupCount': 3,
            'level': 'DEBUG',
            'formatter': 'detailed',
            'filters': ['ftp_filter']
        }
        
        # Media processing log
        config['handlers']['file_media'] = {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': str(log_dir / 'media_processing.log'),
            'maxBytes': 5 * 1024 * 1024,  # 5MB
            'backupCount': 3,
            'level': 'DEBUG',
            'formatter': 'detailed',
            'filters': ['media_filter']
        }
        
        # Error log
        config['handlers']['file_errors'] = {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': str(log_dir / 'errors.log'),
            'maxBytes': 10 * 1024 * 1024,  # 10MB
            'backupCount': 5,
            'level': 'ERROR',
            'formatter': 'detailed'
        }
        
        # Update logger handlers
        for logger_name in config['loggers']:
            config['loggers'][logger_name]['handlers'].extend([
                'file_general', 'file_errors'
            ])
        
        # Add specific handlers
        config['loggers']['utils.ftp_manager']['handlers'].append('file_ftp')
        config['loggers']['services.file_upload_service']['handlers'].append('file_media')
        config['loggers']['utils.file_processing']['handlers'].append('file_media')
    
    # Apply configuration
    logging.config.dictConfig(config)
    
    # Log configuration success
    logger = logging.getLogger(__name__)
    logger.info(f"Logging configured - Level: {log_level}, File logging: {log_to_file}")


def get_logger(name: str, extra_context: dict = None) -> logging.Logger:
    """
    Get a logger with optional extra context.
    
    Args:
        name: Logger name (usually __name__)
        extra_context: Extra context to include in all log messages
        
    Returns:
        Configured logger instance
        
    WHY: Provides consistent logger creation with context information
    for better traceability and debugging.
    """
    logger = logging.getLogger(name)
    
    if extra_context:
        logger = logging.LoggerAdapter(logger, extra_context)
    
    return logger


def log_ftp_operation(operation: str):
    """
    Decorator to log FTP operations with timing and error handling.
    
    Args:
        operation: Name of the FTP operation
        
    WHY: Provides consistent logging for FTP operations with automatic
    timing and error capture for monitoring and debugging.
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger = get_logger(func.__module__)
            start_time = datetime.now()
            
            logger.info(f"Starting FTP operation: {operation}")
            
            try:
                result = func(*args, **kwargs)
                duration = (datetime.now() - start_time).total_seconds()
                logger.info(f"FTP operation completed: {operation} (took {duration:.2f}s)")
                return result
                
            except Exception as e:
                duration = (datetime.now() - start_time).total_seconds()
                logger.error(f"FTP operation failed: {operation} after {duration:.2f}s - {str(e)}")
                raise
                
        wrapper.__name__ = func.__name__
        wrapper.__doc__ = func.__doc__
        return wrapper
    return decorator


def log_media_processing(operation: str):
    """
    Decorator to log media processing operations with timing and metrics.
    
    Args:
        operation: Name of the media processing operation
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger = get_logger(func.__module__)
            start_time = datetime.now()
            
            # Try to extract file info from arguments
            file_info = ""
            if args and hasattr(args[0], 'filename'):
                file_info = f" - File: {args[0].filename}"
            elif 'file_path' in kwargs:
                file_info = f" - Path: {Path(kwargs['file_path']).name}"
            
            logger.info(f"Starting media processing: {operation}{file_info}")
            
            try:
                result = func(*args, **kwargs)
                duration = (datetime.now() - start_time).total_seconds()
                logger.info(f"Media processing completed: {operation} (took {duration:.2f}s){file_info}")
                return result
                
            except Exception as e:
                duration = (datetime.now() - start_time).total_seconds()
                logger.error(f"Media processing failed: {operation} after {duration:.2f}s{file_info} - {str(e)}")
                raise
                
        wrapper.__name__ = func.__name__
        wrapper.__doc__ = func.__doc__
        return wrapper
    return decorator


class PerformanceLogger:
    """
    Context manager for logging performance metrics of operations.
    
    WHY: Provides detailed performance monitoring for file operations
    with memory usage, processing time, and success/failure tracking.
    """
    
    def __init__(self, operation_name: str, logger: logging.Logger = None):
        """
        Initialize performance logger.
        
        Args:
            operation_name: Name of the operation being monitored
            logger: Logger to use (optional)
        """
        self.operation_name = operation_name
        self.logger = logger or get_logger(__name__)
        self.start_time = None
        self.start_memory = None
    
    def __enter__(self):
        """Start performance monitoring."""
        self.start_time = datetime.now()
        
        # Try to get memory usage
        try:
            import psutil
            process = psutil.Process()
            self.start_memory = process.memory_info().rss / 1024 / 1024  # MB
        except:
            self.start_memory = None
        
        self.logger.info(f"Performance monitoring started: {self.operation_name}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """End performance monitoring and log results."""
        duration = (datetime.now() - self.start_time).total_seconds()
        
        # Memory usage
        memory_info = ""
        if self.start_memory:
            try:
                import psutil
                process = psutil.Process()
                end_memory = process.memory_info().rss / 1024 / 1024  # MB
                memory_diff = end_memory - self.start_memory
                memory_info = f", Memory: {end_memory:.1f}MB ({memory_diff:+.1f}MB)"
            except:
                pass
        
        if exc_type:
            self.logger.error(
                f"Performance monitoring completed with error: {self.operation_name} "
                f"- Duration: {duration:.2f}s{memory_info} - Error: {exc_val}"
            )
        else:
            self.logger.info(
                f"Performance monitoring completed: {self.operation_name} "
                f"- Duration: {duration:.2f}s{memory_info}"
            )


def setup_flask_logging(app):
    """
    Setup Flask application logging integration.
    
    Args:
        app: Flask application instance
        
    WHY: Integrates Flask's built-in logging with our custom logging
    configuration for consistent log handling across the application.
    """
    
    # Get log level from environment or default to INFO
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    log_to_file = os.getenv('LOG_TO_FILE', 'true').lower() == 'true'
    
    # Setup logging
    setup_logging(log_level, log_to_file)
    
    # Configure Flask app logger
    app.logger.setLevel(getattr(logging, log_level))
    
    # Add request logging if in debug mode
    if app.debug:
        @app.before_request
        def log_request_info():
            app.logger.debug(f"Request: {request.method} {request.url}")
        
        @app.after_request
        def log_response_info(response):
            app.logger.debug(f"Response: {response.status_code}")
            return response
    
    # Log application startup
    logger = get_logger(__name__)
    logger.info(f"Flask application logging configured - Debug: {app.debug}")
    
    return app


# Initialize logging on module import
if __name__ != '__main__':
    # Auto-setup logging when imported
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    log_to_file = os.getenv('LOG_TO_FILE', 'false').lower() == 'true'  # Default to False for imports
    setup_logging(log_level, log_to_file)