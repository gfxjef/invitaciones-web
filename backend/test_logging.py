"""
Test del sistema de logging por sesión

WHY: Verificar que el sistema de logging funciona correctamente
y se reinicia en cada ejecución.

USAGE: python test_logging.py
"""

import os
import sys
import logging
from pathlib import Path

# Agregar el directorio backend al path para imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.session_logger import SessionLogger

def test_logging_system():
    """Prueba el sistema de logging"""

    print("\n" + "=" * 80)
    print("PRUEBA DEL SISTEMA DE LOGGING POR SESIÓN")
    print("=" * 80 + "\n")

    # Crear logger
    log_file = Path(__file__).parent / 'logs' / 'test_session.log'
    session_logger = SessionLogger(log_file=str(log_file), log_level=logging.DEBUG)

    # Obtener diferentes loggers para simular diferentes módulos
    logger_main = SessionLogger.get_logger('test_main')
    logger_api = SessionLogger.get_logger('api.test')
    logger_service = SessionLogger.get_logger('services.test')

    print(f"[OK] Logger creado: {log_file}\n")

    # Probar diferentes niveles de log
    print("[LOGS] Escribiendo logs de prueba...\n")

    logger_main.debug("Este es un mensaje DEBUG - solo visible si nivel es DEBUG")
    logger_main.info("Este es un mensaje INFO - evento normal del sistema")
    logger_main.warning("Este es un mensaje WARNING - advertencia no crítica")
    logger_main.error("Este es un mensaje ERROR - error recuperable")

    # Simular logs de diferentes módulos
    logger_api.info("API endpoint llamado: POST /api/pdf/generate")
    logger_api.info("Usuario autenticado: user_id=7")
    logger_api.debug("Request headers: Authorization: Bearer token...")

    logger_service.info("Iniciando generación de PDF...")
    logger_service.debug("Configuración: device_type=mobile, quality=high")
    logger_service.info("PDF generado exitosamente - Size: 2.5MB, Time: 12.3s")

    # Simular error
    try:
        raise ValueError("Simulación de error para testing")
    except Exception as e:
        logger_service.error(f"Error capturado: {e}")
        logger_service.debug("Stack trace completo:", exc_info=True)

    print("\n" + "=" * 80)
    print("VERIFICACIÓN DEL ARCHIVO DE LOG")
    print("=" * 80 + "\n")

    # Verificar que el archivo fue creado
    if log_file.exists():
        print(f"[OK] Archivo creado: {log_file}")

        # Leer y mostrar contenido
        with open(log_file, 'r', encoding='utf-8') as f:
            content = f.read()
            line_count = content.count('\n')
            print(f"[OK] Lineas escritas: {line_count}")
            print(f"[OK] Tamanio: {len(content)} bytes\n")

            print("[ARCHIVO] Contenido del archivo:\n")
            print("-" * 80)
            print(content)
            print("-" * 80)
    else:
        print(f"[ERROR] Archivo no fue creado: {log_file}")
        return False

    print("\n" + "=" * 80)
    print("PRUEBA COMPLETADA EXITOSAMENTE")
    print("=" * 80 + "\n")

    print("[NOTA] Ejecuta este script nuevamente para verificar que el archivo")
    print("       se sobrescribe (no acumula logs de ejecuciones anteriores)\n")

    return True


if __name__ == '__main__':
    try:
        success = test_logging_system()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n[ERROR] ERROR EN LA PRUEBA: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)