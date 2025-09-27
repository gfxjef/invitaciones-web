# 🚨 **GUÍA COMPLETA: VALIDACIONES Y ERRORES COMUNES**

**Versión:** 1.0.0
**Fecha:** 24 de Enero, 2025
**Complemento:** BUENAS_PRACTICAS_REGISTRO_SECCIONES.md

---

## **🎯 PROPÓSITO DE ESTA GUÍA**

Documentar todos los **errores comunes**, **validaciones necesarias** y **soluciones prácticas** para el sistema `invitation_sections_data`. Garantiza:

- ⚡ **Debugging rápido** de problemas
- 🛡️ **Prevención** de errores comunes
- 📋 **Validaciones completas** antes del registro
- 🔧 **Soluciones probadas** para cada error

---

## **🔍 CATEGORÍAS DE ERRORES**

### **1. ERRORES DE INTEGRIDAD REFERENCIAL**
### **2. ERRORES DE FORMATO Y TIPOS**
### **3. ERRORES DE LÓGICA DE NEGOCIO**
### **4. ERRORES DE PERFORMANCE Y LÍMITES**
### **5. ERRORES DE DATOS CORRUPTOS**

---

## **1️⃣ ERRORES DE INTEGRIDAD REFERENCIAL**

### **ERROR: `Foreign Key Constraint Fails - invitation_id`**

```sql
ERROR 1452 (23000): Cannot add or update a child row:
a foreign key constraint fails (invitation_sections_data.invitation_id)
```

**CAUSA COMÚN:**
```python
# ❌ PROBLEMA - invitation_id no existe
section = InvitationSectionsData(
    invitation_id=999,  # Esta invitación no existe
    user_id=14,
    # ...
)
```

**SOLUCIÓN:**
```python
# ✅ VALIDAR ANTES DE CREAR
def validate_invitation_exists(invitation_id):
    invitation = Invitation.query.get(invitation_id)
    if not invitation:
        raise ValidationError(f"Invitation {invitation_id} no existe")
    return invitation

# Uso correcto
invitation = validate_invitation_exists(invitation_id)
section = InvitationSectionsData(
    invitation_id=invitation.id,
    user_id=invitation.user_id,  # Consistencia garantizada
    # ...
)
```

**QUERY DE DIAGNÓSTICO:**
```sql
-- Encontrar secciones con invitation_id inválido
SELECT isd.invitation_id, COUNT(*) as sections_count
FROM invitation_sections_data isd
LEFT JOIN invitations i ON isd.invitation_id = i.id
WHERE i.id IS NULL
GROUP BY isd.invitation_id;
```

### **ERROR: `Foreign Key Constraint Fails - user_id`**

**CAUSA:**
```python
# ❌ user_id no coincide con invitation owner
section = InvitationSectionsData(
    invitation_id=1,
    user_id=999,  # Usuario que no es owner de la invitación
    # ...
)
```

**SOLUCIÓN:**
```python
# ✅ VALIDAR OWNERSHIP
def validate_user_ownership(invitation_id, user_id):
    invitation = Invitation.query.get(invitation_id)
    if not invitation:
        raise ValidationError(f"Invitation {invitation_id} no existe")

    if invitation.user_id != user_id:
        raise PermissionError(
            f"User {user_id} no es owner de invitation {invitation_id}. "
            f"Owner real: {invitation.user_id}"
        )

    return invitation

# Uso
invitation = validate_user_ownership(invitation_id, user_id)
```

### **ERROR: `Foreign Key Constraint Fails - plan_id`**

**DIAGNÓSTICO Y SOLUCIÓN:**
```python
def validate_and_fix_plan_id(invitation_id, proposed_plan_id=None):
    """
    Validar plan_id y usar fallback si es necesario
    """
    invitation = Invitation.query.get(invitation_id)

    # Opción 1: Usar plan propuesto si es válido
    if proposed_plan_id:
        plan = Plan.query.get(proposed_plan_id)
        if plan and plan.is_active:
            return proposed_plan_id

    # Opción 2: Usar plan de la invitación
    if invitation.plan_id:
        return invitation.plan_id

    # Opción 3: Usar plan del usuario actual
    user = User.query.get(invitation.user_id)
    if hasattr(user, 'current_plan_id') and user.current_plan_id:
        return user.current_plan_id

    # Opción 4: Fallback a plan básico
    basic_plan = Plan.query.filter_by(name='Básico').first()
    if not basic_plan:
        raise ValidationError("No se encontró plan básico como fallback")

    return basic_plan.id
```

---

## **2️⃣ ERRORES DE FORMATO Y TIPOS**

### **ERROR: `JSON Parse Error`**

```python
# ❌ PROBLEMA - Intentar guardar string como JSON
variables_json = '{"name": "Juan"}'  # String
section.variables_json = variables_json
# MySQL ERROR: Invalid JSON text
```

**SOLUCIÓN:**
```python
# ✅ VALIDACIÓN Y CONVERSIÓN AUTOMÁTICA
def ensure_valid_json(data):
    """Convertir y validar JSON de manera segura"""

    if data is None:
        raise ValidationError("variables_json no puede ser None")

    # Si ya es dict, validar estructura
    if isinstance(data, dict):
        if len(data) == 0:
            raise ValidationError("variables_json no puede estar vacío")
        return data

    # Si es string, intentar parsear
    if isinstance(data, str):
        try:
            parsed = json.loads(data)
            if not isinstance(parsed, dict):
                raise ValidationError("JSON debe ser un objeto, no array o primitivo")
            return parsed
        except json.JSONDecodeError as e:
            raise ValidationError(f"JSON inválido: {str(e)}")

    # Tipo no soportado
    raise ValidationError(f"Tipo no soportado para variables_json: {type(data)}")

# Uso seguro
try:
    validated_json = ensure_valid_json(raw_data)
    section.variables_json = validated_json
except ValidationError as e:
    logger.error(f"Error validando JSON: {e}")
    # Manejar error apropiadamente
```

### **ERROR: `Section Type Invalid Format`**

```python
# ❌ PROBLEMAS COMUNES
section_type = "Hero"              # CamelCase
section_type = "place-ceremonia"   # Kebab-case
section_type = "place ceremonia"   # Espacios
section_type = ""                  # Vacío
section_type = None                # Null
```

**SOLUCIÓN:**
```python
def normalize_section_type(raw_section_type):
    """Normalizar y validar section_type"""

    if not raw_section_type:
        raise ValidationError("section_type no puede estar vacío")

    # Normalizar a snake_case
    normalized = raw_section_type.lower().strip()
    normalized = normalized.replace('-', '_').replace(' ', '_')

    # Eliminar caracteres especiales
    import re
    normalized = re.sub(r'[^a-z0-9_]', '', normalized)

    # Validar formato final
    if not re.match(r'^[a-z][a-z0-9_]*$', normalized):
        raise ValidationError(
            f"section_type '{raw_section_type}' no válido. "
            f"Debe ser snake_case: letras minúsculas, números y guiones bajos"
        )

    # Validar contra lista de tipos válidos
    valid_types = get_valid_section_types()
    if normalized not in valid_types:
        raise ValidationError(
            f"section_type '{normalized}' no reconocido. "
            f"Tipos válidos: {', '.join(valid_types)}"
        )

    return normalized

def get_valid_section_types():
    """Lista de section_types válidos"""
    return [
        # Wedding
        'hero', 'welcome', 'couple', 'story', 'gallery', 'video',
        'countdown', 'itinerary', 'place_religioso', 'place_ceremonia',
        'vestimenta', 'familiares', 'footer',
        # Kids
        'party_hero', 'birthday_child', 'party_games', 'party_info',
        # Corporate
        'corporate_hero', 'company_info', 'event_agenda'
    ]
```

### **ERROR: `Section Variant Format Invalid`**

**PROBLEMA Y SOLUCIÓN:**
```python
def generate_section_variant(section_type, variant_number=None):
    """Generar section_variant válido"""

    if not section_type:
        raise ValidationError("section_type requerido para generar variant")

    # Auto-detectar siguiente número si no se provee
    if variant_number is None:
        # Buscar la variante más alta existente
        existing = db.session.query(
            func.max(
                func.cast(
                    func.substring_index(
                        InvitationSectionsData.section_variant, '_', -1
                    ),
                    db.Integer
                )
            )
        ).filter(
            InvitationSectionsData.section_type == section_type
        ).scalar()

        variant_number = (existing or 0) + 1

    # Validar número
    if not isinstance(variant_number, int) or variant_number < 1:
        raise ValidationError("variant_number debe ser entero positivo >= 1")

    return f"{section_type}_{variant_number}"

# Uso
section_variant = generate_section_variant("hero", 2)  # "hero_2"
section_variant = generate_section_variant("hero")     # "hero_3" (auto)
```

---

## **3️⃣ ERRORES DE LÓGICA DE NEGOCIO**

### **ERROR: `Duplicate Section`**

```sql
ERROR 1062 (23000): Duplicate entry '1-hero' for key 'uq_invitation_section'
```

**CAUSA:**
```python
# ❌ Intentar crear sección que ya existe
section1 = InvitationSectionsData(invitation_id=1, section_type="hero", ...)
section2 = InvitationSectionsData(invitation_id=1, section_type="hero", ...)
# Viola constraint único
```

**SOLUCIÓN:**
```python
def create_or_update_section(invitation_id, section_type, variables_json, **kwargs):
    """Crear sección nueva o actualizar existente"""

    # Buscar sección existente
    existing = InvitationSectionsData.query.filter_by(
        invitation_id=invitation_id,
        section_type=section_type
    ).first()

    if existing:
        # Actualizar existente
        logger.info(f"Actualizando sección existente {section_type} para invitation {invitation_id}")

        # Backup de variables anteriores para rollback
        old_variables = existing.variables_json.copy()

        try:
            existing.variables_json = variables_json
            existing.last_modified = datetime.now()

            # Actualizar usage_stats
            if existing.usage_stats:
                existing.usage_stats['last_edited'] = datetime.now().isoformat()
                existing.usage_stats['edit_count'] = existing.usage_stats.get('edit_count', 0) + 1
                existing.usage_stats['update_source'] = kwargs.get('source', 'api_update')

            db.session.commit()
            return existing, 'updated'

        except Exception as e:
            # Rollback en caso de error
            existing.variables_json = old_variables
            db.session.rollback()
            raise e

    else:
        # Crear nueva sección
        section = InvitationSectionsData(
            invitation_id=invitation_id,
            section_type=section_type,
            variables_json=variables_json,
            **kwargs
        )

        db.session.add(section)
        db.session.commit()
        return section, 'created'
```

### **ERROR: `Premium Features in Basic Plan`**

**DETECCIÓN Y PREVENCIÓN:**
```python
def validate_plan_features(plan_id, variables_json):
    """Validar que las features coincidan con el plan"""

    plan = Plan.query.get(plan_id)
    if not plan:
        raise ValidationError(f"Plan {plan_id} no existe")

    # Detectar features premium en variables
    premium_features = detect_premium_features_in_variables(variables_json)

    if plan.name.lower() == 'básico' and premium_features:
        # Log del intento para analytics
        logger.warning(
            f"Usuario con plan básico intentó usar features premium",
            extra={
                'plan_id': plan_id,
                'premium_features': premium_features,
                'variables_json': variables_json
            }
        )

        # Opciones de manejo
        if STRICT_PLAN_VALIDATION:
            # Opción 1: Rechazar completamente
            raise BusinessLogicError(
                f"Plan {plan.name} no permite features premium: {', '.join(premium_features)}. "
                f"Considera upgrade a Premium."
            )
        else:
            # Opción 2: Remover features premium automáticamente
            cleaned_variables = remove_premium_features(variables_json, premium_features)
            logger.info(f"Features premium removidas automáticamente: {premium_features}")
            return cleaned_variables

    return variables_json

def detect_premium_features_in_variables(variables_json):
    """Detectar features premium en las variables"""
    premium_indicators = []

    premium_features_map = {
        'custom_colors': ['custom_colors', 'backgroundColor', 'accentColor'],
        'video_background': ['video_background', 'videoUrl', 'video_url'],
        'premium_typography': ['premium_typography', 'custom_fonts', 'fontFamily'],
        'animations': ['animated_elements', 'animation_', 'transition_'],
        'advanced_gallery': ['gallery_layout_advanced', 'lightbox_enabled'],
        'custom_css': ['custom_css', 'additional_styles']
    }

    for feature_name, indicators in premium_features_map.items():
        for indicator in indicators:
            if (indicator in variables_json or
                any(indicator in str(key) for key in variables_json.keys())):
                premium_indicators.append(feature_name)
                break

    return premium_indicators

def remove_premium_features(variables_json, premium_features):
    """Remover features premium de las variables"""
    cleaned = variables_json.copy()

    premium_keys_to_remove = {
        'custom_colors': ['custom_colors', 'backgroundColor', 'accentColor'],
        'video_background': ['video_background', 'videoUrl', 'video_url'],
        'premium_typography': ['fontFamily', 'custom_fonts'],
        'animations': ['animated_elements'],
        'custom_css': ['custom_css', 'additional_styles']
    }

    for feature in premium_features:
        if feature in premium_keys_to_remove:
            for key in premium_keys_to_remove[feature]:
                cleaned.pop(key, None)

    return cleaned
```

---

## **4️⃣ ERRORES DE PERFORMANCE Y LÍMITES**

### **ERROR: `Too Many Variables in JSON`**

**PROBLEMA:**
```python
# ❌ JSON demasiado grande (> 64KB en MySQL)
variables_json = {
    'gallery_images': [huge_array_with_1000_images],
    'description': 'very_long_text' * 1000,
    # ... más datos masivos
}
```

**SOLUCIÓN:**
```python
def validate_json_size_limits(variables_json):
    """Validar límites de tamaño del JSON"""

    # Serializar para calcular tamaño
    json_string = json.dumps(variables_json, ensure_ascii=False)
    size_bytes = len(json_string.encode('utf-8'))

    # Límites por tipo de contenido
    MAX_TOTAL_SIZE = 60 * 1024  # 60KB (buffer para MySQL 64KB limit)
    MAX_STRING_LENGTH = 5000
    MAX_ARRAY_ITEMS = 100

    if size_bytes > MAX_TOTAL_SIZE:
        raise ValidationError(
            f"JSON demasiado grande: {size_bytes} bytes. Máximo: {MAX_TOTAL_SIZE} bytes"
        )

    # Validar elementos individuales
    for key, value in variables_json.items():
        if isinstance(value, str) and len(value) > MAX_STRING_LENGTH:
            raise ValidationError(
                f"Campo '{key}' demasiado largo: {len(value)} caracteres. "
                f"Máximo: {MAX_STRING_LENGTH}"
            )

        if isinstance(value, list) and len(value) > MAX_ARRAY_ITEMS:
            raise ValidationError(
                f"Array '{key}' demasiado grande: {len(value)} elementos. "
                f"Máximo: {MAX_ARRAY_ITEMS}"
            )

    return True

# Optimización automática
def optimize_large_json(variables_json):
    """Optimizar JSON grande automáticamente"""

    optimized = {}

    for key, value in variables_json.items():
        if isinstance(value, str) and len(value) > 2000:
            # Truncar strings muy largos
            optimized[key] = value[:2000] + '...[truncado]'
            logger.warning(f"Campo '{key}' truncado por tamaño")

        elif isinstance(value, list) and len(value) > 50:
            # Limitar arrays grandes
            optimized[key] = value[:50]
            logger.warning(f"Array '{key}' limitado a 50 elementos")

        else:
            optimized[key] = value

    return optimized
```

### **ERROR: `Too Many Sections Per Invitation`**

**CONTROL DE LÍMITES:**
```python
def validate_section_limits(invitation_id, plan_id):
    """Validar límites de secciones por plan"""

    # Obtener límites del plan
    plan_limits = {
        1: {'max_sections': 8, 'max_premium_sections': 0},    # Básico
        2: {'max_sections': 20, 'max_premium_sections': 10},  # Premium
        3: {'max_sections': -1, 'max_premium_sections': -1}   # Enterprise (sin límite)
    }

    limits = plan_limits.get(plan_id, plan_limits[1])

    if limits['max_sections'] == -1:  # Sin límite
        return True

    # Contar secciones existentes
    current_count = db.session.query(InvitationSectionsData).filter_by(
        invitation_id=invitation_id
    ).count()

    if current_count >= limits['max_sections']:
        plan_name = Plan.query.get(plan_id).name
        raise BusinessLogicError(
            f"Plan {plan_name} permite máximo {limits['max_sections']} secciones. "
            f"Actualmente tienes {current_count}."
        )

    return True

# Cleanup automático de secciones antiguas
def cleanup_old_sections_if_needed(invitation_id, plan_id):
    """Limpiar secciones antiguas si se exceden límites"""

    plan_limits = get_plan_limits(plan_id)
    if plan_limits['max_sections'] == -1:
        return  # Sin límite

    current_sections = db.session.query(InvitationSectionsData).filter_by(
        invitation_id=invitation_id
    ).order_by(InvitationSectionsData.last_modified.desc()).all()

    if len(current_sections) >= plan_limits['max_sections']:
        # Remover las más antiguas
        sections_to_remove = current_sections[plan_limits['max_sections']-1:]

        for section in sections_to_remove:
            logger.info(f"Removiendo sección antigua: {section.section_type}")
            db.session.delete(section)

        db.session.commit()
        logger.info(f"Limpiadas {len(sections_to_remove)} secciones antiguas")
```

---

## **5️⃣ ERRORES DE DATOS CORRUPTOS**

### **ERROR: `Corrupted JSON Data`**

**DETECCIÓN Y REPARACIÓN:**
```python
def detect_and_repair_corrupted_data():
    """Detectar y reparar datos corruptos en el sistema"""

    corruption_report = {
        'invalid_json': [],
        'missing_required_fields': [],
        'orphaned_sections': [],
        'inconsistent_variants': []
    }

    # 1. Detectar JSON inválido
    all_sections = InvitationSectionsData.query.all()

    for section in all_sections:
        try:
            # Intentar acceder al JSON
            variables = section.variables_json
            if not isinstance(variables, dict):
                corruption_report['invalid_json'].append({
                    'section_id': section.id,
                    'section_type': section.section_type,
                    'error': 'JSON no es un diccionario'
                })
        except Exception as e:
            corruption_report['invalid_json'].append({
                'section_id': section.id,
                'section_type': section.section_type,
                'error': str(e)
            })

    # 2. Detectar campos requeridos faltantes
    required_fields_by_section = get_required_fields_map()

    for section in all_sections:
        if section.section_type in required_fields_by_section:
            required = required_fields_by_section[section.section_type]
            missing = []

            for field in required:
                if field not in section.variables_json:
                    missing.append(field)

            if missing:
                corruption_report['missing_required_fields'].append({
                    'section_id': section.id,
                    'section_type': section.section_type,
                    'missing_fields': missing
                })

    # 3. Detectar secciones huérfanas
    orphaned = db.session.query(InvitationSectionsData).outerjoin(
        Invitation, InvitationSectionsData.invitation_id == Invitation.id
    ).filter(Invitation.id.is_(None)).all()

    for section in orphaned:
        corruption_report['orphaned_sections'].append({
            'section_id': section.id,
            'invitation_id': section.invitation_id,
            'section_type': section.section_type
        })

    return corruption_report

def repair_corrupted_data(corruption_report, auto_fix=False):
    """Reparar datos corruptos detectados"""

    repair_log = []

    # 1. Reparar JSON inválido
    for corrupt in corruption_report['invalid_json']:
        if auto_fix:
            try:
                section = InvitationSectionsData.query.get(corrupt['section_id'])
                # Crear JSON básico válido
                section.variables_json = get_default_variables(section.section_type)
                db.session.commit()
                repair_log.append(f"✅ Reparado JSON inválido en sección {corrupt['section_id']}")
            except Exception as e:
                repair_log.append(f"❌ Error reparando sección {corrupt['section_id']}: {e}")
        else:
            repair_log.append(f"🔍 JSON inválido detectado en sección {corrupt['section_id']}")

    # 2. Añadir campos requeridos faltantes
    for missing_data in corruption_report['missing_required_fields']:
        if auto_fix:
            try:
                section = InvitationSectionsData.query.get(missing_data['section_id'])
                defaults = get_default_field_values(section.section_type)

                for field in missing_data['missing_fields']:
                    if field in defaults:
                        section.variables_json[field] = defaults[field]

                db.session.commit()
                repair_log.append(f"✅ Añadidos campos faltantes en sección {missing_data['section_id']}")
            except Exception as e:
                repair_log.append(f"❌ Error añadiendo campos: {e}")

    # 3. Limpiar secciones huérfanas
    for orphaned in corruption_report['orphaned_sections']:
        if auto_fix:
            try:
                section = InvitationSectionsData.query.get(orphaned['section_id'])
                db.session.delete(section)
                repair_log.append(f"🗑️ Eliminada sección huérfana {orphaned['section_id']}")
            except Exception as e:
                repair_log.append(f"❌ Error eliminando sección huérfana: {e}")

    if auto_fix:
        db.session.commit()

    return repair_log

def get_default_variables(section_type):
    """Obtener variables por defecto para un tipo de sección"""
    defaults = {
        'hero': {
            'groom_name': '',
            'bride_name': '',
            'weddingDate': '',
            'eventLocation': ''
        },
        'welcome': {
            'welcome_title': 'Bienvenidos',
            'welcome_description': ''
        },
        'gallery': {
            'sectionTitle': 'Nuestra Galería',
            'gallery_images': []
        }
    }

    return defaults.get(section_type, {'placeholder': 'default_value'})
```

---

## **🛠️ HERRAMIENTAS DE DIAGNÓSTICO**

### **SCRIPT DE DIAGNÓSTICO COMPLETO**

```python
def run_comprehensive_diagnostics():
    """Ejecutar diagnóstico completo del sistema"""

    print("🔍 INICIANDO DIAGNÓSTICO COMPLETO...")

    # 1. Integridad referencial
    print("\n1️⃣ VERIFICANDO INTEGRIDAD REFERENCIAL")

    orphaned_invitations = db.session.execute("""
        SELECT isd.invitation_id, COUNT(*) as sections_count
        FROM invitation_sections_data isd
        LEFT JOIN invitations i ON isd.invitation_id = i.id
        WHERE i.id IS NULL
        GROUP BY isd.invitation_id
    """).fetchall()

    if orphaned_invitations:
        print(f"❌ {len(orphaned_invitations)} invitaciones huérfanas encontradas")
        for row in orphaned_invitations:
            print(f"   • Invitation {row[0]}: {row[1]} secciones")
    else:
        print("✅ Integridad referencial OK")

    # 2. Duplicados
    print("\n2️⃣ VERIFICANDO DUPLICADOS")

    duplicates = db.session.execute("""
        SELECT invitation_id, section_type, COUNT(*) as count
        FROM invitation_sections_data
        GROUP BY invitation_id, section_type
        HAVING COUNT(*) > 1
    """).fetchall()

    if duplicates:
        print(f"❌ {len(duplicates)} duplicados encontrados")
        for row in duplicates:
            print(f"   • Invitation {row[0]}, Section {row[1]}: {row[2]} duplicados")
    else:
        print("✅ Sin duplicados")

    # 3. JSON inválido
    print("\n3️⃣ VERIFICANDO JSON")

    invalid_json_count = 0
    sections = InvitationSectionsData.query.limit(100).all()  # Sample

    for section in sections:
        try:
            variables = section.variables_json
            if not isinstance(variables, dict) or len(variables) == 0:
                invalid_json_count += 1
                print(f"   ❌ Sección {section.id}: JSON inválido")
        except:
            invalid_json_count += 1
            print(f"   ❌ Sección {section.id}: Error accediendo JSON")

    if invalid_json_count == 0:
        print("✅ Todos los JSON son válidos (muestra verificada)")

    # 4. Estadísticas generales
    print("\n4️⃣ ESTADÍSTICAS GENERALES")

    stats = db.session.execute("""
        SELECT
            COUNT(*) as total_sections,
            COUNT(DISTINCT invitation_id) as unique_invitations,
            COUNT(DISTINCT user_id) as unique_users,
            AVG(variables_count) as avg_complexity,
            MAX(variables_count) as max_complexity,
            MIN(variables_count) as min_complexity
        FROM invitation_sections_data
    """).fetchone()

    print(f"📊 Total secciones: {stats[0]}")
    print(f"📊 Invitaciones únicas: {stats[1]}")
    print(f"📊 Usuarios únicos: {stats[2]}")
    print(f"📊 Complejidad promedio: {stats[3]:.2f} variables")
    print(f"📊 Complejidad máxima: {stats[4]} variables")
    print(f"📊 Complejidad mínima: {stats[5]} variables")

    # 5. Uso por tipo de sección
    print("\n5️⃣ USO POR TIPO DE SECCIÓN")

    section_usage = db.session.execute("""
        SELECT section_type, COUNT(*) as usage_count
        FROM invitation_sections_data
        GROUP BY section_type
        ORDER BY usage_count DESC
    """).fetchall()

    for row in section_usage:
        print(f"   📈 {row[0]}: {row[1]} usos")

    print("\n🎉 DIAGNÓSTICO COMPLETADO")
```

### **QUERIES DE MONITOREO EN TIEMPO REAL**

```sql
-- 1. Performance Dashboard
CREATE VIEW sections_health_dashboard AS
SELECT
    DATE(created_at) as date,
    COUNT(*) as sections_created,
    AVG(variables_count) as avg_complexity,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(CASE WHEN variables_count > 20 THEN 1 ELSE 0 END) as high_complexity_count,
    COUNT(*) / COUNT(DISTINCT invitation_id) as sections_per_invitation
FROM invitation_sections_data
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 2. Error Detection Query
SELECT
    'Secciones sin invitation' as error_type,
    COUNT(*) as count
FROM invitation_sections_data isd
LEFT JOIN invitations i ON isd.invitation_id = i.id
WHERE i.id IS NULL

UNION ALL

SELECT
    'JSON probablemente corrupto' as error_type,
    COUNT(*)
FROM invitation_sections_data
WHERE JSON_VALID(JSON_QUOTE(variables_json)) = 0

UNION ALL

SELECT
    'Secciones con 0 variables' as error_type,
    COUNT(*)
FROM invitation_sections_data
WHERE variables_count = 0

UNION ALL

SELECT
    'Variables excesivas (>50)' as error_type,
    COUNT(*)
FROM invitation_sections_data
WHERE variables_count > 50;

-- 3. Plan Compliance Check
SELECT
    p.name as plan_name,
    COUNT(*) as total_sections,
    AVG(isd.variables_count) as avg_complexity,
    SUM(CASE WHEN isd.variables_count > 15 AND p.id = 1 THEN 1 ELSE 0 END) as basic_plan_violations
FROM invitation_sections_data isd
JOIN invitations i ON isd.invitation_id = i.id
JOIN plans p ON isd.plan_id = p.id
GROUP BY p.id, p.name;
```

---

## **⚡ COMANDOS DE EMERGENCIA**

### **REPARACIÓN RÁPIDA DE EMERGENCIA**

```sql
-- ⚠️ USAR SOLO EN EMERGENCIA - HACER BACKUP PRIMERO

-- 1. Eliminar secciones huérfanas
DELETE isd FROM invitation_sections_data isd
LEFT JOIN invitations i ON isd.invitation_id = i.id
WHERE i.id IS NULL;

-- 2. Corregir variables_count incorrectas
UPDATE invitation_sections_data
SET variables_count = JSON_LENGTH(variables_json)
WHERE variables_count != JSON_LENGTH(variables_json);

-- 3. Eliminar duplicados (mantener el más reciente)
DELETE t1 FROM invitation_sections_data t1
INNER JOIN invitation_sections_data t2
WHERE t1.invitation_id = t2.invitation_id
  AND t1.section_type = t2.section_type
  AND t1.id < t2.id;

-- 4. Reparar usage_stats NULL
UPDATE invitation_sections_data
SET usage_stats = JSON_OBJECT(
    'created_at', DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s'),
    'source', 'emergency_repair',
    'repaired_at', NOW()
)
WHERE usage_stats IS NULL;
```

---

## **📋 CHECKLIST DE VALIDACIÓN**

**Antes de cada registro:**

- [ ] **Invitation existe** y es válida
- [ ] **User_id** coincide con owner de invitation
- [ ] **Plan_id** existe y está activo
- [ ] **Section_type** es válido y está en lista permitida
- [ ] **Section_variant** tiene formato correcto
- [ ] **Variables_json** es dict válido y no vacío
- [ ] **JSON size** < 60KB
- [ ] **No hay duplicados** de sección
- [ ] **Features premium** coinciden con el plan
- [ ] **Límites de secciones** no se exceden
- [ ] **Campos requeridos** están presentes
- [ ] **Usage_stats** incluye metadata mínima

---

**🎯 Esta guía cubre todos los errores comunes y sus soluciones para mantener la integridad del sistema** 🛡️