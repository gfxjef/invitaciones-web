# 🎯 **EJEMPLOS PRÁCTICOS DE REGISTRO DE SECCIONES**

**Versión:** 1.0.0
**Fecha:** 24 de Enero, 2025
**Complemento:** BUENAS_PRACTICAS_REGISTRO_SECCIONES.md

---

## **🎪 CASOS DE USO REALES**

### **CASO 1: REGISTRO COMPLETO - WEDDING BÁSICO**

```python
def create_complete_wedding_basic():
    """
    Ejemplo completo de registro para boda - Plan Básico
    Incluye todas las validaciones y buenas prácticas
    """

    # DATOS BASE
    invitation_id = 1
    user_id = 14
    order_id = 61
    plan_id = 1  # Plan Básico
    category = "weddings"

    # SECCIONES A CREAR
    sections_to_create = [
        {
            "section_type": "hero",
            "section_variant": "hero_2",
            "variables_json": {
                "groom_name": "Eduardo",
                "bride_name": "María",
                "weddingDate": "2025-08-15T17:00:00",
                "eventLocation": "Lima, Perú",
                "heroImageUrl": "https://cdn.example.com/hero-maria-eduardo.jpg",
                "navigationItems": [
                    {"href": "#inicio", "label": "Inicio"},
                    {"href": "#bienvenida", "label": "Bienvenida"},
                    {"href": "#ceremonia", "label": "Ceremonia"},
                    {"href": "#recepcion", "label": "Recepción"}
                ]
            }
        },
        {
            "section_type": "welcome",
            "section_variant": "welcome_2",
            "variables_json": {
                "welcome_title": "¡Nos Casamos!",
                "welcome_description": "Con inmensa alegría queremos compartir con ustedes este momento tan especial de nuestras vidas. Después de 5 años de amor y aventuras juntos, hemos decidido unir nuestras vidas para siempre."
            }
        },
        {
            "section_type": "countdown",
            "section_variant": "countdown_1",
            "variables_json": {
                "weddingDate": "2025-08-15T17:00:00",
                "countdown_backgroundImageUrl": "https://cdn.example.com/countdown-bg.jpg",
                "countdown_preTitle": "EL GRAN DÍA SE ACERCA",
                "countdown_title": "Faltan solo..."
            }
        }
    ]

    # CREAR CADA SECCIÓN
    for section_data in sections_to_create:
        try:
            # Validar que no existe
            existing = InvitationSectionsData.query.filter_by(
                invitation_id=invitation_id,
                section_type=section_data["section_type"]
            ).first()

            if existing:
                print(f"⚠️ Sección {section_data['section_type']} ya existe - actualizando")
                existing.variables_json = section_data["variables_json"]
                existing.last_modified = datetime.now()
                continue

            # Crear usage_stats
            usage_stats = {
                "created_at": datetime.now().isoformat(),
                "source": "api_bulk_create",
                "plan_type": "basic",
                "initial_variables_count": len(section_data["variables_json"]),
                "category": category
            }

            # Crear sección
            section = InvitationSectionsData(
                invitation_id=invitation_id,
                user_id=user_id,
                order_id=order_id,
                plan_id=plan_id,
                section_type=section_data["section_type"],
                section_variant=section_data["section_variant"],
                category=category,
                variables_json=section_data["variables_json"],
                usage_stats=usage_stats
            )

            db.session.add(section)
            print(f"✅ Sección {section_data['section_type']} creada")

        except Exception as e:
            print(f"❌ Error creando {section_data['section_type']}: {e}")
            db.session.rollback()
            continue

    db.session.commit()
    print("🎉 Registro completo finalizado")
```

### **CASO 2: WEDDING PREMIUM CON FEATURES AVANZADAS**

```python
def create_wedding_premium():
    """
    Ejemplo de registro para boda - Plan Premium
    Incluye features avanzadas y custom colors
    """

    # HERO SECTION CON FEATURES PREMIUM
    hero_premium = InvitationSectionsData(
        invitation_id=2,
        user_id=15,
        order_id=62,
        plan_id=2,  # Plan Premium
        section_type="hero",
        section_variant="hero_3",  # Variante premium
        category="weddings",
        variables_json={
            "groom_name": "Alejandro",
            "bride_name": "Sofía",
            "weddingDate": "2025-09-20T18:00:00",
            "eventLocation": "Cusco, Perú",
            "heroImageUrl": "https://cdn.example.com/hero-sofia-alejandro.jpg",
            # FEATURES PREMIUM
            "custom_colors": {
                "primary": "#8B4513",      # Dorado terroso
                "secondary": "#F5DEB3",    # Trigo
                "accent": "#CD853F"        # Café claro
            },
            "video_background": {
                "enabled": True,
                "video_url": "https://cdn.example.com/background-video.mp4",
                "fallback_image": "https://cdn.example.com/video-fallback.jpg"
            },
            "premium_typography": {
                "font_family": "Playfair Display",
                "font_weight": "400",
                "custom_css": ".hero-title { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }"
            },
            "animated_elements": {
                "entrance_animation": "fadeInUp",
                "duration": 1200,
                "delay": 300
            }
        },
        usage_stats={
            "created_at": datetime.now().isoformat(),
            "source": "premium_designer",
            "plan_type": "premium",
            "premium_features_used": [
                "custom_colors",
                "video_background",
                "premium_typography",
                "animated_elements"
            ],
            "designer_id": 5,
            "design_session_duration": 45,  # minutos
            "revisions_count": 3
        }
    )

    db.session.add(hero_premium)
    db.session.commit()
```

### **CASO 3: KIDS BIRTHDAY PARTY**

```python
def create_kids_birthday():
    """
    Ejemplo de registro para cumpleaños infantil
    Diferentes variables y estructura
    """

    party_sections = [
        {
            "section_type": "party_hero",
            "section_variant": "party_hero_1",
            "variables_json": {
                "childName": "Valentina",
                "age": 6,
                "birthdayDate": "2025-03-15",
                "partyTheme": "Unicornios y Arcoíris",
                "heroImageUrl": "https://cdn.example.com/valentina-unicorn.jpg",
                "backgroundColor": "#FFB6C1",  # Rosa claro
                "decorative_elements": [
                    {"type": "stars", "color": "#FFD700"},
                    {"type": "hearts", "color": "#FF69B4"},
                    {"type": "rainbows", "animation": "floating"}
                ]
            }
        },
        {
            "section_type": "party_games",
            "section_variant": "party_games_1",
            "variables_json": {
                "games_title": "¡Diversión Asegurada!",
                "game1_name": "Búsqueda del Tesoro de Unicornios",
                "game1_description": "Encuentra todos los cuernos dorados escondidos",
                "game1_duration": "20 minutos",
                "game2_name": "Pin the Horn on the Unicorn",
                "game2_description": "Versión mágica del juego clásico",
                "game2_duration": "15 minutos",
                "game3_name": "Arcoíris Musical",
                "game3_description": "Baila cuando suene la música mágica",
                "game3_duration": "25 minutos",
                "prize_info": "Todos los niños recibirán un pequeño unicornio de peluche"
            }
        },
        {
            "section_type": "party_info",
            "section_variant": "party_info_1",
            "variables_json": {
                "partyDate": "2025-03-15",
                "partyTime": "15:00",
                "partyEndTime": "18:00",
                "partyAddress": "Jr. Los Jardines 123, San Miguel, Lima",
                "partyVenue": "Salón de Fiestas Arcoíris",
                "contact_phone": "+51 999 123 456",
                "contact_whatsapp": "51999123456",
                "dress_code": "¡Vengan vestidos de colores!",
                "bring_info": "Solo traigan muchas ganas de divertirse",
                "rsvp_info": "Confirmar asistencia hasta el 10 de marzo"
            }
        }
    ]

    for section_data in party_sections:
        section = InvitationSectionsData(
            invitation_id=3,
            user_id=16,
            order_id=None,  # Invitación gratuita
            plan_id=1,      # Plan básico
            section_type=section_data["section_type"],
            section_variant=section_data["section_variant"],
            category="kids",  # Categoría diferente
            variables_json=section_data["variables_json"],
            usage_stats={
                "created_at": datetime.now().isoformat(),
                "source": "kids_template_wizard",
                "theme": "unicorns_rainbow",
                "age_group": "6-8",
                "party_size": "medium"  # 10-20 niños
            }
        )

        db.session.add(section)

    db.session.commit()
```

---

## **🔄 CASOS DE ACTUALIZACIÓN**

### **ACTUALIZACIÓN INCREMENTAL**

```python
def update_section_incrementally(section_id, field_updates):
    """
    Actualizar solo campos específicos sin sobreescribir todo
    """

    section = InvitationSectionsData.query.get(section_id)
    if not section:
        raise ValueError(f"Section {section_id} no encontrada")

    # Backup de variables actuales
    current_variables = section.variables_json.copy()

    # Aplicar updates
    for field_name, new_value in field_updates.items():
        current_variables[field_name] = new_value

    # Actualizar con tracking
    section.variables_json = current_variables

    # Actualizar usage_stats
    if section.usage_stats:
        section.usage_stats['last_edited'] = datetime.now().isoformat()
        section.usage_stats['edit_count'] = section.usage_stats.get('edit_count', 0) + 1
        section.usage_stats['fields_updated'] = list(field_updates.keys())

    section.last_modified = datetime.now()
    db.session.commit()

    return section

# EJEMPLO DE USO
update_section_incrementally(1, {
    "bride_name": "María Elena",  # Cambio de nombre
    "heroImageUrl": "https://new-image.jpg"  # Nueva imagen
})
```

### **MIGRACIÓN DE DATOS LEGACY**

```python
def migrate_from_invitation_data(invitation_id):
    """
    Migrar datos del sistema EAV legacy al nuevo sistema
    """

    # Obtener datos legacy
    legacy_data = db.session.query(InvitationData).filter_by(
        invitation_id=invitation_id
    ).all()

    # Agrupar por categoría/sección
    sections_data = {}
    for item in legacy_data:
        section_type = determine_section_from_field(item.field_name)
        if section_type not in sections_data:
            sections_data[section_type] = {}

        # Convertir valor según tipo
        sections_data[section_type][item.field_name] = convert_value(
            item.field_value, item.field_type
        )

    # Crear secciones en nuevo sistema
    invitation = Invitation.query.get(invitation_id)
    for section_type, variables in sections_data.items():
        section = InvitationSectionsData(
            invitation_id=invitation_id,
            user_id=invitation.user_id,
            order_id=invitation.order_id,
            plan_id=invitation.plan_id,
            section_type=section_type,
            section_variant=f"{section_type}_1",
            category="weddings",  # Asumir wedding por defecto
            variables_json=variables,
            usage_stats={
                "created_at": datetime.now().isoformat(),
                "source": "migration_from_eav",
                "legacy_field_count": len(variables),
                "migration_date": datetime.now().isoformat()
            }
        )

        db.session.add(section)

    db.session.commit()
    print(f"✅ Migración completada: {len(sections_data)} secciones creadas")
```

---

## **📊 CASOS DE ANALYTICS**

### **ANÁLISIS DE USO POR PLAN**

```python
def analyze_usage_by_plan():
    """
    Ejemplo de query para analytics de uso por plan
    """

    query = db.session.query(
        Plan.name.label('plan_name'),
        InvitationSectionsData.section_type,
        func.count(InvitationSectionsData.id).label('usage_count'),
        func.avg(InvitationSectionsData.variables_count).label('avg_complexity'),
        func.count(InvitationSectionsData.user_id.distinct()).label('unique_users')
    ).join(
        Plan, InvitationSectionsData.plan_id == Plan.id
    ).filter(
        InvitationSectionsData.created_at >= datetime.now() - timedelta(days=30)
    ).group_by(
        Plan.name, InvitationSectionsData.section_type
    ).order_by(
        'usage_count desc'
    ).all()

    # Procesar resultados
    analytics_data = {}
    for row in query:
        plan_name = row.plan_name
        if plan_name not in analytics_data:
            analytics_data[plan_name] = {}

        analytics_data[plan_name][row.section_type] = {
            'usage_count': row.usage_count,
            'avg_complexity': round(float(row.avg_complexity), 2),
            'unique_users': row.unique_users,
            'popularity_score': row.usage_count / row.unique_users
        }

    return analytics_data

# EJEMPLO DE RESULTADO
{
    "Básico": {
        "hero": {"usage_count": 45, "avg_complexity": 6.2, "unique_users": 40},
        "welcome": {"usage_count": 38, "avg_complexity": 2.1, "unique_users": 35}
    },
    "Premium": {
        "hero": {"usage_count": 23, "avg_complexity": 12.5, "unique_users": 20},
        "gallery": {"usage_count": 22, "avg_complexity": 8.9, "unique_users": 19}
    }
}
```

### **IDENTIFICAR CANDIDATOS A UPSELLING**

```python
def find_upselling_candidates():
    """
    Encontrar usuarios básicos con alta complejidad
    Potenciales candidatos para upgrade a Premium
    """

    # Usuarios básicos con muchas variables
    high_complexity_basic = db.session.query(
        InvitationSectionsData.user_id,
        func.avg(InvitationSectionsData.variables_count).label('avg_complexity'),
        func.count(InvitationSectionsData.id).label('sections_count'),
        User.email,
        User.first_name,
        User.last_name
    ).join(
        User, InvitationSectionsData.user_id == User.id
    ).filter(
        InvitationSectionsData.plan_id == 1  # Plan básico
    ).group_by(
        InvitationSectionsData.user_id
    ).having(
        func.avg(InvitationSectionsData.variables_count) > 8  # Alta complejidad
    ).order_by(
        'avg_complexity desc'
    ).all()

    # Procesar para marketing
    candidates = []
    for user in high_complexity_basic:
        # Verificar si usa features que justifican premium
        premium_indicators = db.session.query(InvitationSectionsData).filter(
            InvitationSectionsData.user_id == user.user_id,
            InvitationSectionsData.variables_json.contains('"custom_colors"')
        ).count()

        candidates.append({
            'user_id': user.user_id,
            'email': user.email,
            'name': f"{user.first_name} {user.last_name}",
            'avg_complexity': round(float(user.avg_complexity), 2),
            'sections_count': user.sections_count,
            'premium_indicators': premium_indicators,
            'upselling_score': user.avg_complexity * user.sections_count + premium_indicators
        })

    return sorted(candidates, key=lambda x: x['upselling_score'], reverse=True)
```

---

## **🚨 MANEJO DE ERRORES EN PRODUCCIÓN**

### **VALIDACIÓN ROBUSTA**

```python
class SectionValidationError(Exception):
    """Custom exception para errores de validación de secciones"""
    pass

def create_section_with_full_validation(section_data):
    """
    Crear sección con validación completa y manejo de errores
    """

    try:
        # 1. Validar estructura de datos
        required_fields = ['invitation_id', 'user_id', 'plan_id',
                          'section_type', 'section_variant', 'variables_json']

        for field in required_fields:
            if field not in section_data or section_data[field] is None:
                raise SectionValidationError(f"Campo requerido faltante: {field}")

        # 2. Validar tipos de datos
        if not isinstance(section_data['variables_json'], dict):
            raise SectionValidationError("variables_json debe ser un diccionario")

        if len(section_data['variables_json']) == 0:
            raise SectionValidationError("variables_json no puede estar vacío")

        # 3. Validar integridad referencial
        invitation = Invitation.query.get(section_data['invitation_id'])
        if not invitation:
            raise SectionValidationError(f"Invitation {section_data['invitation_id']} no existe")

        if invitation.user_id != section_data['user_id']:
            raise SectionValidationError("user_id no coincide con owner de la invitación")

        # 4. Validar límites de plan
        plan = Plan.query.get(section_data['plan_id'])
        if not plan:
            raise SectionValidationError(f"Plan {section_data['plan_id']} no existe")

        # Contar secciones existentes
        existing_sections = db.session.query(InvitationSectionsData).filter_by(
            invitation_id=section_data['invitation_id']
        ).count()

        max_sections = get_plan_limits(plan.id)['max_sections']
        if existing_sections >= max_sections:
            raise SectionValidationError(f"Plan {plan.name} permite máximo {max_sections} secciones")

        # 5. Validar features premium
        if section_data['plan_id'] == 1:  # Plan básico
            premium_features = detect_premium_features(section_data['variables_json'])
            if premium_features:
                raise SectionValidationError(f"Features premium detectadas en plan básico: {premium_features}")

        # 6. Crear sección
        section = InvitationSectionsData(**section_data)
        db.session.add(section)
        db.session.commit()

        return section

    except SectionValidationError as e:
        db.session.rollback()
        log_validation_error(section_data, str(e))
        raise e

    except Exception as e:
        db.session.rollback()
        log_unexpected_error(section_data, str(e))
        raise SectionValidationError(f"Error inesperado: {str(e)}")

def detect_premium_features(variables_json):
    """Detectar si se están usando features premium"""
    premium_indicators = []

    premium_fields = [
        'custom_colors', 'video_background', 'premium_typography',
        'animated_elements', 'advanced_gallery', 'custom_fonts'
    ]

    for field in premium_fields:
        if field in variables_json:
            premium_indicators.append(field)

    return premium_indicators

def get_plan_limits(plan_id):
    """Obtener límites del plan"""
    limits = {
        1: {'max_sections': 8, 'max_variables_per_section': 15},   # Básico
        2: {'max_sections': 20, 'max_variables_per_section': 50},  # Premium
        3: {'max_sections': -1, 'max_variables_per_section': -1}   # Enterprise (sin límite)
    }
    return limits.get(plan_id, limits[1])
```

---

## **📋 CHECKLIST DE TESTING**

### **TESTS UNITARIOS**

```python
import pytest
from datetime import datetime

class TestSectionRegistration:

    def test_create_valid_section(self):
        """Test creación básica válida"""
        section_data = {
            'invitation_id': 1,
            'user_id': 14,
            'plan_id': 1,
            'section_type': 'hero',
            'section_variant': 'hero_1',
            'category': 'weddings',
            'variables_json': {'groom_name': 'Test', 'bride_name': 'Test'}
        }

        section = create_section_with_full_validation(section_data)
        assert section.id is not None
        assert section.variables_count == 2

    def test_invalid_json_variables(self):
        """Test variables_json inválido"""
        section_data = {
            'invitation_id': 1,
            'user_id': 14,
            'plan_id': 1,
            'section_type': 'hero',
            'section_variant': 'hero_1',
            'variables_json': "invalid json string"  # String en lugar de dict
        }

        with pytest.raises(SectionValidationError):
            create_section_with_full_validation(section_data)

    def test_premium_features_in_basic_plan(self):
        """Test features premium en plan básico"""
        section_data = {
            'invitation_id': 1,
            'user_id': 14,
            'plan_id': 1,  # Plan básico
            'section_type': 'hero',
            'section_variant': 'hero_1',
            'variables_json': {
                'groom_name': 'Test',
                'custom_colors': {'primary': '#123456'}  # Feature premium
            }
        }

        with pytest.raises(SectionValidationError, match="Features premium detectadas"):
            create_section_with_full_validation(section_data)

    def test_section_limits_by_plan(self):
        """Test límites de secciones por plan"""
        # Crear 8 secciones (límite básico)
        for i in range(8):
            section_data = {
                'invitation_id': 1,
                'user_id': 14,
                'plan_id': 1,
                'section_type': f'test_section_{i}',
                'section_variant': f'test_section_{i}_1',
                'variables_json': {'test': 'data'}
            }
            create_section_with_full_validation(section_data)

        # Intentar crear la 9na (debe fallar)
        with pytest.raises(SectionValidationError, match="permite máximo"):
            section_data['section_type'] = 'test_section_9'
            create_section_with_full_validation(section_data)
```

---

## **📦 CASO 9: ESTRUCTURA DEL LOCALSTORAGE Y TRANSFORMACIÓN**

### **CONTEXTO**
El frontend almacena los datos de personalización en localStorage como un objeto plano. Para enviarlos al backend, necesitan ser agrupados por secciones.

### **ESTRUCTURA ACTUAL EN LOCALSTORAGE**

```json
{
  "customizerData": {
    // TODOS los campos en un objeto plano (sin agrupación)
    "groom_name": "Jefferson",
    "bride_name": "Rosmery",
    "weddingDate": "2024-12-15T17:00:00",
    "eventLocation": "Lima, Perú",
    "heroImageUrl": "https://cdn.example.com/hero-image.jpg",

    // Campos con prefijos que indican su sección
    "familiares_padre_novio": "Juan Pérez",
    "familiares_madre_novio": "María García",
    "familiares_padre_novia": "Carlos López",
    "familiares_madre_novia": "Ana Martínez",

    "welcome_title": "¡Nos Casamos!",
    "welcome_description": "Con alegría queremos compartir este momento...",
    "welcome_couplePhotoUrl": "https://cdn.example.com/couple.jpg",

    "place_religioso_titulo": "Ceremonia Religiosa",
    "place_religioso_lugar": "Iglesia San Pedro",
    "place_religioso_direccion": "Av. Principal 123, Lima",

    "gallery_images": [
      {"url": "https://cdn.example.com/img1.jpg", "alt": "Foto 1"},
      {"url": "https://cdn.example.com/img2.jpg", "alt": "Foto 2"}
    ],

    "countdown_title": "Cuenta Regresiva",
    "story_moment_1_title": "Nos Conocimos",
    "itinerary_event_ceremonia_time": "16:00"
  },

  "touchedFields": {
    // Campos que el usuario ha modificado
    "groom_name": true,
    "bride_name": true,
    "familiares_padre_novio": true,
    "welcome_title": true
  },

  "selectedMode": "basic",  // NUEVO: "basic" o "full" - determina el plan_id

  "timestamp": 1706234567890  // Unix timestamp
}
```

### **PROCESO DE TRANSFORMACIÓN**

```javascript
// frontend/src/lib/utils/localStorage-to-sections.ts

function groupCustomizerDataBySections(customizerData) {
  const sections = {};

  Object.entries(customizerData).forEach(([key, value]) => {
    let sectionName = null;

    // 1. Detectar sección por prefijo
    if (key.startsWith('familiares_')) {
      sectionName = 'familiares';
    } else if (key.startsWith('welcome_')) {
      sectionName = 'welcome';
    } else if (key.startsWith('place_religioso_')) {
      sectionName = 'place_religioso';
    } else if (key.startsWith('place_ceremonia_')) {
      sectionName = 'place_ceremonia';
    } else if (key.startsWith('gallery_')) {
      sectionName = 'gallery';
    }
    // ... más prefijos

    // 2. Campos sin prefijo van a 'hero' por defecto
    else if (['groom_name', 'bride_name', 'weddingDate',
              'eventLocation', 'heroImageUrl'].includes(key)) {
      sectionName = 'hero';
    }

    // 3. Agrupar por sección
    if (sectionName) {
      if (!sections[sectionName]) {
        sections[sectionName] = {};
      }
      sections[sectionName][key] = value;
    }
  });

  return sections;
}
```

### **ESTRUCTURA TRANSFORMADA PARA EL BACKEND**

```json
{
  "user_data": {
    "email": "usuario@example.com",
    "first_name": "Jefferson",
    "last_name": "Smith",
    "phone": "+51999999999"
  },

  "invitation_basic": {
    "template_id": 1,
    "plan_id": 1,
    "event_date": "2024-12-15T17:00:00",
    "event_location": "Lima, Perú"
  },

  "sections_data": {
    "hero": {
      "groom_name": "Jefferson",
      "bride_name": "Rosmery",
      "weddingDate": "2024-12-15T17:00:00",
      "eventLocation": "Lima, Perú",
      "heroImageUrl": "https://cdn.example.com/hero-image.jpg"
    },

    "familiares": {
      "familiares_padre_novio": "Juan Pérez",
      "familiares_madre_novio": "María García",
      "familiares_padre_novia": "Carlos López",
      "familiares_madre_novia": "Ana Martínez"
    },

    "welcome": {
      "welcome_title": "¡Nos Casamos!",
      "welcome_description": "Con alegría queremos compartir este momento...",
      "welcome_couplePhotoUrl": "https://cdn.example.com/couple.jpg"
    },

    "place_religioso": {
      "place_religioso_titulo": "Ceremonia Religiosa",
      "place_religioso_lugar": "Iglesia San Pedro",
      "place_religioso_direccion": "Av. Principal 123, Lima"
    },

    "gallery": {
      "gallery_images": [
        {"url": "https://cdn.example.com/img1.jpg", "alt": "Foto 1"},
        {"url": "https://cdn.example.com/img2.jpg", "alt": "Foto 2"}
      ]
    }
  }
}
```

### **OBTENCIÓN DE DATOS DEL USUARIO LOGEADO**

El sistema de autenticación guarda los datos del usuario en localStorage y Zustand store después del login.

#### **Datos Disponibles del Usuario Autenticado**

```javascript
// localStorage keys después del login
localStorage.getItem('auth_token')     // JWT access token
localStorage.getItem('refresh_token')  // JWT refresh token
localStorage.getItem('user_data')      // Datos completos del usuario (JSON)

// Estructura de user_data
{
  "id": 123,
  "email": "usuario@example.com",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+51999999999",
  "role": "CLIENT",
  "is_active": true,
  "email_verified": true,
  "google_id": "1234567890",      // Si es login con Google
  "provider": "google",            // O null si es login normal
  "profile_picture": "https://..." // URL de foto de perfil
}
```

#### **Mapeo de Datos del Usuario al Endpoint**

| Campo Auth Store | Campo Endpoint | Requerido | Ejemplo |
|-----------------|----------------|-----------|---------|
| `user.email` | `user_data.email` | ✅ Sí | `"usuario@example.com"` |
| `user.first_name` | `user_data.first_name` | ✅ Sí | `"Juan"` |
| `user.last_name` | `user_data.last_name` | ⚪ Opcional | `"Pérez"` |
| `user.phone` | `user_data.phone` | ⚪ Opcional | `"+51999999999"` |

#### **Mapeo de Modo de Personalización a Plan ID**

| Modo en Customizer | Plan ID en Backend | Descripción |
|-------------------|-------------------|-------------|
| `"basic"` | `1` | Plan Básico - Campos limitados |
| `"full"` | `2` | Plan Completo/Premium - Todos los campos |
| `undefined` | `1` | Default a Plan Básico |

### **IMPLEMENTACIÓN COMPLETA CON USUARIO AUTENTICADO**

```javascript
// frontend/src/lib/api/invitation-create.ts

import { prepareInvitationCreateRequest } from '../utils/localStorage-to-sections';
import { useUser } from '@/store/authStore';

// OPCIÓN 1: Usando Zustand Store (Recomendado)
async function saveInvitationFromAuthenticatedUser(templateId, planId) {
  // Obtener usuario desde el store
  const user = useUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  try {
    // 1. Preparar request con datos del usuario autenticado
    const requestData = prepareInvitationCreateRequest(
      templateId,
      {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone
      },
      planId
    );

    // 2. Enviar al backend
    const response = await fetch('/api/invitations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error('Error al crear invitación');
    }

    const data = await response.json();

    // 3. Redirigir a la URL de la invitación
    window.location.href = data.invitation.url;

    return data;

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// OPCIÓN 2: Obteniendo datos directamente de localStorage
async function saveInvitationFromLocalStorage(templateId, planId) {
  // Obtener datos del usuario desde localStorage
  const userDataString = localStorage.getItem('user_data');

  if (!userDataString) {
    throw new Error('No hay datos de usuario en localStorage');
  }

  const userData = JSON.parse(userDataString);

  try {
    // 1. Obtener datos del customizer
    const customizerData = getCustomizerDataFromLocalStorage(templateId);

    if (!customizerData) {
      throw new Error('No hay datos de personalización');
    }

    // 2. Agrupar por secciones
    const sectionsData = groupCustomizerDataBySections(customizerData.customizerData);

    // 3. Construir request completo
    const requestData = {
      user_data: {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name || '',
        phone: userData.phone || ''
      },
      invitation_basic: {
        template_id: templateId,
        plan_id: planId,
        event_date: customizerData.customizerData.weddingDate || new Date().toISOString(),
        event_location: customizerData.customizerData.eventLocation || 'Por definir'
      },
      sections_data: sectionsData
    };

    // 4. Enviar al backend
    const response = await fetch('/api/invitations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error('Error al crear invitación');
    }

    return await response.json();

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### **VALIDACIONES ANTES DE ENVIAR**

```javascript
function validateCustomizerData(templateId) {
  const errors = [];
  const warnings = [];

  const data = getCustomizerDataFromLocalStorage(templateId);

  if (!data) {
    errors.push('No hay datos en localStorage');
    return { isValid: false, errors };
  }

  const { customizerData, touchedFields } = data;

  // Validar campos mínimos
  if (!customizerData.groom_name && !customizerData.bride_name) {
    warnings.push('Faltan nombres de los novios');
  }

  if (Object.keys(touchedFields).length === 0) {
    warnings.push('No se ha personalizado ningún campo');
  }

  // Verificar agrupación
  const sections = groupCustomizerDataBySections(customizerData);
  if (Object.keys(sections).length === 0) {
    errors.push('No se pueden agrupar los campos');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

### **MAPEO DE PREFIJOS A SECCIONES**

| Prefijo | Sección | Ejemplo de Campo |
|---------|---------|------------------|
| Sin prefijo | `hero` | `groom_name`, `bride_name`, `weddingDate` |
| `familiares_` | `familiares` | `familiares_padre_novio` |
| `welcome_` | `welcome` | `welcome_title` |
| `place_religioso_` | `place_religioso` | `place_religioso_lugar` |
| `place_ceremonia_` | `place_ceremonia` | `place_ceremonia_hora` |
| `vestimenta_` | `vestimenta` | `vestimenta_etiqueta` |
| `countdown_` | `countdown` | `countdown_title` |
| `gallery_` | `gallery` | `gallery_images` |
| `story_` | `story` | `story_moment_1_title` |
| `itinerary_` | `itinerary` | `itinerary_event_ceremonia_time` |
| `couple_` | `couple` | `couple_sectionTitle` |
| `video_` | `video` | `video_videoEmbedUrl` |
| `footer_` | `footer` | `footer_copyrightText` |

### **EJEMPLO DE USO SIMPLIFICADO (RECOMENDADO)**

```javascript
// frontend/src/lib/api/invitation-create.ts

import { createInvitationFromAuth } from '@/lib/api/invitation-create';

// Función simplificada para usuarios autenticados
async function guardarInvitacion(templateId, planId = 1) {
  try {
    // Todo automático: obtiene user_data, customizer_data, agrupa por secciones
    const result = await createInvitationFromAuth(templateId, planId);

    // Redirigir automáticamente a la invitación creada
    window.location.href = result.invitation.url;

    return result;

  } catch (error) {
    console.error('Error al guardar:', error.message);
    // Mostrar error al usuario
    alert(`Error: ${error.message}`);
  }
}

// Uso en componente React
function SaveButton({ templateId }) {
  const handleSave = () => {
    guardarInvitacion(templateId, 1); // Plan básico
  };

  return (
    <button onClick={handleSave}>
      Guardar Invitación
    </button>
  );
}
```

### **VENTAJAS DEL ENFOQUE INTEGRADO**

1. **✅ Automático**: No necesitas pasar datos del usuario manualmente
2. **✅ Seguro**: Usa datos verificados del sistema de auth
3. **✅ Simple**: Solo requiere `templateId` y `planId`
4. **✅ Completo**: Incluye customizer + user_data + secciones agrupadas
5. **✅ Error Handling**: Manejo completo de errores de auth y API

### **NOTAS IMPORTANTES**

1. **NO se requiere cambiar nombres de variables** - El backend acepta cualquier estructura JSON en `variables_json`
2. **Los prefijos se mantienen** - No es necesario removerlos al agrupar
3. **Flexibilidad total** - El backend no valida nombres específicos de campos
4. **localStorage es plano** - Siempre requiere transformación antes de enviar
5. **touchedFields** indica qué campos fueron modificados por el usuario
6. **Datos del usuario automáticos** - Se obtienen del auth store sin intervención manual

---

## **📦 CASO 10: CREACIÓN DESDE CHECKOUT POST-PAGO**

### **CONTEXTO**
Cuando un usuario completa el pago exitosamente en el checkout, se debe crear automáticamente la invitación con todos los datos personalizados que guardó en localStorage durante la personalización. Este flujo garantiza que el pago se procese primero y luego se cree la invitación con la configuración guardada.

### **FLUJO COMPLETO DETALLADO**

```
┌─────────────────────────────────────────────────────────────────────┐
│ PASO 1: PERSONALIZACIÓN (Frontend)                                  │
├─────────────────────────────────────────────────────────────────────┤
│ 1.1 Usuario accede a /invitacion/demo/{template_id}                │
│ 1.2 DynamicCustomizer carga datos del template desde API           │
│ 1.3 Usuario modifica campos (nombres, fotos, textos)               │
│ 1.4 useCustomizerSync guarda cambios en localStorage:              │
│     - Key: "customizerData"                                         │
│     - Formato: Objeto plano con todos los campos                   │
│     - Ejemplo: {hero_groom_name: "Jeff", welcome_title: "..."}     │
│ 1.5 FileImagePicker convierte imágenes a base64                    │
│ 1.6 MultiImageGalleryPicker convierte galería a base64             │
│                                                                      │
│ Estado localStorage al finalizar:                                   │
│ {                                                                   │
│   "customizerData": {                                               │
│     "template_id": 7,                                               │
│     "plan_id": 1,                                                   │
│     "hero_groom_name": "Jefferson",                                 │
│     "hero_bride_name": "Rosmery",                                   │
│     "hero_imageUrl": "data:image/png;base64,...",                   │
│     "welcome_title": "¡Nos Casamos!",                               │
│     "gallery_images": [{url: "data:image/...", alt: "Foto 1"}],    │
│     ...                                                             │
│   },                                                                │
│   "touchedFields": {                                                │
│     "hero_groom_name": true,                                        │
│     "hero_bride_name": true                                         │
│   }                                                                 │
│ }                                                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 2: AGREGAR AL CARRITO (Frontend)                              │
├─────────────────────────────────────────────────────────────────────┤
│ 2.1 Usuario hace clic en "Agregar al Carrito"                      │
│ 2.2 Sistema llama POST /api/cart/add con:                          │
│     - template_id                                                   │
│     - quantity: 1                                                   │
│     - price (del template)                                          │
│ 2.3 Backend crea CartItem en base de datos                         │
│ 2.4 localStorage mantiene customizerData (NO se envía al carrito)  │
│                                                                      │
│ IMPORTANTE: Los datos de personalización NO van al carrito,        │
│ solo se mantienen en localStorage hasta el pago.                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 3: CHECKOUT - CREAR ORDEN (Frontend + Backend)                │
├─────────────────────────────────────────────────────────────────────┤
│ 3.1 Usuario completa formulario de checkout                        │
│     - Datos personales (nombre, email, teléfono)                   │
│     - Dirección de facturación                                     │
│     - Tipo y número de documento                                   │
│     - Acepta términos y condiciones                                │
│                                                                      │
│ 3.2 Sistema valida formulario con Zod schema                       │
│                                                                      │
│ 3.3 Frontend llama POST /api/orders/create con:                    │
│     {                                                               │
│       "billing_address": {                                          │
│         "first_name": "Jefferson",                                  │
│         "last_name": "Smith",                                       │
│         "email": "jeff@example.com",                                │
│         "phone": "+51999999999",                                    │
│         "address": "Av. Lima 123",                                  │
│         "city": "Lima",                                             │
│         "state": "Lima",                                            │
│         "zip_code": "15001",                                        │
│         "country": "PE",                                            │
│         "document_type": "dni",                                     │
│         "document_number": "12345678"                               │
│       },                                                            │
│       "coupon_code": "PROMO20" // Si aplica                         │
│     }                                                               │
│                                                                      │
│ 3.4 Backend (orders.py) ejecuta:                                   │
│     - Valida cart no esté vacío                                    │
│     - Valida coupon si existe                                      │
│     - Genera order_number único (ORD-20250130-XXXX)                │
│     - Crea registro en tabla Order con status='PENDING'            │
│     - Calcula total con descuento si aplica                        │
│     - Guarda billing_address_json                                  │
│     - Retorna order con todos sus datos                            │
│                                                                      │
│ 3.5 Frontend recibe:                                               │
│     {                                                               │
│       "success": true,                                              │
│       "order": {                                                    │
│         "id": 123,                                                  │
│         "order_number": "ORD-20250130-ABC123",                      │
│         "status": "PENDING",                                        │
│         "total": 290.00,                                            │
│         "currency": "PEN",                                          │
│         "items": [...]                                              │
│       }                                                             │
│     }                                                               │
│                                                                      │
│ 3.6 Frontend guarda order en estado local: setCurrentOrder(order)  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 4: CREAR TOKEN DE PAGO (Frontend + Backend)                   │
├─────────────────────────────────────────────────────────────────────┤
│ 4.1 Frontend llama POST /api/payments/create-token con:            │
│     {                                                               │
│       "order_id": 123,                                              │
│       "billing_info": {                                             │
│         "firstName": "Jefferson",                                   │
│         "lastName": "Smith",                                        │
│         "email": "jeff@example.com",                                │
│         "phoneNumber": "+51999999999",                              │
│         "street": "Av. Lima 123",                                   │
│         "city": "Lima",                                             │
│         "state": "Lima",                                            │
│         "country": "PE",                                            │
│         "postalCode": "15001",                                      │
│         "document": "12345678",                                     │
│         "documentType": "DNI"                                       │
│       }                                                             │
│     }                                                               │
│                                                                      │
│ 4.2 Backend (payments.py) ejecuta:                                 │
│     - Valida que Order existe y está PENDING                       │
│     - Crea payload para Izipay API                                 │
│     - Llama a Izipay: POST /api-payment/V4/Charge/CreatePayment    │
│     - Recibe formToken de Izipay                                   │
│     - Retorna formToken y publicKey al frontend                    │
│                                                                      │
│ 4.3 Frontend recibe:                                               │
│     {                                                               │
│       "success": true,                                              │
│       "formToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",       │
│       "publicKey": "12345678:testpublickey_XXXX"                    │
│     }                                                               │
│                                                                      │
│ 4.4 Frontend cambia a paso 2 del checkout: setCurrentStep(2)       │
│ 4.5 Frontend renderiza componente IzipayCheckout                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 5: PROCESAMIENTO DE PAGO (Izipay + Backend)                   │
├─────────────────────────────────────────────────────────────────────┤
│ 5.1 IzipayCheckout inicializa formulario de pago con:              │
│     - formToken recibido                                            │
│     - publicKey de Izipay                                           │
│     - Biblioteca @lyracom/embedded-form-glue                        │
│                                                                      │
│ 5.2 Usuario ingresa datos de tarjeta en iframe de Izipay           │
│     - Número de tarjeta                                             │
│     - Fecha de expiración                                           │
│     - CVV                                                           │
│                                                                      │
│ 5.3 Izipay procesa el pago de manera segura (PCI compliant)        │
│                                                                      │
│ 5.4 Izipay retorna resultado al frontend vía callback               │
│                                                                      │
│ 5.5 Si EXITOSO: onPaymentComplete se ejecuta con paymentResult     │
│ 5.6 Si ERROR: onPaymentError se ejecuta con error details          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 6: CONFIRMAR PAGO (Frontend + Backend)                        │
├─────────────────────────────────────────────────────────────────────┤
│ 6.1 Frontend ejecuta handlePaymentSuccess()                        │
│                                                                      │
│ 6.2 Frontend llama POST /api/payments/process con:                 │
│     {                                                               │
│       "order_id": 123,                                              │
│       "payment_result": {                                           │
│         "status": "SUCCESS",                                        │
│         "transaction_id": "ORD-20250130-ABC123",                    │
│         "izipay_data": {                                            │
│           "orderStatus": "PAID",                                    │
│           "orderDetails": {...}                                     │
│         }                                                           │
│       }                                                             │
│     }                                                               │
│                                                                      │
│ 6.3 Backend (payments.py) ejecuta:                                 │
│     - Valida que Order existe                                      │
│     - Actualiza Order.status = 'PAID'                              │
│     - Guarda payment_details_json con datos de Izipay              │
│     - Actualiza paid_at timestamp                                  │
│     - Limpia CartItems asociados al usuario                        │
│     - Commit a base de datos                                       │
│                                                                      │
│ 6.4 Backend retorna:                                               │
│     {                                                               │
│       "success": true,                                              │
│       "message": "Payment processed successfully",                  │
│       "order": {                                                    │
│         "id": 123,                                                  │
│         "status": "PAID",                                           │
│         ...                                                         │
│       }                                                             │
│     }                                                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 7: CREAR INVITACIÓN (Frontend + Backend) ← NUEVO              │
├─────────────────────────────────────────────────────────────────────┤
│ 7.1 Frontend (MISMO handlePaymentSuccess) ejecuta:                 │
│     - Lee localStorage.getItem('customizerData')                   │
│     - Parse JSON de los datos                                      │
│     - Extrae template_id del customizerData                        │
│                                                                      │
│ 7.2 Validación de datos:                                           │
│     if (templateId && Object.keys(customizerData).length > 0) {    │
│       // Continuar con creación                                    │
│     } else {                                                        │
│       // Redirigir a orden sin crear invitación                    │
│     }                                                               │
│                                                                      │
│ 7.3 Frontend llama extractInvitationMetadata(customizerData):      │
│     - Extrae: event_date, title, groom_name, bride_name            │
│     - Busca en múltiples campos posibles:                          │
│       * hero_date, countdown_date → event_date                     │
│       * hero_title → title                                         │
│       * hero_groom_name, couple_groom_name → groom_name            │
│       * hero_bride_name, couple_bride_name → bride_name            │
│                                                                      │
│ 7.4 Frontend llama createInvitationFromOrder():                    │
│     - Parámetros:                                                   │
│       * orderId: currentOrder.id (123)                             │
│       * templateId: extraído de customizerData                     │
│       * customizerData: objeto completo de localStorage            │
│       * metadata: {event_date, title, groom_name, bride_name}      │
│                                                                      │
│ 7.5 createInvitationFromOrder() procesa:                           │
│                                                                      │
│     A) Agrupa datos por secciones con groupCustomizerDataBySections│
│        Input (plano):                                               │
│        {                                                            │
│          "hero_groom_name": "Jefferson",                            │
│          "hero_bride_name": "Rosmery",                              │
│          "hero_imageUrl": "data:image/...",                         │
│          "welcome_title": "¡Nos Casamos!",                          │
│          "welcome_description": "Con alegría...",                   │
│          "gallery_images": [...]                                    │
│        }                                                            │
│                                                                      │
│        Output (agrupado):                                           │
│        {                                                            │
│          "hero": {                                                  │
│            "hero_groom_name": "Jefferson",                          │
│            "hero_bride_name": "Rosmery",                            │
│            "hero_imageUrl": "data:image/..."                        │
│          },                                                         │
│          "welcome": {                                               │
│            "welcome_title": "¡Nos Casamos!",                        │
│            "welcome_description": "Con alegría..."                  │
│          },                                                         │
│          "gallery": {                                               │
│            "gallery_images": [...]                                  │
│          }                                                          │
│        }                                                            │
│                                                                      │
│        Lógica de agrupación:                                        │
│        - Si key.startsWith("hero_") → Sección "hero"               │
│        - Si key.startsWith("welcome_") → Sección "welcome"         │
│        - Si key.startsWith("gallery_") → Sección "gallery"         │
│        - Variables sin prefijo → Sección "general"                 │
│        - Mantiene nombres originales (NO los renombra)             │
│                                                                      │
│     B) Determina plan_id:                                           │
│        Priority order:                                              │
│        1. customizerData.template?.plan_id                          │
│        2. customizerData.plan_id                                    │
│        3. Default: 1 (Plan Básico)                                 │
│                                                                      │
│     C) Construye payload:                                           │
│        {                                                            │
│          "order_id": 123,                                           │
│          "template_id": 7,                                          │
│          "plan_id": 1,                                              │
│          "sections_data": {                                         │
│            "hero": {...},                                           │
│            "welcome": {...},                                        │
│            "gallery": {...}                                         │
│          },                                                         │
│          "event_date": "2024-12-15T17:00:00",                       │
│          "title": "Boda Jefferson & Rosmery",                       │
│          "groom_name": "Jefferson",                                 │
│          "bride_name": "Rosmery"                                    │
│        }                                                            │
│                                                                      │
│ 7.6 Frontend llama POST /api/invitations/create-from-order         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 8: BACKEND CREA INVITACIÓN                                    │
├─────────────────────────────────────────────────────────────────────┤
│ 8.1 Backend (invitations.py) recibe request                        │
│                                                                      │
│ 8.2 Validaciones de seguridad:                                     │
│     - Extrae current_user_id desde JWT token                       │
│     - Valida order_id y template_id presentes                      │
│     - Valida sections_data no esté vacío                           │
│     - Query Order con filters:                                     │
│       * id = order_id                                               │
│       * user_id = current_user_id (seguridad)                      │
│     - Valida Order.status == OrderStatus.PAID ⚠️ CRÍTICO           │
│     - Valida Template existe en base de datos                      │
│                                                                      │
│ 8.3 Construye datos de Invitation:                                 │
│     title = data.get('title')                                       │
│     groom_name = data.get('groom_name')                             │
│     bride_name = data.get('bride_name')                             │
│                                                                      │
│     # Auto-generar title si falta                                  │
│     if not title and groom_name and bride_name:                    │
│         title = f"Boda {groom_name} & {bride_name}"                │
│     elif not title:                                                │
│         title = f"Invitación - Template {template.name}"           │
│                                                                      │
│ 8.4 Crea registro en tabla Invitation:                             │
│     invitation = Invitation(                                        │
│         user_id=current_user_id,                                    │
│         order_id=order_id,                                          │
│         title=title,                                                │
│         groom_name=groom_name,                                      │
│         bride_name=bride_name,                                      │
│         wedding_date=data.get('event_date'),                        │
│         plan_id=plan_id,                                            │
│         status='active'                                             │
│     )                                                               │
│     db.session.add(invitation)                                      │
│     db.session.flush()  # ← Obtiene invitation.id antes de commit  │
│                                                                      │
│ 8.5 Itera sobre sections_data y crea InvitationSectionsData:       │
│     sections_created = 0                                            │
│                                                                      │
│     for section_type, variables in sections_data.items():          │
│         # Skip secciones vacías                                    │
│         if not variables or len(variables) == 0:                   │
│             continue                                                │
│                                                                      │
│         # Construir usage_stats para tracking                      │
│         usage_stats = {                                             │
│             "created_at": datetime.now(timezone.utc).isoformat(),   │
│             "source": "checkout_post_payment",                      │
│             "plan_type": "basic" if plan_id == 1 else "premium",   │
│             "variables_count": len(variables),                      │
│             "order_id": order_id                                    │
│         }                                                           │
│                                                                      │
│         # Crear registro de sección                                │
│         section = InvitationSectionsData(                           │
│             invitation_id=invitation.id,  # ← Desde flush()        │
│             user_id=current_user_id,                                │
│             order_id=order_id,                                      │
│             plan_id=plan_id,                                        │
│             section_type=section_type,  # "hero", "welcome", etc.  │
│             section_variant=f"{section_type}_1",  # Default        │
│             category='weddings',  # Default                         │
│             variables_json=variables,  # ← Nombres ORIGINALES      │
│             usage_stats=usage_stats                                 │
│         )                                                           │
│                                                                      │
│         db.session.add(section)                                     │
│         sections_created += 1                                       │
│                                                                      │
│ 8.6 Commit transaction atómica:                                    │
│     db.session.commit()                                             │
│     # ← Aquí se guardan Invitation + todas las secciones           │
│                                                                      │
│ 8.7 Backend retorna respuesta exitosa:                             │
│     {                                                               │
│       "success": true,                                              │
│       "invitation_id": 456,                                         │
│       "invitation_url": "/invitacion/456",                          │
│       "sections_created": 4                                         │
│     }                                                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 9: LIMPIEZA Y REDIRECCIÓN (Frontend)                          │
├─────────────────────────────────────────────────────────────────────┤
│ 9.1 Frontend recibe respuesta exitosa de creación                  │
│                                                                      │
│ 9.2 Limpia localStorage:                                            │
│     localStorage.removeItem('customizerData')                       │
│     # ← Importante: Evita reutilizar datos viejos                  │
│                                                                      │
│ 9.3 Muestra notificación de éxito:                                 │
│     toast.success('¡Pago completado e invitación creada!')          │
│                                                                      │
│ 9.4 Redirige a la invitación creada:                               │
│     router.push(invitationResponse.invitation_url)                  │
│     # → Usuario ve: /invitacion/456                                │
│                                                                      │
│ 9.5 Usuario aterriza en TemplateBuilder:                           │
│     - Carga datos desde InvitationSectionsData                     │
│     - Renderiza template con personalización guardada              │
│     - Usuario ve su invitación finalizada                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ MANEJO DE ERRORES                                                   │
├─────────────────────────────────────────────────────────────────────┤
│ ERROR ESCENARIO 1: Creación de invitación falla                    │
│ - Pago YA está procesado (Order.status = PAID) ✅                  │
│ - Catch error en handlePaymentSuccess                              │
│ - Mostrar: "¡Pago completado! Tu invitación será creada pronto."   │
│ - Redirigir a: /mi-cuenta/pedidos/{order_number}?success=true      │
│ - Admin puede crear invitación manualmente desde el pedido         │
│                                                                      │
│ ERROR ESCENARIO 2: No hay datos en localStorage                    │
│ - Validación: Object.keys(customizerData).length === 0             │
│ - Mostrar: "¡Pago completado exitosamente!"                        │
│ - Redirigir a: /mi-cuenta/pedidos/{order_number}?success=true      │
│ - Usuario compró template sin personalizar                         │
│                                                                      │
│ ERROR ESCENARIO 3: Orden no está PAID                              │
│ - Backend valida: order.status != OrderStatus.PAID                 │
│ - Retorna 400: "La orden no está pagada"                           │
│ - Frontend no debería llegar aquí (pago se confirmó antes)         │
│                                                                      │
│ ERROR ESCENARIO 4: Usuario no es dueño de la orden                 │
│ - Backend valida: order.user_id != current_user_id                 │
│ - Retorna 404: "Orden no encontrada"                               │
│ - Previene acceso no autorizado a órdenes ajenas                   │
└─────────────────────────────────────────────────────────────────────┘

RESUMEN DEL FLUJO:
1. ✅ Personalización → localStorage (base64 para imágenes)
2. ✅ Carrito → Solo template_id, NO personalización
3. ✅ Checkout → Crear Order PENDING
4. ✅ Token → Izipay formToken
5. ✅ Pago → Izipay procesa tarjeta
6. ✅ Confirmar → Order.status = PAID
7. ✅ Crear → Invitation + InvitationSectionsData (nombres originales)
8. ✅ Limpiar → localStorage.removeItem
9. ✅ Redirigir → /invitacion/{id}
```

### **IMPLEMENTACIÓN BACKEND**

```python
# backend/api/invitations.py

@invitations_bp.route('/create-from-order', methods=['POST'])
@jwt_required()
def create_invitation_from_order():
    """
    POST /api/invitations/create-from-order

    WHY: Crear invitación completa después de pago exitoso.
    Guarda datos de localStorage agrupados en InvitationSectionsData.

    PAYLOAD:
    {
        "order_id": 123,
        "template_id": 7,
        "plan_id": 1,  # 1=Basic, 2=Premium
        "sections_data": {
            "hero": {"groom_name": "Jefferson", "bride_name": "Rosmery", ...},
            "welcome": {"welcome_title": "¡Nos Casamos!", ...},
            "gallery": {"gallery_images": [...]},
            ...
        },
        "event_date": "2024-12-15T17:00:00",  # Opcional
        "title": "Boda Jefferson & Rosmery",  # Opcional
        "groom_name": "Jefferson",  # Opcional
        "bride_name": "Rosmery"  # Opcional
    }

    RESPONSE:
    {
        "success": true,
        "invitation_id": 456,
        "invitation_url": "/invitacion/456"
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json() or {}

        # VALIDACIONES
        order_id = data.get('order_id')
        template_id = data.get('template_id')
        plan_id = data.get('plan_id', 1)
        sections_data = data.get('sections_data', {})

        if not order_id or not template_id:
            return jsonify({'error': 'order_id y template_id son requeridos'}), 400

        if not sections_data or len(sections_data) == 0:
            return jsonify({'error': 'sections_data no puede estar vacío'}), 400

        # Validar que order existe y está PAGADA
        order = Order.query.filter_by(
            id=order_id,
            user_id=current_user_id
        ).first()

        if not order:
            return jsonify({'error': 'Orden no encontrada'}), 404

        if order.status != OrderStatus.PAID:
            return jsonify({'error': 'La orden no está pagada'}), 400

        # Validar template existe
        template = Template.query.get(template_id)
        if not template:
            return jsonify({'error': 'Template no encontrado'}), 404

        # CREAR INVITACIÓN
        title = data.get('title')
        groom_name = data.get('groom_name')
        bride_name = data.get('bride_name')

        # Auto-generar title si no viene
        if not title and groom_name and bride_name:
            title = f"Boda {groom_name} & {bride_name}"
        elif not title:
            title = f"Invitación - Template {template.name}"

        invitation = Invitation(
            user_id=current_user_id,
            order_id=order_id,
            title=title,
            groom_name=groom_name,
            bride_name=bride_name,
            wedding_date=data.get('event_date'),
            plan_id=plan_id,
            status='active'
        )

        db.session.add(invitation)
        db.session.flush()  # Get invitation.id before commit

        # CREAR SECCIONES
        sections_created = 0

        for section_type, variables in sections_data.items():
            # Skip si no hay variables
            if not variables or len(variables) == 0:
                continue

            # Crear usage_stats
            usage_stats = {
                "created_at": datetime.now(timezone.utc).isoformat(),
                "source": "checkout_post_payment",
                "plan_type": "basic" if plan_id == 1 else "premium",
                "variables_count": len(variables),
                "order_id": order_id
            }

            section = InvitationSectionsData(
                invitation_id=invitation.id,
                user_id=current_user_id,
                order_id=order_id,
                plan_id=plan_id,
                section_type=section_type,
                section_variant=f"{section_type}_1",  # Default variant
                category='weddings',  # Default category
                variables_json=variables,  # ← Mantiene nombres originales
                usage_stats=usage_stats
            )

            db.session.add(section)
            sections_created += 1

        db.session.commit()

        return jsonify({
            'success': True,
            'invitation_id': invitation.id,
            'invitation_url': f'/invitacion/{invitation.id}',
            'sections_created': sections_created
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
```

### **IMPLEMENTACIÓN FRONTEND**

```typescript
// frontend/src/lib/api/invitations.ts

/**
 * Agrupar datos planos de localStorage por secciones
 */
export function groupCustomizerDataBySections(flatData: Record<string, any>): Record<string, any> {
  const sectionsData: Record<string, any> = {};

  // Secciones conocidas del template
  const sectionTypes = ['hero', 'welcome', 'couple', 'countdown', 'story', 'video', 'gallery', 'footer'];

  // Inicializar secciones vacías
  sectionTypes.forEach(section => {
    sectionsData[section] = {};
  });

  // Agrupar variables por prefijo
  Object.entries(flatData).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    // Buscar sección por prefijo
    const matchedSection = sectionTypes.find(section => key.startsWith(`${section}_`));

    if (matchedSection) {
      // Mantener nombre original (con prefijo)
      sectionsData[matchedSection][key] = value;
    } else {
      // Variables sin prefijo van a 'general'
      if (!sectionsData.general) {
        sectionsData.general = {};
      }
      sectionsData.general[key] = value;
    }
  });

  // Remover secciones sin datos
  Object.keys(sectionsData).forEach(section => {
    if (Object.keys(sectionsData[section]).length === 0) {
      delete sectionsData[section];
    }
  });

  return sectionsData;
}

/**
 * Extraer metadatos de los datos del customizer
 */
export function extractInvitationMetadata(customizerData: Record<string, any>) {
  return {
    event_date: customizerData.hero_date || customizerData.countdown_date || undefined,
    title: customizerData.hero_title || undefined,
    groom_name: customizerData.hero_groom_name || customizerData.couple_groom_name || undefined,
    bride_name: customizerData.hero_bride_name || customizerData.couple_bride_name || undefined
  };
}

/**
 * Crear invitación desde orden después de pago exitoso
 */
export async function createInvitationFromOrder(
  orderId: number,
  templateId: number,
  customizerData: Record<string, any>,
  additionalData?: {
    event_date?: string;
    title?: string;
    groom_name?: string;
    bride_name?: string;
  }
): Promise<{ success: boolean; invitation_id: number; invitation_url: string }> {
  try {
    // Transformar datos planos a agrupados
    const sectionsData = groupCustomizerDataBySections(customizerData);

    // Determinar plan_id
    let planId = 1; // Default: Plan Básico
    if (customizerData.template?.plan_id) {
      planId = customizerData.template.plan_id;
    } else if (customizerData.plan_id) {
      planId = customizerData.plan_id;
    }

    // Construir payload
    const payload = {
      order_id: orderId,
      template_id: templateId,
      plan_id: planId,
      sections_data: sectionsData,
      ...additionalData
    };

    // Llamar al backend
    const response = await apiClient.post('/invitations/create-from-order', payload);

    return response.data;

  } catch (error: any) {
    console.error('Error creating invitation from order:', error);
    throw new Error(
      error.response?.data?.error || 'Failed to create invitation from order'
    );
  }
}
```

### **INTEGRACIÓN EN CHECKOUT**

```typescript
// frontend/src/app/checkout/page.tsx

import { createInvitationFromOrder, extractInvitationMetadata } from '@/lib/api/invitations';

const handlePaymentSuccess = async (paymentResult: any) => {
  try {
    if (!currentOrder) {
      throw new Error('No order found');
    }

    // 1. Procesar pago
    await paymentsApi.processPayment({
      order_id: currentOrder.id,
      payment_result: {
        status: 'SUCCESS',
        transaction_id: currentOrder.order_number,
        izipay_data: paymentResult,
      },
    });

    // 2. Guardar invitación desde localStorage
    try {
      const customizerData = JSON.parse(localStorage.getItem('customizerData') || '{}');
      const templateId = customizerData.template_id || cart?.items?.[0]?.template_id;

      if (templateId && Object.keys(customizerData).length > 0) {
        const metadata = extractInvitationMetadata(customizerData);

        const invitationResponse = await createInvitationFromOrder(
          currentOrder.id,
          templateId,
          customizerData,
          metadata
        );

        // Limpiar localStorage
        localStorage.removeItem('customizerData');

        toast.success('¡Pago completado e invitación creada exitosamente!');
        router.push(invitationResponse.invitation_url);
      } else {
        // Sin datos del customizer
        toast.success('¡Pago completado exitosamente!');
        router.push(`/mi-cuenta/pedidos/${currentOrder.order_number}?success=true`);
      }
    } catch (invitationError: any) {
      console.error('Error creating invitation:', invitationError);
      // Pago exitoso pero fallo creación - redirigir a orden
      toast.success('¡Pago completado! Tu invitación será creada pronto.');
      router.push(`/mi-cuenta/pedidos/${currentOrder.order_number}?success=true`);
    }

  } catch (error: any) {
    console.error('Error processing payment:', error);
    toast.error('Error confirmando el pago. Contacta con soporte.');
  }
};
```

### **EJEMPLO DE DATOS REALES**

#### **localStorage Antes del Pago**
```json
{
  "customizerData": {
    "template_id": 7,
    "plan_id": 1,
    "hero_groom_name": "Jefferson",
    "hero_bride_name": "Rosmery",
    "hero_date": "2024-12-15T17:00:00",
    "hero_imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU...",
    "welcome_title": "¡Nos Casamos!",
    "welcome_description": "Con inmensa alegría...",
    "gallery_images": [
      {"url": "data:image/png;base64,...", "alt": "Foto 1"},
      {"url": "data:image/png;base64,...", "alt": "Foto 2"}
    ],
    "countdown_date": "2024-12-15T17:00:00"
  },
  "touchedFields": {
    "hero_groom_name": true,
    "hero_bride_name": true,
    "welcome_title": true
  }
}
```

#### **Payload Enviado al Backend**
```json
{
  "order_id": 123,
  "template_id": 7,
  "plan_id": 1,
  "sections_data": {
    "hero": {
      "hero_groom_name": "Jefferson",
      "hero_bride_name": "Rosmery",
      "hero_date": "2024-12-15T17:00:00",
      "hero_imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU..."
    },
    "welcome": {
      "welcome_title": "¡Nos Casamos!",
      "welcome_description": "Con inmensa alegría..."
    },
    "gallery": {
      "gallery_images": [
        {"url": "data:image/png;base64,...", "alt": "Foto 1"},
        {"url": "data:image/png;base64,...", "alt": "Foto 2"}
      ]
    },
    "countdown": {
      "countdown_date": "2024-12-15T17:00:00"
    }
  },
  "event_date": "2024-12-15T17:00:00",
  "groom_name": "Jefferson",
  "bride_name": "Rosmery"
}
```

#### **Datos Guardados en Base de Datos**

**Tabla: `Invitation`**
```sql
id: 456
user_id: 14
order_id: 123
title: "Boda Jefferson & Rosmery"
groom_name: "Jefferson"
bride_name: "Rosmery"
wedding_date: "2024-12-15 17:00:00"
plan_id: 1
status: "active"
```

**Tabla: `InvitationSectionsData` (4 registros creados)**

```sql
-- Registro 1: Hero
id: 1001
invitation_id: 456
user_id: 14
order_id: 123
plan_id: 1
section_type: "hero"
section_variant: "hero_1"
category: "weddings"
variables_json: {
  "hero_groom_name": "Jefferson",
  "hero_bride_name": "Rosmery",
  "hero_date": "2024-12-15T17:00:00",
  "hero_imageUrl": "data:image/png;base64,..."
}
usage_stats: {
  "created_at": "2025-01-24T15:30:00Z",
  "source": "checkout_post_payment",
  "plan_type": "basic",
  "variables_count": 4,
  "order_id": 123
}

-- Registro 2: Welcome
id: 1002
section_type: "welcome"
variables_json: {
  "welcome_title": "¡Nos Casamos!",
  "welcome_description": "Con inmensa alegría..."
}

-- Registro 3: Gallery
id: 1003
section_type: "gallery"
variables_json: {
  "gallery_images": [...]
}

-- Registro 4: Countdown
id: 1004
section_type: "countdown"
variables_json: {
  "countdown_date": "2024-12-15T17:00:00"
}
```

### **PUNTOS CLAVE**

1. **✅ Mantiene nombres originales** - No se renombran variables
2. **✅ Agrupa por prefijos** - `hero_`, `welcome_`, etc.
3. **✅ Base64 para imágenes** - Compatible con PDF generation
4. **✅ Orden pagada primero** - Validación de `OrderStatus.PAID`
5. **✅ Atomic transaction** - Todo o nada con `db.session`
6. **✅ Error handling completo** - Fallbacks si falla creación
7. **✅ localStorage cleanup** - Limpia datos después de guardar
8. **✅ Redirección automática** - Usuario ve su invitación nueva

### **VENTAJAS DEL ENFOQUE**

- **Seguro**: Pago validado antes de crear invitación
- **Automático**: No requiere intervención manual
- **Robusto**: Maneja errores sin perder el pago
- **Transparente**: Usuario ve resultado inmediatamente
- **Escalable**: Funciona con cualquier template/plan

### **FLUJO DE ERROR RECOVERY**

```
Si PAGO exitoso pero CREACIÓN falla:
1. Pago ya procesado ✅
2. Order status = PAID ✅
3. Usuario redirigido a Order Confirmation
4. Admin puede crear invitación manualmente desde Order
5. O sistema puede reintentar automáticamente
```

---

**🎯 RESUMEN DE CASOS DE USO:**

1. **✅ Wedding Básico** - Registro estándar con validaciones
2. **✅ Wedding Premium** - Features avanzadas y custom elements
3. **✅ Kids Birthday** - Diferente categoría y estructura
4. **✅ Actualización Incremental** - Updates parciales
5. **✅ Migración Legacy** - Transición desde sistema EAV
6. **✅ Analytics Avanzados** - Business Intelligence
7. **✅ Validación Robusta** - Manejo de errores en producción
8. **✅ Testing Completo** - Cobertura de casos edge
9. **✅ localStorage Integration** - Transformación de datos del frontend
10. **✅ Checkout Post-Payment** - Creación automática después de pago exitoso

**Esta documentación cubre todos los escenarios reales de uso del sistema** 🚀