# 📋 **GUÍA COMPLETA: BUENAS PRÁCTICAS PARA REGISTRO DE SECCIONES**

**Versión:** 2.0.0
**Fecha:** 24 de Enero, 2025
**Sistema:** invitation_sections_data - Analytics y Variables
**Autor:** Sistema de Documentación Técnica

---

## **🎯 OBJETIVO DE ESTA GUÍA**

Esta documentación establece las **mejores prácticas** para el registro correcto de datos en el sistema de secciones optimizado `invitation_sections_data`. Garantiza:

- ✅ **Consistencia** en el formato de datos
- ✅ **Integridad** referencial y de datos
- ✅ **Performance** optimizado para analytics
- ✅ **Escalabilidad** del sistema
- ✅ **Trazabilidad** completa para business intelligence

---

## **📊 ARQUITECTURA DEL SISTEMA**

### **TABLA PRINCIPAL: `invitation_sections_data`**

```sql
CREATE TABLE invitation_sections_data (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- TRACKING DE NEGOCIO (OBLIGATORIOS)
    invitation_id INT NOT NULL,        -- FK a invitations
    user_id INT NOT NULL,              -- FK a users (analytics por cliente)
    order_id INT,                      -- FK a orders (analytics por orden)
    plan_id INT NOT NULL,              -- FK a plans (analytics por plan)

    -- ORGANIZACIÓN POR SECCIÓN (OBLIGATORIOS)
    section_type VARCHAR(50) NOT NULL,     -- 'hero', 'gallery', 'story'
    section_variant VARCHAR(20) NOT NULL,  -- 'hero_1', 'hero_2'
    category VARCHAR(50) DEFAULT 'weddings', -- 'weddings', 'kids', 'corporate'

    -- CONTENIDO (OBLIGATORIO)
    variables_json JSON NOT NULL,          -- Variables de la sección
    variables_count INT GENERATED AS (JSON_LENGTH(variables_json)) STORED,

    -- METADATA (OPCIONALES)
    usage_stats JSON,                      -- Estadísticas de uso
    last_modified DATETIME DEFAULT NOW() ON UPDATE NOW(),
    created_at DATETIME DEFAULT NOW()
);
```

---

## **📝 LLENADO CORRECTO DE CADA COLUMNA**

### **1. CAMPOS DE TRACKING DE NEGOCIO**

#### **`invitation_id` (INT, NOT NULL)**
- **Propósito:** Identificador único de la invitación
- **Origen:** Tabla `invitations.id`
- **Validación:** DEBE existir en tabla `invitations`

```sql
-- ✅ CORRECTO
INSERT INTO invitation_sections_data (invitation_id, ...)
VALUES (123, ...);

-- ❌ INCORRECTO
INSERT INTO invitation_sections_data (invitation_id, ...)
VALUES (NULL, ...);  -- No puede ser NULL
```

#### **`user_id` (INT, NOT NULL)**
- **Propósito:** Identificador del cliente (para analytics)
- **Origen:** Tabla `users.id`
- **Uso Analytics:** Patrones de uso por cliente, segmentación
- **Validación:** DEBE existir en tabla `users`

```python
# ✅ CORRECTO - Obtener user_id de la invitación
invitation = Invitation.query.get(invitation_id)
user_id = invitation.user_id

# ❌ INCORRECTO - Hardcodear o usar NULL
user_id = None  # Incorrecto
```

#### **`order_id` (INT, NULLABLE)**
- **Propósito:** Identificador de la orden de compra
- **Origen:** Tabla `orders.id`
- **Uso Analytics:** ROI por orden, conversion tracking
- **Validación:** Si provisto, DEBE existir en tabla `orders`

```python
# ✅ CORRECTO - Puede ser None para invitaciones gratuitas
order_id = invitation.order_id  # Puede ser None

# ✅ CORRECTO - Validar si se provee
if order_id and not Order.query.get(order_id):
    raise ValueError(f"Order {order_id} no existe")
```

#### **`plan_id` (INT, NOT NULL)**
- **Propósito:** Plan de suscripción del cliente
- **Origen:** Tabla `plans.id`
- **Uso Analytics:** Análisis de features por plan, upselling
- **Validación:** DEBE existir en tabla `plans`

```python
# ✅ CORRECTO - Obtener de invitación o usuario
plan_id = invitation.plan_id or user.current_plan_id

# ❌ INCORRECTO
plan_id = 1  # Hardcodear sin validación
```

### **2. CAMPOS DE ORGANIZACIÓN**

#### **`section_type` (VARCHAR(50), NOT NULL)**
- **Propósito:** Tipo de sección (hero, gallery, etc.)
- **Formato:** snake_case, solo letras y guiones bajos
- **Valores Válidos:** Ver sección "Tipos de Secciones Válidos"

```python
# ✅ CORRECTO
section_type = "hero"
section_type = "place_ceremonia"
section_type = "birthday_child"

# ❌ INCORRECTO
section_type = "Hero"              # No CamelCase
section_type = "place-ceremonia"   # No guiones
section_type = "place ceremonia"   # No espacios
section_type = ""                  # No vacío
```

#### **`section_variant` (VARCHAR(20), NOT NULL)**
- **Propósito:** Variante específica de la sección
- **Formato:** `{section_type}_{numero}`
- **Numeración:** Empezar desde 1

```python
# ✅ CORRECTO
section_variant = "hero_1"
section_variant = "hero_2"
section_variant = "gallery_1"

# ❌ INCORRECTO
section_variant = "hero"           # Falta número
section_variant = "hero_0"         # No empezar desde 0
section_variant = "Hero_1"         # No CamelCase
```

#### **`category` (VARCHAR(50), DEFAULT 'weddings')**
- **Propósito:** Categoría del template/evento
- **Valores Válidos:** 'weddings', 'kids', 'corporate', 'quinceanos', 'baby_shower'

```python
# ✅ CORRECTO
category = "weddings"    # Default
category = "kids"
category = "corporate"

# ❌ INCORRECTO
category = "wedding"     # Singular incorrecto
category = "Wedding"     # No CamelCase
category = "bodas"       # En inglés solamente
```

### **3. CAMPO DE CONTENIDO**

#### **`variables_json` (JSON, NOT NULL)**
- **Propósito:** Almacena todas las variables de la sección
- **Formato:** Objeto JSON válido
- **Estructura:** Flat object (no nested excesivo)
- **Encoding:** UTF-8 para caracteres especiales

```python
# ✅ CORRECTO - Estructura plana y consistente
variables_json = {
    "groom_name": "Eduardo",
    "bride_name": "María",
    "weddingDate": "2025-08-15T17:00:00",
    "eventLocation": "Lima, Perú",
    "heroImageUrl": "https://example.com/image.jpg",
    "custom_colors": {
        "primary": "#D4AF37",
        "secondary": "#FFFFFF"
    }
}

# ❌ INCORRECTO - Nested excesivo o inconsistente
variables_json = {
    "data": {
        "couple": {
            "groom": {
                "personal": {
                    "name": "Eduardo"  # Demasiado nested
                }
            }
        }
    }
}
```

**Reglas para `variables_json`:**

1. **Nombres de variables:** camelCase o snake_case consistente
2. **Fechas:** Formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss`)
3. **URLs:** URLs completas con protocolo
4. **Colores:** Formato hexadecimal (#RRGGBB)
5. **Booleanos:** `true`/`false` (JSON válido)
6. **Arrays:** Para listas de elementos similares

```python
# ✅ EJEMPLOS CORRECTOS POR TIPO DE DATO

# Fechas
"weddingDate": "2025-08-15T17:00:00"
"birthdayDate": "2025-03-20"

# URLs
"heroImageUrl": "https://cdn.example.com/images/hero.jpg"
"videoUrl": "https://www.youtube.com/embed/abc123"

# Colores
"backgroundColor": "#FFB6C1"
"primary_color": "#D4AF37"

# Booleanos
"is_enabled": true
"show_ceremony": false

# Arrays
"gallery_images": [
    {"id": 1, "url": "img1.jpg", "alt": "Descripción"},
    {"id": 2, "url": "img2.jpg", "alt": "Descripción"}
]

# Números
"age": 25
"guest_count": 150
"duration_minutes": 120
```

### **4. CAMPOS DE METADATA**

#### **`usage_stats` (JSON, NULLABLE)**
- **Propósito:** Estadísticas y metadata para analytics
- **Formato:** Objeto JSON con estructura predefinida

```python
# ✅ ESTRUCTURA RECOMENDADA
usage_stats = {
    "created_at": "2025-01-24T10:30:00",
    "last_edited": "2025-01-24T15:45:00",
    "edit_count": 5,
    "source": "frontend_editor",  # frontend_editor, api, migration, script
    "editor_version": "2.1.0",
    "client_info": {
        "ip": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "country": "PE"
    },
    "feature_flags": {
        "premium_colors": true,
        "video_background": false
    },
    "performance": {
        "load_time_ms": 245,
        "save_time_ms": 89
    }
}
```

---

## **📚 TIPOS DE SECCIONES VÁLIDOS**

### **WEDDING CATEGORY**

| **Section Type** | **Descripción** | **Variantes** | **Variables Típicas** |
|------------------|-----------------|---------------|---------------------|
| `hero` | Sección principal con nombres y fecha | hero_1, hero_2, hero_3 | groom_name, bride_name, weddingDate |
| `welcome` | Mensaje de bienvenida | welcome_1, welcome_2 | welcome_title, welcome_description |
| `couple` | Información de la pareja | couple_1 | couple_bride_name, couple_groom_name |
| `story` | Historia de amor en momentos | story_1 | story_moment_1_date, story_moment_1_title |
| `gallery` | Galería de fotos | gallery_1, gallery_2 | gallery_images, sectionTitle |
| `video` | Video de la pareja | video_1 | video_videoEmbedUrl, video_title |
| `countdown` | Contador regresivo | countdown_1 | countdown_title, weddingDate |
| `itinerary` | Programa del día | itinerary_1 | itinerary_event_ceremonia_time |
| `place_religioso` | Ceremonia religiosa | place_religioso_1 | place_religioso_lugar, place_religioso_direccion |
| `place_ceremonia` | Recepción/fiesta | place_ceremonia_1 | place_ceremonia_lugar, place_ceremonia_hora |
| `vestimenta` | Código de vestimenta | vestimenta_1 | vestimenta_etiqueta, vestimenta_no_colores_info |
| `familiares` | Familia y padrinos | familiares_1 | familiares_padre_novio, familiares_madre_novia |
| `footer` | Pie de página | footer_1 | footer_copyrightText |

### **KIDS CATEGORY**

| **Section Type** | **Descripción** | **Variantes** | **Variables Típicas** |
|------------------|-----------------|---------------|---------------------|
| `party_hero` | Héroe de fiesta infantil | party_hero_1 | childName, age, birthdayDate |
| `birthday_child` | Info del cumpleañero | birthday_child_1 | childNickname, favoriteColor |
| `party_games` | Juegos y actividades | party_games_1 | game1Name, game1Description |
| `party_info` | Información práctica | party_info_1 | partyDate, partyTime, partyAddress |

---

## **🔄 FLUJO DE REGISTRO CORRECTO**

### **PASO 1: VALIDACIÓN PREVIA**

```python
def validate_section_data(invitation_id, user_id, order_id, plan_id,
                         section_type, section_variant, category, variables_json):
    """Validar datos antes del registro"""

    # 1. Validar que invitation existe
    invitation = Invitation.query.get(invitation_id)
    if not invitation:
        raise ValueError(f"Invitation {invitation_id} no existe")

    # 2. Validar que user_id coincide con la invitación
    if invitation.user_id != user_id:
        raise ValueError(f"User {user_id} no es owner de invitation {invitation_id}")

    # 3. Validar plan_id
    if not Plan.query.get(plan_id):
        raise ValueError(f"Plan {plan_id} no existe")

    # 4. Validar section_type
    if not is_valid_section_type(section_type, category):
        raise ValueError(f"Section type '{section_type}' no válido para category '{category}'")

    # 5. Validar JSON
    if not isinstance(variables_json, dict):
        raise ValueError("variables_json debe ser un objeto JSON válido")

    # 6. Validar que no existe duplicado
    existing = InvitationSectionsData.query.filter_by(
        invitation_id=invitation_id,
        section_type=section_type
    ).first()

    if existing:
        raise ValueError(f"Sección '{section_type}' ya existe para invitation {invitation_id}")

    return True
```

### **PASO 2: REGISTRO CON TRANSACCIÓN**

```python
def create_section_safely(invitation_id, user_id, order_id, plan_id,
                         section_type, section_variant, category, variables_json,
                         usage_stats=None):
    """Crear sección de manera segura con transacción"""

    try:
        # Validar datos
        validate_section_data(invitation_id, user_id, order_id, plan_id,
                            section_type, section_variant, category, variables_json)

        # Generar usage_stats si no se provee
        if not usage_stats:
            usage_stats = {
                "created_at": datetime.now().isoformat(),
                "source": "api_create",
                "initial_variables_count": len(variables_json)
            }

        # Crear registro
        section = InvitationSectionsData(
            invitation_id=invitation_id,
            user_id=user_id,
            order_id=order_id,
            plan_id=plan_id,
            section_type=section_type,
            section_variant=section_variant,
            category=category,
            variables_json=variables_json,
            usage_stats=usage_stats
        )

        db.session.add(section)
        db.session.commit()

        return section

    except Exception as e:
        db.session.rollback()
        raise e
```

### **PASO 3: ACTUALIZACIÓN SEGURA**

```python
def update_section_safely(section_id, new_variables, track_changes=True):
    """Actualizar sección existente de manera segura"""

    section = InvitationSectionsData.query.get(section_id)
    if not section:
        raise ValueError(f"Section {section_id} no existe")

    try:
        # Backup de datos anteriores
        old_variables = section.variables_json.copy()
        old_count = len(old_variables)
        new_count = len(new_variables)

        # Actualizar variables
        section.variables_json = new_variables

        # Actualizar usage_stats si se requiere tracking
        if track_changes and section.usage_stats:
            section.usage_stats['last_edited'] = datetime.now().isoformat()
            section.usage_stats['edit_count'] = section.usage_stats.get('edit_count', 0) + 1
            section.usage_stats['variables_change'] = {
                'old_count': old_count,
                'new_count': new_count,
                'delta': new_count - old_count
            }

        section.last_modified = datetime.now()
        db.session.commit()

        return section

    except Exception as e:
        db.session.rollback()
        raise e
```

---

## **⚠️ ERRORES COMUNES Y CÓMO EVITARLOS**

### **1. ERRORES DE INTEGRIDAD REFERENCIAL**

```python
# ❌ ERROR COMÚN
section = InvitationSectionsData(
    invitation_id=999,  # No existe
    user_id=123,
    # ...
)

# ✅ SOLUCIÓN
invitation = Invitation.query.get(invitation_id)
if not invitation:
    raise ValueError(f"Invitation {invitation_id} no encontrada")

section = InvitationSectionsData(
    invitation_id=invitation.id,
    user_id=invitation.user_id,  # Consistencia garantizada
    # ...
)
```

### **2. DUPLICADOS DE SECCIONES**

```python
# ❌ ERROR COMÚN - No verificar existencia
section = InvitationSectionsData(
    invitation_id=1,
    section_type="hero",  # Ya existe
    # ...
)

# ✅ SOLUCIÓN - Verificar antes de crear
existing = InvitationSectionsData.query.filter_by(
    invitation_id=1,
    section_type="hero"
).first()

if existing:
    # Actualizar existente
    existing.variables_json = new_variables
else:
    # Crear nuevo
    section = InvitationSectionsData(...)
```

### **3. JSON MALFORMADO**

```python
# ❌ ERROR COMÚN
variables_json = '{"name": "Juan"}'  # String, no dict

# ✅ SOLUCIÓN
import json
variables_json = json.loads('{"name": "Juan"}')  # Dict
# O mejor aún
variables_json = {"name": "Juan"}  # Dict directo
```

### **4. INCONSISTENCIAS EN NAMING**

```python
# ❌ INCONSISTENTE
variables = {
    "groom_name": "Juan",      # snake_case
    "brideName": "María",      # camelCase
    "wedding-date": "2025-01", # kebab-case
}

# ✅ CONSISTENTE
variables = {
    "groom_name": "Juan",
    "bride_name": "María",
    "wedding_date": "2025-01-15T17:00:00"
}
```

---

## **📊 BUENAS PRÁCTICAS PARA ANALYTICS**

### **1. USAGE_STATS ESTRUCTURADO**

```python
# ✅ ESTRUCTURA COMPLETA PARA ANALYTICS
usage_stats = {
    # Timestamps
    "created_at": "2025-01-24T10:30:00",
    "last_edited": "2025-01-24T15:45:00",

    # Contadores
    "edit_count": 5,
    "view_count": 23,
    "save_count": 5,

    # Metadata técnica
    "source": "frontend_editor",
    "editor_version": "2.1.0",
    "api_version": "1.0",

    # Analytics de negocio
    "premium_features_used": ["custom_colors", "video_background"],
    "completion_percentage": 85,
    "complexity_score": 0.75,

    # Context de usuario
    "client_info": {
        "ip": "192.168.1.100",
        "country": "PE",
        "device": "desktop"
    }
}
```

### **2. QUERIES OPTIMIZADOS**

```sql
-- ✅ Query eficiente para analytics
SELECT
    section_type,
    COUNT(*) as usage_count,
    AVG(variables_count) as avg_complexity,
    COUNT(DISTINCT user_id) as unique_users
FROM invitation_sections_data
WHERE category = 'weddings'
  AND created_at >= '2025-01-01'
GROUP BY section_type
ORDER BY usage_count DESC;

-- ✅ Analytics por plan
SELECT
    p.name as plan_name,
    isd.section_type,
    AVG(isd.variables_count) as avg_variables,
    JSON_EXTRACT(isd.usage_stats, '$.premium_features_used') as premium_features
FROM invitation_sections_data isd
JOIN plans p ON isd.plan_id = p.id
WHERE isd.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY p.id, isd.section_type;
```

---

## **🔧 HERRAMIENTAS Y SCRIPTS DE AYUDA**

### **1. SCRIPT DE VALIDACIÓN**

```bash
# Validar integridad de datos
python scripts/validate_sections_data.py --check-all

# Validar sección específica
python scripts/validate_sections_data.py --section-id 123

# Reparar inconsistencias
python scripts/validate_sections_data.py --repair --dry-run
```

### **2. COMANDOS SQL DE MANTENIMIENTO**

```sql
-- Verificar consistencia de datos
SELECT
    'Secciones sin invitation' as issue,
    COUNT(*) as count
FROM invitation_sections_data isd
LEFT JOIN invitations i ON isd.invitation_id = i.id
WHERE i.id IS NULL

UNION ALL

SELECT
    'Secciones sin usuario' as issue,
    COUNT(*)
FROM invitation_sections_data isd
LEFT JOIN users u ON isd.user_id = u.id
WHERE u.id IS NULL;

-- Limpiar secciones huérfanas
DELETE isd FROM invitation_sections_data isd
LEFT JOIN invitations i ON isd.invitation_id = i.id
WHERE i.id IS NULL;
```

---

## **📈 MÉTRICAS Y MONITOREO**

### **ALERTAS AUTOMÁTICAS**

1. **Integridad:** Secciones huérfanas > 0
2. **Performance:** Variables_count promedio > 50
3. **Errores:** Fallas de JSON parsing > 5%
4. **Negocio:** Secciones premium en planes básicos

### **DASHBOARD RECOMENDADO**

```sql
-- Métricas clave para dashboard
CREATE VIEW sections_dashboard AS
SELECT
    DATE(created_at) as date,
    category,
    section_type,
    COUNT(*) as total_created,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(variables_count) as avg_complexity,
    SUM(CASE WHEN plan_id > 1 THEN 1 ELSE 0 END) as premium_usage
FROM invitation_sections_data
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at), category, section_type;
```

---

## **🎯 CHECKLIST FINAL**

Antes de registrar una nueva sección, verificar:

- [ ] **Invitation existe** y es accesible por el usuario
- [ ] **User_id coincide** con el owner de la invitación
- [ ] **Plan_id es válido** y está activo
- [ ] **Section_type** es válido para la categoría
- [ ] **Section_variant** sigue formato correcto
- [ ] **Variables_json** es válido y bien estructurado
- [ ] **No existe duplicado** de la sección
- [ ] **Usage_stats** incluye metadata relevante
- [ ] **Transacción** maneja errores apropiadamente

---

**📚 DOCUMENTACIÓN RELACIONADA:**
- `/docs/secciones/Secciones_wedding.md` - Variables wedding
- `/docs/secciones/Secciones_kids.md` - Variables kids
- `/docs/secciones/basededatos_secciones.md` - Arquitectura
- `/backend/models/invitation_sections_data.py` - Modelo SQLAlchemy

---

**✨ Esta guía garantiza la consistencia, integridad y performance del sistema de secciones para analytics avanzados** 🚀