#!/usr/bin/env python3
"""
🎯 SCRIPT DE CREACIÓN DE CLIENTE FICTICIO - WEDDING BÁSICO

PROPÓSITO:
- Crear un cliente ficticio con invitación de boda completa
- Plan Básico con todas las secciones configuradas
- Datos realistas en español para testing

EJECUCIÓN:
python create_test_wedding_client.py

CARACTERÍSTICAS:
✅ Cliente completo con orden y plan
✅ Invitación wedding con 10 secciones
✅ Todas las variables populadas con datos realistas
✅ Listo para analytics y testing

AUTOR: Sistema de Testing
FECHA: 2025-01-24
"""

import mysql.connector
import json
from datetime import datetime, timedelta
import random
import uuid

# Configuración de base de datos
DB_CONFIG = {
    'host': 'to1.fcomet.com',
    'user': 'atusalud_atusalud',
    'password': 'kmachin1',
    'database': 'atusalud_gift_invite',
    'charset': 'utf8mb4'
}

# Datos del cliente ficticio
CLIENTE_DATA = {
    'email': 'maria.garcia@example.com',
    'name': 'María García Rodríguez',
    'phone': '+51 999 888 777',
    'plan_id': 1,  # Plan Básico
    'plan_name': 'Básico'
}

# Datos de la boda ficticia
WEDDING_DATA = {
    'groom_name': 'Eduardo',
    'bride_name': 'María',
    'wedding_date': '2025-08-15T17:00:00',
    'event_location': 'Lima, Perú',
    'title': 'Boda de María y Eduardo'
}

# Configuración de secciones solicitadas
SECTIONS_CONFIG = {
    "hero": "hero_2",
    "welcome": "welcome_2",
    "familiares": "familiares_1",
    "place_religioso": "place_religioso_1",
    "place_ceremonia": "place_ceremonia_1",
    "vestimenta": "vestimenta_1",
    "gallery": "gallery_2",
    "countdown": "countdown_1",
    "itinerary": "itinerary_1",
    "footer": "footer_1"
}

# Variables por sección con datos realistas
SECTIONS_DATA = {
    'hero': {
        'groom_name': 'Eduardo',
        'bride_name': 'María',
        'weddingDate': '2025-08-15T17:00:00',
        'eventLocation': 'Lima, Perú',
        'heroImageUrl': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600',
        'navigationItems': [
            {'href': '#inicio', 'label': 'Inicio'},
            {'href': '#bienvenida', 'label': 'Bienvenida'},
            {'href': '#familia', 'label': 'Nuestras Familias'},
            {'href': '#ceremonia', 'label': 'Ceremonia'},
            {'href': '#recepcion', 'label': 'Recepción'},
            {'href': '#galeria', 'label': 'Galería'},
            {'href': '#itinerario', 'label': 'Itinerario'},
            {'href': '#vestimenta', 'label': 'Vestimenta'},
            {'href': '#confirmacion', 'label': 'Confirmar Asistencia'}
        ]
    },

    'welcome': {
        'welcome_description': 'Con inmensa alegría y emoción, queremos compartir con ustedes este momento tan especial de nuestras vidas. Después de 5 años de amor, risas y aventuras juntos, hemos decidido unir nuestras vidas para siempre. Su presencia en nuestra boda sería el regalo más hermoso que podríamos recibir.'
    },

    'familiares': {
        'familiares_titulo_padres': 'Con la Bendición de Nuestros Padres',
        'familiares_titulo_padrinos': 'y Nuestros Padrinos',
        'familiares_padre_novio': 'ROBERTO MARTÍNEZ LÓPEZ',
        'familiares_madre_novio': 'CARMEN SILVA TORRES',
        'familiares_padre_novia': 'JORGE GARCÍA MENDEZ',
        'familiares_madre_novia': 'ELENA RODRÍGUEZ DÍAZ',
        'familiares_padrino': 'ANDRÉS MARTÍNEZ SILVA',
        'familiares_madrina': 'LUCÍA GARCÍA RODRÍGUEZ'
    },

    'place_religioso': {
        'place_religioso_titulo': 'Los esperamos en nuestra ceremonia religiosa',
        'weddingDate': '2025-08-15T17:00:00',
        'place_religioso_lugar': 'Iglesia San Pedro',
        'place_religioso_direccion': 'Av. Universitaria 1801, San Miguel, Lima',
        'place_religioso_mapa_url': 'https://maps.google.com/?q=Iglesia+San+Pedro+San+Miguel+Lima'
    },

    'place_ceremonia': {
        'place_ceremonia_titulo': 'DESPUÉS DE LA CEREMONIA RELIGIOSA, LOS ESPERAMOS EN',
        'weddingDate': '2025-08-15T17:00:00',
        'place_ceremonia_hora': '19:30',
        'place_ceremonia_lugar': 'Country Club Lima Hotel',
        'place_ceremonia_direccion': 'Av. Los Eucaliptos 590, San Isidro, Lima',
        'place_ceremonia_mapa_url': 'https://maps.google.com/?q=Country+Club+Lima+Hotel'
    },

    'vestimenta': {
        'vestimenta_titulo': 'Código de Vestimenta',
        'vestimenta_etiqueta': 'FORMAL - ELEGANTE',
        'vestimenta_no_colores_titulo': 'COLORES NO PERMITIDOS',
        'vestimenta_no_colores_info': 'BLANCO, MARFIL, BEIGE, CREMA'
    },

    'gallery': {
        'sectionSubtitle': 'Nuestros Momentos',
        'sectionTitle': 'Galería de Amor',
        'gallery_images': [
            {
                'id': 1,
                'url': 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
                'alt': 'Primera cita',
                'category': 'ceremony'
            },
            {
                'id': 2,
                'url': 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
                'alt': 'Compromiso',
                'category': 'party'
            },
            {
                'id': 3,
                'url': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
                'alt': 'Viaje juntos',
                'category': 'ceremony'
            },
            {
                'id': 4,
                'url': 'https://images.unsplash.com/photo-1521543387600-c55e11880589?w=800',
                'alt': 'Momentos felices',
                'category': 'party'
            },
            {
                'id': 5,
                'url': 'https://images.unsplash.com/photo-1606216794079-73f85bbd57d5?w=800',
                'alt': 'Propuesta',
                'category': 'ceremony'
            },
            {
                'id': 6,
                'url': 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800',
                'alt': 'Celebración',
                'category': 'party'
            }
        ]
    },

    'countdown': {
        'weddingDate': '2025-08-15T17:00:00',
        'countdown_backgroundImageUrl': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600',
        'countdown_preTitle': 'EL GRAN DÍA SE ACERCA',
        'countdown_title': 'Faltan solo...'
    },

    'itinerary': {
        'itinerary_title': 'Programa del Día',
        'itinerary_event_ceremonia_enabled': True,
        'itinerary_event_ceremonia_time': '17:00',
        'itinerary_event_recepcion_enabled': True,
        'itinerary_event_recepcion_time': '19:30',
        'itinerary_event_entrada_enabled': True,
        'itinerary_event_entrada_time': '20:00',
        'itinerary_event_comida_enabled': True,
        'itinerary_event_comida_time': '20:30',
        'itinerary_event_fiesta_enabled': True,
        'itinerary_event_fiesta_time': '22:00'
    },

    'footer': {
        'groom_name': 'Eduardo',
        'bride_name': 'María',
        'weddingDate': '2025-08-15T17:00:00',
        'eventLocation': 'Lima, Perú',
        'footer_copyrightText': 'Con amor, María & Eduardo. Todos los derechos reservados.'
    }
}

def log(message: str, level: str = "INFO"):
    """Log con timestamp y nivel"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # Codificar para evitar problemas con emojis en Windows
    try:
        print(f"[{timestamp}] {level}: {message}")
    except UnicodeEncodeError:
        # Fallback sin emojis
        clean_message = message.encode('ascii', 'ignore').decode('ascii')
        print(f"[{timestamp}] {level}: {clean_message}")

def connect_db():
    """Conectar a la base de datos"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        log("✅ Conexión a base de datos establecida")
        return connection
    except Exception as e:
        log(f"❌ Error conectando a BD: {e}", "ERROR")
        return None

def create_user(connection):
    """Crear usuario ficticio"""
    cursor = connection.cursor()

    # Verificar si el usuario ya existe
    cursor.execute("SELECT id FROM users WHERE email = %s", (CLIENTE_DATA['email'],))
    existing = cursor.fetchone()

    if existing:
        log(f"Usuario ya existe con ID: {existing[0]}")
        return existing[0]

    # Crear nuevo usuario con campos correctos
    query = """
    INSERT INTO users (
        email, password_hash, first_name, last_name, phone,
        role, is_active, email_verified, created_at, updated_at
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    # Separar nombre en first y last name
    name_parts = CLIENTE_DATA['name'].split(' ')
    first_name = name_parts[0] if name_parts else 'María'
    last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else 'García'

    values = (
        CLIENTE_DATA['email'],
        'pbkdf2:sha256:260000$test$test',  # Password hash dummy para testing
        first_name,
        last_name,
        CLIENTE_DATA['phone'],
        'CLIENT',
        True,
        True,
        datetime.now(),
        datetime.now()
    )

    cursor.execute(query, values)
    connection.commit()
    user_id = cursor.lastrowid
    cursor.close()

    log(f"Usuario creado con ID: {user_id}")
    return user_id

def create_order(connection, user_id):
    """Crear orden ficticia"""
    cursor = connection.cursor()

    # Generar número de orden único
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

    query = """
    INSERT INTO orders (
        user_id, order_number, subtotal, total, currency,
        status, payment_method, created_at, updated_at, paid_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        user_id,
        order_number,
        290.00,  # Subtotal plan básico
        290.00,  # Total
        'PEN',
        'PAID',
        'card',
        datetime.now(),
        datetime.now(),
        datetime.now()
    )

    cursor.execute(query, values)
    connection.commit()
    order_id = cursor.lastrowid
    cursor.close()

    log(f"Orden creada con ID: {order_id} - Número: {order_number}")
    return order_id

def create_invitation(connection, user_id, order_id):
    """Crear invitación"""
    cursor = connection.cursor()

    unique_url = str(uuid.uuid4())[:8]

    query = """
    INSERT INTO invitations (
        user_id, plan_id, order_id, title, groom_name, bride_name,
        wedding_date, unique_url, template_name, is_active, is_published,
        status, created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    wedding_date = datetime.strptime(WEDDING_DATA['wedding_date'], '%Y-%m-%dT%H:%M:%S')

    values = (
        user_id,
        CLIENTE_DATA['plan_id'],
        order_id,
        WEDDING_DATA['title'],
        WEDDING_DATA['groom_name'],
        WEDDING_DATA['bride_name'],
        wedding_date,
        unique_url,
        'modular_wedding_template',
        True,
        False,
        'draft',
        datetime.now(),
        datetime.now()
    )

    cursor.execute(query, values)
    connection.commit()
    invitation_id = cursor.lastrowid
    cursor.close()

    log(f"✅ Invitación creada con ID: {invitation_id}")
    log(f"   URL única: {unique_url}")
    return invitation_id

def create_sections_data(connection, invitation_id, user_id, order_id):
    """Crear datos de secciones en la nueva tabla optimizada"""
    cursor = connection.cursor()
    sections_created = 0

    for section_type, variables in SECTIONS_DATA.items():
        # Obtener variante de la configuración
        variant = SECTIONS_CONFIG.get(section_type, f"{section_type}_1")

        # Preparar usage_stats
        usage_stats = {
            'created_at': datetime.now().isoformat(),
            'source': 'test_script',
            'test_client': True,
            'sections_config': SECTIONS_CONFIG
        }

        query = """
        INSERT INTO invitation_sections_data (
            invitation_id, user_id, order_id, plan_id,
            section_type, section_variant, category,
            variables_json, usage_stats, created_at, last_modified
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            invitation_id,
            user_id,
            order_id,
            CLIENTE_DATA['plan_id'],
            section_type,
            variant,
            'weddings',
            json.dumps(variables, ensure_ascii=False),
            json.dumps(usage_stats, ensure_ascii=False),
            datetime.now(),
            datetime.now()
        )

        try:
            cursor.execute(query, values)
            sections_created += 1
            log(f"  ✅ Sección '{section_type}' ({variant}) creada con {len(variables)} variables")
        except Exception as e:
            log(f"  ❌ Error creando sección '{section_type}': {e}", "ERROR")

    connection.commit()
    cursor.close()

    log(f"✅ Total de secciones creadas: {sections_created}")
    return sections_created

def create_template_config(connection, invitation_id):
    """Actualizar template con sections_config"""
    cursor = connection.cursor()

    # Crear entrada en templates si no existe
    query_template = """
    INSERT INTO templates (
        name, description, category, template_type, sections_config,
        is_active, created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
        sections_config = VALUES(sections_config),
        updated_at = VALUES(updated_at)
    """

    template_values = (
        'Wedding Test Template',
        'Template de prueba para wedding con plan básico',
        'weddings',
        'modular',
        json.dumps(SECTIONS_CONFIG),
        True,
        datetime.now(),
        datetime.now()
    )

    cursor.execute(query_template, template_values)
    connection.commit()
    cursor.close()

    log("✅ Configuración de template actualizada")

def show_summary(connection, invitation_id):
    """Mostrar resumen de lo creado"""
    cursor = connection.cursor(dictionary=True)

    # Obtener resumen de secciones
    query = """
    SELECT
        section_type,
        section_variant,
        JSON_LENGTH(variables_json) as variables_count
    FROM invitation_sections_data
    WHERE invitation_id = %s
    ORDER BY section_type
    """

    cursor.execute(query, (invitation_id,))
    sections = cursor.fetchall()

    print("\n" + "="*60)
    print("📊 RESUMEN DEL CLIENTE FICTICIO CREADO")
    print("="*60)
    print(f"Cliente: {CLIENTE_DATA['name']}")
    print(f"Email: {CLIENTE_DATA['email']}")
    print(f"Plan: {CLIENTE_DATA['plan_name']} (ID: {CLIENTE_DATA['plan_id']})")
    print(f"Boda: {WEDDING_DATA['bride_name']} & {WEDDING_DATA['groom_name']}")
    print(f"Fecha: {WEDDING_DATA['wedding_date']}")
    print("\n📋 SECCIONES CREADAS:")
    print("-"*40)

    total_variables = 0
    for section in sections:
        print(f"  • {section['section_type']:20} ({section['section_variant']:15}) - {section['variables_count']} variables")
        total_variables += section['variables_count']

    print("-"*40)
    print(f"TOTAL: {len(sections)} secciones, {total_variables} variables")
    print("="*60)

    cursor.close()

def generate_curl_commands(invitation_id, user_id, order_id):
    """Generar comandos CURL alternativos"""
    print("\n" + "="*60)
    print("🔧 COMANDOS CURL ALTERNATIVOS")
    print("="*60)
    print("\n# Para crear una sección individual con CURL:")
    print("# (Ejemplo con sección 'hero')")

    hero_data = {
        "invitation_id": invitation_id,
        "user_id": user_id,
        "order_id": order_id,
        "plan_id": CLIENTE_DATA['plan_id'],
        "section_type": "hero",
        "section_variant": "hero_2",
        "category": "weddings",
        "variables_json": json.dumps(SECTIONS_DATA['hero'])
    }

    curl_command = f'''
curl -X POST http://localhost:5000/api/sections/create \\
  -H "Content-Type: application/json" \\
  -d '{json.dumps(hero_data, indent=2)}'
'''
    print(curl_command)

    print("\n# Para verificar las secciones creadas:")
    print(f"curl http://localhost:5000/api/invitations/{invitation_id}/sections")

def main():
    log("🚀 INICIANDO CREACIÓN DE CLIENTE FICTICIO WEDDING")
    log(f"Plan: {CLIENTE_DATA['plan_name']}")
    log(f"Categoría: Wedding")
    log(f"Secciones a crear: {len(SECTIONS_CONFIG)}")

    # Conectar a BD
    connection = connect_db()
    if not connection:
        return

    try:
        # Crear usuario
        user_id = create_user(connection)

        # Crear orden
        order_id = create_order(connection, user_id)

        # Crear invitación
        invitation_id = create_invitation(connection, user_id, order_id)

        # Crear secciones con datos
        sections_created = create_sections_data(connection, invitation_id, user_id, order_id)

        # Actualizar template config
        create_template_config(connection, invitation_id)

        # Mostrar resumen
        show_summary(connection, invitation_id)

        # Generar comandos CURL
        generate_curl_commands(invitation_id, user_id, order_id)

        log("\n✅ CLIENTE FICTICIO CREADO EXITOSAMENTE")
        log(f"   Invitation ID: {invitation_id}")
        log(f"   User ID: {user_id}")
        log(f"   Order ID: {order_id}")
        log(f"   Secciones: {sections_created}")

    except Exception as e:
        log(f"❌ Error durante la creación: {e}", "ERROR")
        connection.rollback()
    finally:
        connection.close()

if __name__ == "__main__":
    main()