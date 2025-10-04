"""
Session Logger - Sistema de Logging por Sesión

WHY: Permite tener logs limpios que se reinician cada vez que se inicia el backend,
facilitando el debugging y análisis de problemas sin acumulación histórica.

WHAT: Configura logging con archivo que se sobrescribe en cada inicio del servidor.
"""

import logging
import os
from datetime import datetime
from pathlib import Path


class SessionLogger:
    """
    Logger que se reinicia en cada sesión del servidor
    """

    def __init__(self, log_file: str = None, log_level: int = logging.INFO):
        """
        Inicializa el logger de sesión

        Args:
            log_file: Ruta al archivo de log (default: backend/logs/session.log)
            log_level: Nivel de logging (default: INFO)
        """
        if log_file is None:
            # Crear directorio logs si no existe
            logs_dir = Path(__file__).parent.parent / 'logs'
            logs_dir.mkdir(exist_ok=True)
            log_file = logs_dir / 'session.log'

        self.log_file = Path(log_file)
        self.log_level = log_level
        self._setup_logging()

    def _setup_logging(self):
        """Configura el sistema de logging"""
        # Obtener el logger raíz
        root_logger = logging.getLogger()
        root_logger.setLevel(self.log_level)

        # Limpiar handlers existentes para evitar duplicados
        root_logger.handlers.clear()

        # Crear formato detallado para el archivo
        file_formatter = logging.Formatter(
            fmt='%(asctime)s | %(levelname)-8s | %(name)-30s | %(funcName)-20s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        # Formato simple para consola
        console_formatter = logging.Formatter(
            fmt='%(levelname)-8s | %(name)-20s | %(message)s'
        )

        # Handler para archivo (mode='w' sobrescribe el archivo en cada inicio)
        file_handler = logging.FileHandler(
            self.log_file,
            mode='w',  # 'w' = write mode (sobrescribe), 'a' = append mode (acumula)
            encoding='utf-8'
        )
        file_handler.setLevel(self.log_level)
        file_handler.setFormatter(file_formatter)

        # Handler para consola
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(console_formatter)

        # Agregar handlers al logger raíz
        root_logger.addHandler(file_handler)
        root_logger.addHandler(console_handler)

        # Escribir encabezado de sesión
        self._write_session_header()

    def _write_session_header(self):
        """Escribe el encabezado de la nueva sesión"""
        logger = logging.getLogger(__name__)

        logger.info("=" * 100)
        logger.info(f"NUEVA SESIÓN DE BACKEND INICIADA")
        logger.info(f"Fecha/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Archivo de log: {self.log_file.absolute()}")
        logger.info(f"Nivel de logging: {logging.getLevelName(self.log_level)}")
        logger.info("=" * 100)

    def add_custom_handler(self, handler: logging.Handler):
        """
        Permite agregar handlers personalizados adicionales

        Args:
            handler: Handler de logging personalizado
        """
        root_logger = logging.getLogger()
        root_logger.addHandler(handler)

    @staticmethod
    def get_logger(name: str) -> logging.Logger:
        """
        Obtiene un logger con el nombre especificado

        Args:
            name: Nombre del logger (generalmente __name__)

        Returns:
            Logger configurado
        """
        return logging.getLogger(name)


def setup_session_logging(app, log_file: str = None, log_level: int = logging.INFO):
    """
    Función helper para configurar el logging de sesión en Flask

    Args:
        app: Instancia de Flask app
        log_file: Ruta al archivo de log (opcional)
        log_level: Nivel de logging (opcional)

    Returns:
        SessionLogger instance
    """
    session_logger = SessionLogger(log_file=log_file, log_level=log_level)

    # Configurar el logger de Flask también
    app.logger.setLevel(log_level)

    # Log de configuración de Flask
    logger = logging.getLogger(__name__)
    logger.info(f"Flask app configurada: {app.name}")
    logger.info(f"Modo debug: {app.debug}")
    logger.info(f"Environment: {app.config.get('ENV', 'production')}")

    return session_logger


# Ejemplo de uso en otros módulos:
# from utils.session_logger import SessionLogger
# logger = SessionLogger.get_logger(__name__)
# logger.info("Mi mensaje de log")