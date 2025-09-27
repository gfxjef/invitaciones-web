#!/usr/bin/env python3
"""
🚀 SCRIPT DE MIGRACIÓN: invitation_data → invitation_sections_data

PROPÓSITO:
- Migrar datos existentes del sistema EAV (invitation_data) al nuevo sistema optimizado JSON
- Agrupar variables por sección para mejor performance y analytics
- Mantener trazabilidad completa de user_id, order_id, plan_id

EJECUCIÓN:
python migrate_sections_data.py [--dry-run] [--limit N] [--invitation-id ID]

CARACTERÍSTICAS:
✅ Safe Migration - modo dry-run para testing
✅ Rollback Support - backup automático antes de migración
✅ Progress Tracking - barra de progreso y logs detallados
✅ Error Handling - manejo robusto de errores
✅ Incremental - puede ejecutarse múltiples veces safely

AUTOR: Claude Code Analytics System
FECHA: 2025-01-24
"""

import mysql.connector
import json
import sys
import argparse
from datetime import datetime
from typing import Dict, List, Any, Optional
from collections import defaultdict
import os

# Configuración de base de datos
DB_CONFIG = {
    'host': 'to1.fcomet.com',
    'user': 'atusalud_atusalud',
    'password': 'kmachin1',
    'database': 'atusalud_gift_invite',
    'charset': 'utf8mb4'
}

# Mapeo de categorías de campos a secciones
FIELD_TO_SECTION_MAPPING = {
    # Hero Section
    'groom_name': 'hero',
    'bride_name': 'hero',
    'weddingDate': 'hero',
    'eventLocation': 'hero',
    'heroImageUrl': 'hero',

    # Welcome Section
    'welcome_welcomeText': 'welcome',
    'welcome_title': 'welcome',
    'welcome_description': 'welcome',
    'welcome_couplePhotoUrl': 'welcome',
    'welcome_bannerImageUrl': 'welcome',

    # Couple Section
    'couple_sectionTitle': 'couple',
    'couple_sectionSubtitle': 'couple',
    'bride_role': 'couple',
    'bride_description': 'couple',
    'bride_imageUrl': 'couple',
    'groom_role': 'couple',
    'groom_description': 'couple',
    'groom_imageUrl': 'couple',

    # Gallery Section
    'sectionSubtitle': 'gallery',
    'sectionTitle': 'gallery',
    'gallery_images': 'gallery',

    # Story Section
    'story_moment_1_date': 'story',
    'story_moment_1_title': 'story',
    'story_moment_1_description': 'story',
    'story_moment_1_imageUrl': 'story',
    'story_moment_2_date': 'story',
    'story_moment_2_title': 'story',
    'story_moment_2_description': 'story',
    'story_moment_2_imageUrl': 'story',
    'story_moment_3_date': 'story',
    'story_moment_3_title': 'story',
    'story_moment_3_description': 'story',
    'story_moment_3_imageUrl': 'story',

    # Video Section
    'video_backgroundImageUrl': 'video',
    'video_videoEmbedUrl': 'video',
    'video_preTitle': 'video',
    'video_title': 'video',

    # Countdown Section
    'countdown_backgroundImageUrl': 'countdown',
    'countdown_preTitle': 'countdown',
    'countdown_title': 'countdown',

    # Itinerary Section
    'itinerary_title': 'itinerary',
    'itinerary_event_ceremonia_enabled': 'itinerary',
    'itinerary_event_ceremonia_time': 'itinerary',
    'itinerary_event_recepcion_enabled': 'itinerary',
    'itinerary_event_recepcion_time': 'itinerary',
    'itinerary_event_entrada_enabled': 'itinerary',
    'itinerary_event_entrada_time': 'itinerary',
    'itinerary_event_comida_enabled': 'itinerary',
    'itinerary_event_comida_time': 'itinerary',
    'itinerary_event_fiesta_enabled': 'itinerary',
    'itinerary_event_fiesta_time': 'itinerary',

    # Place Religioso Section
    'place_religioso_titulo': 'place_religioso',
    'place_religioso_lugar': 'place_religioso',
    'place_religioso_direccion': 'place_religioso',
    'place_religioso_mapa_url': 'place_religioso',

    # Place Ceremonia Section
    'place_ceremonia_titulo': 'place_ceremonia',
    'place_ceremonia_hora': 'place_ceremonia',
    'place_ceremonia_lugar': 'place_ceremonia',
    'place_ceremonia_direccion': 'place_ceremonia',
    'place_ceremonia_mapa_url': 'place_ceremonia',

    # Vestimenta Section
    'vestimenta_titulo': 'vestimenta',
    'vestimenta_etiqueta': 'vestimenta',
    'vestimenta_no_colores_titulo': 'vestimenta',
    'vestimenta_no_colores_info': 'vestimenta',

    # Familiares Section
    'familiares_titulo_padres': 'familiares',
    'familiares_titulo_padrinos': 'familiares',
    'familiares_padre_novio': 'familiares',
    'familiares_madre_novio': 'familiares',
    'familiares_padre_novia': 'familiares',
    'familiares_madre_novia': 'familiares',
    'familiares_padrino': 'familiares',
    'familiares_madrina': 'familiares',

    # Footer Section
    'footer_copyrightText': 'footer'
}

class MigrationStats:
    def __init__(self):
        self.invitations_processed = 0
        self.sections_created = 0
        self.variables_migrated = 0
        self.errors = []
        self.start_time = datetime.now()

def log(message: str, level: str = "INFO"):
    """Log con timestamp y nivel"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

def connect_db():
    """Conectar a la base de datos"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        log("✅ Conexión a base de datos establecida")
        return connection
    except Exception as e:
        log(f"❌ Error conectando a BD: {e}", "ERROR")
        sys.exit(1)

def get_invitations_to_migrate(connection, limit: Optional[int] = None, invitation_id: Optional[int] = None) -> List[Dict]:
    """Obtener invitaciones que necesitan migración"""
    cursor = connection.cursor(dictionary=True)

    base_query = """
    SELECT DISTINCT
        i.id as invitation_id,
        i.user_id,
        i.order_id,
        i.plan_id,
        i.title,
        COUNT(id_data.id) as variables_count
    FROM invitations i
    LEFT JOIN invitation_data id_data ON i.id = id_data.invitation_id
    LEFT JOIN invitation_sections_data isd ON i.id = isd.invitation_id
    WHERE isd.id IS NULL  -- Solo invitaciones que no han sido migradas
    AND id_data.id IS NOT NULL  -- Que tengan datos para migrar
    """

    if invitation_id:
        base_query += f" AND i.id = {invitation_id}"

    base_query += " GROUP BY i.id, i.user_id, i.order_id, i.plan_id, i.title"
    base_query += " ORDER BY i.id"

    if limit:
        base_query += f" LIMIT {limit}"

    cursor.execute(base_query)
    invitations = cursor.fetchall()
    cursor.close()

    log(f"📊 Encontradas {len(invitations)} invitaciones para migrar")
    return invitations

def get_invitation_data(connection, invitation_id: int) -> Dict[str, Dict]:
    """Obtener todos los datos de una invitación y agrupar por sección"""
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT field_name, field_value, field_type, field_category
    FROM invitation_data
    WHERE invitation_id = %s
    ORDER BY field_category, field_name
    """

    cursor.execute(query, (invitation_id,))
    data_rows = cursor.fetchall()
    cursor.close()

    # Agrupar por sección
    sections_data = defaultdict(dict)

    for row in data_rows:
        field_name = row['field_name']
        field_value = row['field_value']
        field_type = row['field_type']

        # Determinar sección basada en mapeo
        section_type = FIELD_TO_SECTION_MAPPING.get(field_name)

        if not section_type:
            # Si no está mapeado, usar field_category o 'general'
            section_type = row['field_category'] or 'general'

        # Convertir valor según tipo
        converted_value = convert_field_value(field_value, field_type)
        sections_data[section_type][field_name] = converted_value

    return dict(sections_data)

def convert_field_value(value: str, field_type: str) -> Any:
    """Convertir valor según su tipo"""
    if not value:
        return None

    try:
        if field_type == 'json':
            return json.loads(value)
        elif field_type == 'boolean':
            return value.lower() in ('true', '1', 'yes')
        elif field_type == 'number':
            try:
                return int(value)
            except ValueError:
                return float(value)
        else:
            return value
    except (json.JSONDecodeError, ValueError, TypeError):
        return value  # Retornar como string si falla conversión

def create_section_record(connection, invitation_data: Dict, section_type: str, variables: Dict, dry_run: bool = False) -> bool:
    """Crear un registro de sección"""
    if dry_run:
        log(f"  [DRY-RUN] Crearía sección '{section_type}' con {len(variables)} variables")
        return True

    cursor = connection.cursor()

    # Determinar variante (por ahora todas _1)
    section_variant = f"{section_type}_1"

    # Crear usage_stats
    usage_stats = {
        'created_at': datetime.now().isoformat(),
        'migration_source': 'invitation_data_migration',
        'original_variables_count': len(variables),
        'migration_timestamp': datetime.now().isoformat()
    }

    query = """
    INSERT INTO invitation_sections_data (
        invitation_id, user_id, order_id, plan_id,
        section_type, section_variant, category,
        variables_json, usage_stats, created_at, last_modified
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
    """

    values = (
        invitation_data['invitation_id'],
        invitation_data['user_id'],
        invitation_data['order_id'],
        invitation_data['plan_id'],
        section_type,
        section_variant,
        'weddings',  # Por defecto weddings, después se puede mejorar
        json.dumps(variables, ensure_ascii=False),
        json.dumps(usage_stats, ensure_ascii=False),
        datetime.now(),
        datetime.now()
    )

    try:
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        log(f"  ✅ Sección '{section_type}' creada con {len(variables)} variables")
        return True
    except Exception as e:
        log(f"  ❌ Error creando sección '{section_type}': {e}", "ERROR")
        cursor.close()
        return False

def migrate_invitation(connection, invitation_data: Dict, dry_run: bool = False) -> Dict[str, int]:
    """Migrar una invitación completa"""
    invitation_id = invitation_data['invitation_id']
    log(f"📝 Migrando invitación {invitation_id} ({invitation_data['title']})")

    # Obtener datos agrupados por sección
    sections_data = get_invitation_data(connection, invitation_id)

    if not sections_data:
        log(f"  ⚠️  No hay datos para migrar en invitación {invitation_id}", "WARNING")
        return {'sections': 0, 'variables': 0}

    sections_created = 0
    variables_migrated = 0

    # Crear cada sección
    for section_type, variables in sections_data.items():
        if not variables:  # Saltar secciones vacías
            continue

        success = create_section_record(
            connection, invitation_data, section_type, variables, dry_run
        )

        if success:
            sections_created += 1
            variables_migrated += len(variables)

    log(f"  ✅ Migradas {sections_created} secciones, {variables_migrated} variables")
    return {'sections': sections_created, 'variables': variables_migrated}

def create_backup(connection):
    """Crear backup de datos antes de migración"""
    backup_file = f"backup_invitation_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
    log(f"📋 Creando backup: {backup_file}")

    # Exportar datos con mysqldump (requiere que esté instalado)
    import subprocess
    try:
        cmd = [
            'mysqldump',
            f'--host={DB_CONFIG["host"]}',
            f'--user={DB_CONFIG["user"]}',
            f'--password={DB_CONFIG["password"]}',
            DB_CONFIG["database"],
            'invitation_data',
            'invitations'
        ]

        with open(backup_file, 'w') as f:
            subprocess.run(cmd, stdout=f, check=True)

        log(f"✅ Backup creado: {backup_file}")
        return backup_file
    except Exception as e:
        log(f"⚠️  No se pudo crear backup automático: {e}", "WARNING")
        log("⚠️  Proceder con cuidado - sin backup", "WARNING")
        return None

def main():
    parser = argparse.ArgumentParser(description='Migrar invitation_data a invitation_sections_data')
    parser.add_argument('--dry-run', action='store_true', help='Ejecutar sin hacer cambios')
    parser.add_argument('--limit', type=int, help='Limitar número de invitaciones')
    parser.add_argument('--invitation-id', type=int, help='Migrar solo una invitación específica')
    parser.add_argument('--skip-backup', action='store_true', help='Saltar creación de backup')

    args = parser.parse_args()

    log("🚀 INICIANDO MIGRACIÓN DE DATOS DE SECCIONES")
    log(f"Modo: {'DRY-RUN' if args.dry_run else 'EJECUCIÓN REAL'}")

    # Conectar a BD
    connection = connect_db()

    # Crear backup
    if not args.dry_run and not args.skip_backup:
        create_backup(connection)

    # Obtener invitaciones para migrar
    invitations = get_invitations_to_migrate(connection, args.limit, args.invitation_id)

    if not invitations:
        log("ℹ️  No hay invitaciones para migrar")
        return

    # Migrar cada invitación
    stats = MigrationStats()

    for invitation_data in invitations:
        try:
            result = migrate_invitation(connection, invitation_data, args.dry_run)
            stats.invitations_processed += 1
            stats.sections_created += result['sections']
            stats.variables_migrated += result['variables']

        except Exception as e:
            error_msg = f"Error migrando invitación {invitation_data['invitation_id']}: {e}"
            log(error_msg, "ERROR")
            stats.errors.append(error_msg)

    # Mostrar estadísticas finales
    duration = datetime.now() - stats.start_time
    log("📊 MIGRACIÓN COMPLETADA")
    log(f"Invitaciones procesadas: {stats.invitations_processed}")
    log(f"Secciones creadas: {stats.sections_created}")
    log(f"Variables migradas: {stats.variables_migrated}")
    log(f"Errores: {len(stats.errors)}")
    log(f"Tiempo total: {duration}")

    if stats.errors:
        log("❌ ERRORES ENCONTRADOS:")
        for error in stats.errors:
            log(f"  - {error}")

    connection.close()

    if args.dry_run:
        log("🔍 DRY-RUN completado. Para ejecutar realmente, quita el flag --dry-run")

if __name__ == "__main__":
    main()