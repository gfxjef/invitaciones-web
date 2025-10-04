# 📊 Sistema de Logging por Sesión - Backend

## ✅ Implementación Completada

Se ha implementado un sistema de logging que se **reinicia automáticamente** en cada sesión del backend, facilitando el debugging y análisis de problemas.

---

## 🎯 Características Principales

### ✅ **Reinicio Automático**
- Cada vez que inicias el backend (`python app.py`), el archivo de log se sobrescribe
- No hay acumulación histórica de logs
- Logs limpios y enfocados en la sesión actual

### ✅ **Dual Output**
- **Archivo**: `backend/logs/session.log` (formato detallado con timestamp, módulo, función)
- **Consola**: Salida simplificada para monitoring en tiempo real

### ✅ **Formato Profesional**
```
2025-09-29 18:49:21 | INFO     | app                            | create_app           | Iniciando configuración de Flask app...
2025-09-29 18:49:21 | INFO     | app                            | create_app           | Conectando a base de datos: localhost:3306/invitaciones_web
2025-09-29 18:49:21 | INFO     | pdf_generation                 | generate_pdf         | PDF generation request from user 7
```

### ✅ **Múltiples Niveles**
- `DEBUG`: Desarrollo detallado
- `INFO`: Eventos normales (default)
- `WARNING`: Advertencias
- `ERROR`: Errores recuperables
- `CRITICAL`: Errores fatales

---

## 📁 Archivos Creados

```
backend/
├── utils/
│   └── session_logger.py          # Sistema de logging por sesión
├── logs/
│   ├── .gitignore                 # Ignora *.log en git
│   ├── README.md                  # Documentación completa
│   └── session.log                # Log principal (se sobrescribe)
├── test_logging.py                # Script de prueba del sistema
└── app.py                         # Integración del logging (modificado)
```

---

## 🚀 Uso Rápido

### 1. Iniciar el Backend
```bash
cd backend
python app.py
```

El archivo `logs/session.log` se creará/sobrescribirá automáticamente.

### 2. Ver Logs en Tiempo Real
```bash
# Windows PowerShell
Get-Content backend/logs/session.log -Wait

# Windows CMD
type backend\logs\session.log

# Git Bash / Linux
tail -f backend/logs/session.log
```

### 3. Usar Logging en tu Código
```python
from utils.session_logger import SessionLogger

# Obtener logger
logger = SessionLogger.get_logger(__name__)

# Escribir logs
logger.info("Evento normal del sistema")
logger.debug("Detalle técnico para debugging")
logger.warning("Advertencia no crítica")
logger.error("Error recuperable")
logger.critical("Error fatal del sistema")
```

---

## 🧪 Prueba del Sistema

```bash
cd backend
python test_logging.py
```

**Resultado esperado:**
```
================================================================================
PRUEBA DEL SISTEMA DE LOGGING POR SESIÓN
================================================================================

[OK] Logger creado: C:\...\backend\logs\test_session.log

[LOGS] Escribiendo logs de prueba...

================================================================================
VERIFICACIÓN DEL ARCHIVO DE LOG
================================================================================

[OK] Archivo creado
[OK] Lineas escritas: 22
[OK] Tamanio: 2793 bytes
```

---

## 🔧 Configuración

### Cambiar Nivel de Logging

**Desarrollo (DEBUG):**
```bash
# .env
FLASK_DEBUG=true
```

**Producción (INFO):**
```bash
# .env
FLASK_DEBUG=false
```

### Personalizar Ubicación del Log

En `app.py`:
```python
session_logger = setup_session_logging(
    app,
    log_file='ruta/personalizada/mi_log.log',
    log_level=logging.DEBUG
)
```

---

## 📊 Ejemplo de Sesión Real

### Inicio del Servidor:
```log
================================================================================
NUEVA SESIÓN DE BACKEND INICIADA
Fecha/Hora: 2025-09-29 18:49:21
Archivo de log: C:\...\backend\logs\session.log
Nivel de logging: INFO
================================================================================
2025-09-29 18:49:21 | INFO | app | create_app | Iniciando configuración de Flask app...
2025-09-29 18:49:21 | INFO | app | create_app | Conectando a base de datos: localhost:3306/invitaciones_web
2025-09-29 18:49:21 | INFO | app | create_app | CORS configurado para orígenes: ['http://localhost:3000']
2025-09-29 18:49:21 | INFO | app | create_app | Inicializando extensiones de Flask...
2025-09-29 18:49:21 | INFO | app | create_app | Extensiones inicializadas correctamente
2025-09-29 18:49:22 | INFO | app | create_app | Tablas de base de datos creadas/verificadas correctamente
2025-09-29 18:49:22 | INFO | app | create_app | Usuario admin ya existe: admin@invitaciones.com
2025-09-29 18:49:22 | INFO | app | create_app | Registrando blueprints...
2025-09-29 18:49:22 | INFO | app | create_app | Todos los blueprints registrados correctamente
2025-09-29 18:49:22 | INFO | app | create_app | Aplicación Flask configurada y lista en modo: development
================================================================================
SERVIDOR FLASK INICIANDO
Host: 0.0.0.0
Puerto: 5000
Modo debug: False
Frontend URL: http://localhost:3000
================================================================================
```

### Durante Operación (Generación de PDF):
```log
2025-09-29 18:50:15 | INFO | pdf_generation | generate_pdf | PDF generation request from user 7
2025-09-29 18:50:15 | INFO | pdf_generation | generate_pdf | 🔍 [PDF API] Received custom_data: 15 fields
2025-09-29 18:50:15 | INFO | pdf_generator | generate_pdf | Generating PDF for http://localhost:3000/invitacion/demo/9
2025-09-29 18:50:18 | INFO | pdf_generator | _navigate_and_wait | 🎯 [PDF Generator] COMPLETE custom_data content:
2025-09-29 18:50:18 | INFO | pdf_generator | _navigate_and_wait |     [groom_name] = Juan Pérez
2025-09-29 18:50:18 | INFO | pdf_generator | _navigate_and_wait |     [bride_name] = María González
2025-09-29 18:50:25 | INFO | pdf_generator | generate_pdf | PDF generated successfully. Size: 2458632 bytes
2025-09-29 18:50:25 | INFO | pdf_generation | generate_pdf | PDF generado exitosamente en 10.23s, Size: 2.34 MB
```

---

## 🎯 Ventajas del Sistema

| Característica | Beneficio |
|---------------|-----------|
| **Reinicio automático** | No acumula logs, siempre limpio |
| **Dual output** | Archivo detallado + Consola en tiempo real |
| **Formato estructurado** | Timestamp, nivel, módulo, función, mensaje |
| **Múltiples niveles** | DEBUG para desarrollo, INFO para producción |
| **Sin configuración** | Funciona out-of-the-box al iniciar Flask |
| **Encoding UTF-8** | Soporte completo para español y caracteres especiales |

---

## ⚠️ Mejores Prácticas

### ✅ **SÍ HACER:**
```python
# Usar logger en lugar de print()
logger.info("Usuario autenticado: user_id=7")

# Nivel apropiado según importancia
logger.debug("Variable value: x=10")  # Solo desarrollo
logger.info("API endpoint called")     # Eventos normales
logger.error("Database connection failed")  # Errores

# Logging de excepciones con stack trace
try:
    result = divide(10, 0)
except Exception as e:
    logger.error("Division failed", exc_info=True)
```

### ❌ **NO HACER:**
```python
# No usar print() en producción
print("User logged in")  # ❌

# No loguear información sensible
logger.info(f"Password: {password}")  # ❌
logger.info(f"JWT Token: {token}")    # ❌

# No usar nivel incorrecto
logger.critical("User clicked button")  # ❌ (no es crítico)
logger.debug("Database crashed")        # ❌ (es ERROR o CRITICAL)
```

---

## 📚 Referencias

- **Implementación**: `backend/utils/session_logger.py`
- **Integración**: `backend/app.py` (líneas 6, 16, 22-33)
- **Documentación**: `backend/logs/README.md`
- **Tests**: `backend/test_logging.py`

---

## 🔍 Troubleshooting

### Problema: El archivo de log no se crea
**Solución**: Verifica que el directorio `backend/logs/` existe
```bash
mkdir -p backend/logs
```

### Problema: No veo mensajes DEBUG
**Solución**: Activa modo DEBUG
```bash
# .env
FLASK_DEBUG=true
```

### Problema: El archivo sigue creciendo
**Solución**: El sistema usa `mode='w'` (sobrescribir), verifica en `session_logger.py` línea 71

---

## ✨ Siguiente Pasos (Opcional)

Si necesitas **historial de logs** en lugar de sobrescritura:

1. Usar `RotatingFileHandler` para rotación por tamaño
2. Usar `TimedRotatingFileHandler` para rotación diaria
3. Implementar compresión de logs antiguos
4. Enviar logs a servicio externo (Sentry, CloudWatch, etc.)

Ejemplo con rotación:
```python
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler(
    'logs/app.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5  # Mantener 5 archivos
)
```

---

## 🎉 Sistema Listo para Producción

El sistema de logging está completamente funcional y listo para usar. Cada inicio del backend generará logs limpios en `backend/logs/session.log`.

**¡Feliz debugging! 🐛🔍**