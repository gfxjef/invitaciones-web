# Services and Utilities Documentation

## 📋 Overview

El backend incluye una capa de servicios y utilidades que maneja operaciones complejas y funcionalidades transversales del sistema.

## 🗂️ Estructura

```
backend/
├── services/
│   └── file_upload_service.py    # Servicio de upload de archivos
└── utils/
    ├── file_processing.py        # Procesamiento de imágenes
    ├── ftp_manager.py           # Cliente FTP
    ├── logging_config.py        # Configuración de logs
    └── url_utils.py            # Utilidades de URLs
```

---

## 🔧 Services

### File Upload Service
**Archivo**: `services/file_upload_service.py`

Servicio centralizado para manejo de uploads de archivos multimedia.

#### Features
- Validación de tipos de archivo y tamaños
- Procesamiento automático de imágenes (resize, thumbnails)
- Upload FTP a servidor remoto
- Gestión de metadata en base de datos
- Limpieza automática en caso de errores

#### Usage
```python
from services.file_upload_service import FileUploadService

service = FileUploadService()

# Upload single file
media = service.upload_file(
    file=uploaded_file,           # FileStorage object
    invitation_id=123,
    media_type='gallery',
    title='Foto de la pareja',
    description='Tomada en París'
)

# Upload multiple files
media_list = service.upload_multiple(
    files=[file1, file2, file3],
    invitation_id=123,
    media_type='gallery'
)
```

#### Configuration
```python
# Tipos de archivo permitidos
ALLOWED_EXTENSIONS = {
    'image': {'jpg', 'jpeg', 'png', 'gif', 'webp'},
    'video': {'mp4', 'mov', 'avi', 'webm'},
    'audio': {'mp3', 'wav', 'ogg', 'm4a'}
}

# Tamaños máximos (en bytes)
MAX_FILE_SIZES = {
    'image': 10 * 1024 * 1024,  # 10MB
    'video': 100 * 1024 * 1024, # 100MB
    'audio': 50 * 1024 * 1024   # 50MB
}

# Configuraciones de thumbnails
THUMBNAIL_SIZES = {
    'small': (150, 150),
    'medium': (300, 300),
    'large': (800, 600)
}
```

#### Error Handling
```python
from services.file_upload_service import (
    FileValidationError,
    FileProcessingError,
    FTPUploadError
)

try:
    media = service.upload_file(file, invitation_id, 'gallery')
except FileValidationError as e:
    # Archivo inválido (tipo, tamaño, etc.)
    return {'error': 'invalid_file', 'message': str(e)}
except FileProcessingError as e:
    # Error al procesar imagen
    return {'error': 'processing_failed', 'message': str(e)}
except FTPUploadError as e:
    # Error al subir a FTP
    return {'error': 'upload_failed', 'message': str(e)}
```

---

## 🛠️ Utilities

### FTP Manager
**Archivo**: `utils/ftp_manager.py`

Cliente FTP para subir archivos al servidor de medios kossomet.com.

#### Features
- Conexión segura FTPS
- Upload con verificación de integridad
- Retry automático en caso de falla
- Gestión de directorios remotos
- Progress tracking para uploads grandes

#### Configuration
```python
FTP_CONFIG = {
    'host': 'ftp.kossomet.com',
    'port': 21,
    'username': 'marketing@kossomet.com',
    'password': os.getenv('FTP_PASS'),
    'use_tls': True,
    'timeout': 30
}
```

#### Usage
```python
from utils.ftp_manager import FTPManager, create_ftp_manager

# Crear instancia
ftp = create_ftp_manager()

# Upload single file
remote_path = ftp.upload_file(
    local_path='/tmp/image.jpg',
    remote_path='/invitations/123/gallery/image.jpg'
)

# Upload with progress callback
def progress_callback(transferred, total):
    percent = (transferred / total) * 100
    print(f"Progress: {percent:.1f}%")

remote_path = ftp.upload_file(
    local_path='/tmp/video.mp4',
    remote_path='/invitations/123/videos/video.mp4',
    progress_callback=progress_callback
)

# Create directory
ftp.create_directory('/invitations/123/gallery')

# List files
files = ftp.list_files('/invitations/123')

# Delete file
ftp.delete_file('/invitations/123/old_image.jpg')
```

#### Connection Pool
```python
# El FTP Manager incluye pool de conexiones
class FTPConnectionPool:
    def __init__(self, max_connections=5):
        self.pool = Queue(maxsize=max_connections)
        self.max_connections = max_connections

    def get_connection(self):
        # Obtiene conexión del pool o crea nueva

    def return_connection(self, connection):
        # Retorna conexión al pool
```

---

### File Processing
**Archivo**: `utils/file_processing.py`

Utilidades para procesamiento de imágenes y media.

#### Features
- Redimensionamiento automático
- Generación de thumbnails
- Optimización de calidad
- Conversión de formatos
- Extracción de metadata

#### Usage
```python
from utils.file_processing import (
    process_image,
    generate_thumbnail,
    get_image_info,
    optimize_image
)

# Procesar imagen
processed_path = process_image(
    input_path='/tmp/original.jpg',
    output_path='/tmp/processed.jpg',
    max_width=1920,
    max_height=1080,
    quality=85
)

# Generar thumbnail
thumbnail_path = generate_thumbnail(
    input_path='/tmp/image.jpg',
    output_path='/tmp/thumb.jpg',
    size=(300, 300),
    crop=True
)

# Obtener información
info = get_image_info('/tmp/image.jpg')
# Returns: {
#   'width': 1920,
#   'height': 1080,
#   'format': 'JPEG',
#   'mode': 'RGB',
#   'size_bytes': 2048576
# }

# Optimizar imagen
optimized_path = optimize_image(
    input_path='/tmp/image.jpg',
    output_path='/tmp/optimized.jpg',
    quality=80,
    progressive=True
)
```

#### Image Processing Pipeline
```python
class ImageProcessor:
    def process(self, input_file, media_type):
        # 1. Validar formato
        self._validate_format(input_file)

        # 2. Extraer metadata
        metadata = self._extract_metadata(input_file)

        # 3. Redimensionar si es necesario
        if metadata['width'] > MAX_WIDTH:
            input_file = self._resize_image(input_file)

        # 4. Optimizar calidad
        input_file = self._optimize_image(input_file)

        # 5. Generar thumbnails
        thumbnails = self._generate_thumbnails(input_file)

        return {
            'main': input_file,
            'thumbnails': thumbnails,
            'metadata': metadata
        }
```

---

### URL Utils
**Archivo**: `utils/url_utils.py`

Utilidades para manejo de URLs y códigos cortos.

#### Features
- Generación de códigos cortos únicos
- Validación de URLs
- Slugify para URLs amigables
- Generación de códigos QR

#### Usage
```python
from utils.url_utils import (
    generate_short_code,
    slugify,
    validate_url,
    generate_qr_code
)

# Generar código corto
short_code = generate_short_code(length=8)
# Returns: "aB3xY9Zq"

# Crear slug amigable
slug = slugify("Juan y María - Boda 2024")
# Returns: "juan-y-maria-boda-2024"

# Validar URL
is_valid = validate_url("https://example.com/invitation")
# Returns: True

# Generar QR code
qr_code_base64 = generate_qr_code(
    data="https://invitaciones.com/juan-y-maria",
    size=200,
    error_correction='M'
)
```

#### Short Code Configuration
```python
SHORT_CODE_CONFIG = {
    'length': 8,
    'chars': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    'avoid_ambiguous': True,  # Evita 0, O, l, I
    'max_attempts': 10       # Intentos para código único
}
```

---

### Logging Configuration
**Archivo**: `utils/logging_config.py`

Configuración centralizada del sistema de logs.

#### Features
- Múltiples handlers (console, file, rotating)
- Formateo personalizado por ambiente
- Niveles de log configurables
- Filtros para información sensible

#### Configuration
```python
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'detailed': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s - %(pathname)s:%(lineno)d'
        },
        'simple': {
            'format': '%(levelname)s - %(message)s'
        },
        'json': {
            'format': '{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'INFO',
            'formatter': 'simple'
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/app.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
            'formatter': 'detailed'
        }
    },
    'loggers': {
        'app': {
            'level': 'INFO',
            'handlers': ['console', 'file']
        },
        'payments': {
            'level': 'DEBUG',
            'handlers': ['console', 'file']
        },
        'ftp': {
            'level': 'WARNING',
            'handlers': ['file']
        }
    }
}
```

#### Usage
```python
from utils.logging_config import get_logger

# Get logger for specific module
logger = get_logger('payments')

# Log different levels
logger.debug('Payment token generated')
logger.info('Payment processed successfully')
logger.warning('Payment retry attempt')
logger.error('Payment failed', extra={
    'order_id': 123,
    'error_code': 'CARD_DECLINED'
})
logger.critical('Payment system unavailable')
```

#### Sensitive Data Filtering
```python
class SensitiveDataFilter(logging.Filter):
    def filter(self, record):
        # Remove sensitive information from logs
        message = record.getMessage()

        # Filter credit card numbers
        message = re.sub(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',
                        'XXXX-XXXX-XXXX-XXXX', message)

        # Filter passwords
        message = re.sub(r'password["\']?\s*[:=]\s*["\']?[^"\'&\s]+',
                        'password: [FILTERED]', message, flags=re.IGNORECASE)

        record.msg = message
        return True
```

---

## 🔄 Service Integration

### API Layer Integration
```python
# api/invitations.py
@invitations_bp.route('/<int:invitation_id>/media', methods=['POST'])
@jwt_required()
def upload_media(invitation_id):
    try:
        # Usar el servicio de upload
        service = FileUploadService()
        media = service.upload_file(
            file=request.files['file'],
            invitation_id=invitation_id,
            media_type=request.form.get('media_type', 'gallery'),
            title=request.form.get('title'),
            description=request.form.get('description')
        )

        return jsonify({
            'message': 'File uploaded successfully',
            'media': media.to_dict()
        }), 201

    except FileValidationError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f'Upload failed: {e}', extra={
            'invitation_id': invitation_id,
            'filename': request.files['file'].filename
        })
        return jsonify({'error': 'Upload failed'}), 500
```

### Background Tasks
```python
# Para operaciones pesadas como procesamiento de video
from celery import Celery

celery = Celery('invitaciones')

@celery.task
def process_video_async(media_id):
    media = InvitationMedia.query.get(media_id)

    try:
        # Procesar video en background
        processed_path = process_video(media.file_path)

        # Actualizar media record
        media.processed_path = processed_path
        media.status = 'processed'
        db.session.commit()

    except Exception as e:
        media.status = 'failed'
        media.error_message = str(e)
        db.session.commit()

        # Notificar al usuario
        send_notification(media.invitation.user, 'video_processing_failed')
```

## 🔧 Performance Optimizations

### Caching Strategy
```python
from flask_caching import Cache

cache = Cache()

# Cache thumbnails generation
@cache.memoize(timeout=3600)  # 1 hour
def get_thumbnail(image_path, size):
    return generate_thumbnail(image_path, size)

# Cache file metadata
@cache.memoize(timeout=7200)  # 2 hours
def get_file_metadata(file_path):
    return extract_metadata(file_path)
```

### Async Operations
```python
import asyncio
import aiofiles

async def upload_files_concurrent(files, invitation_id):
    """Upload multiple files concurrently"""
    tasks = []

    for file in files:
        task = upload_file_async(file, invitation_id)
        tasks.append(task)

    results = await asyncio.gather(*tasks, return_exceptions=True)

    successful = [r for r in results if not isinstance(r, Exception)]
    failed = [r for r in results if isinstance(r, Exception)]

    return {
        'successful': len(successful),
        'failed': len(failed),
        'results': successful
    }
```

## 🔍 Monitoring and Debugging

### Performance Metrics
```python
import time
from functools import wraps

def measure_time(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()

        duration = end_time - start_time
        logger.info(f'{func.__name__} took {duration:.2f} seconds')

        return result
    return wrapper

@measure_time
def process_large_image(image_path):
    # Function implementation
    pass
```

### Health Checks
```python
def check_ftp_health():
    try:
        ftp = create_ftp_manager()
        ftp.list_files('/')
        return {'status': 'healthy', 'service': 'ftp'}
    except Exception as e:
        return {'status': 'unhealthy', 'service': 'ftp', 'error': str(e)}

def check_file_processing_health():
    try:
        # Test image processing with small test image
        test_image = create_test_image()
        process_image(test_image)
        return {'status': 'healthy', 'service': 'image_processing'}
    except Exception as e:
        return {'status': 'unhealthy', 'service': 'image_processing', 'error': str(e)}
```

## 🛡️ Security Considerations

### File Validation
```python
def secure_filename_validation(filename):
    # Remove path components
    filename = os.path.basename(filename)

    # Check for dangerous extensions
    dangerous_extensions = {'.php', '.exe', '.bat', '.sh', '.py', '.js'}
    if any(filename.lower().endswith(ext) for ext in dangerous_extensions):
        raise FileValidationError('Dangerous file type')

    # Check for null bytes
    if '\x00' in filename:
        raise FileValidationError('Invalid filename')

    return filename
```

### Path Traversal Prevention
```python
def safe_path_join(base_path, *paths):
    """Safely join paths preventing directory traversal"""
    full_path = os.path.join(base_path, *paths)
    full_path = os.path.normpath(full_path)

    if not full_path.startswith(base_path):
        raise SecurityError('Path traversal attempt detected')

    return full_path
```

### Content Type Validation
```python
def validate_file_content(file_storage):
    """Validate file content matches extension"""

    # Read file signature
    file_storage.seek(0)
    signature = file_storage.read(12)
    file_storage.seek(0)

    # Check signatures
    if signature.startswith(b'\xFF\xD8\xFF'):
        return 'image/jpeg'
    elif signature.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'image/png'
    elif signature.startswith(b'GIF8'):
        return 'image/gif'
    else:
        raise FileValidationError('Invalid file content')
```