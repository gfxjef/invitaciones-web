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

**🎯 RESUMEN DE CASOS DE USO:**

1. **✅ Wedding Básico** - Registro estándar con validaciones
2. **✅ Wedding Premium** - Features avanzadas y custom elements
3. **✅ Kids Birthday** - Diferente categoría y estructura
4. **✅ Actualización Incremental** - Updates parciales
5. **✅ Migración Legacy** - Transición desde sistema EAV
6. **✅ Analytics Avanzados** - Business Intelligence
7. **✅ Validación Robusta** - Manejo de errores en producción
8. **✅ Testing Completo** - Cobertura de casos edge

**Esta documentación cubre todos los escenarios reales de uso del sistema** 🚀