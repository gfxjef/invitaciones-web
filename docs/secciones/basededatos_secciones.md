 🎯 SISTEMA DE RASTREO Y ANALYTICS DE VARIABLES

  💡 TU VISIÓN ESTRATÉGICA

  Tienes razón - es GENIAL para business intelligence:

  CLIENT ORDER → VARIABLES USED → ANALYTICS → INSIGHTS → OPTIMIZATION

  🗄️ ARQUITECTURA PROPUESTA

  1. TABLA OPTIMIZADA: invitation_sections_data

  CREATE TABLE invitation_sections_data (
      id INT AUTO_INCREMENT PRIMARY KEY,

      -- TRACKING DE NEGOCIO 🎯
      invitation_id INT NOT NULL,
      user_id INT NOT NULL,              -- Para analytics por cliente
      order_id INT,                      -- Para analytics por orden
      plan_id INT NOT NULL,              -- Para analytics por plan

      -- ORGANIZACIÓN POR SECCIÓN 📋
      section_type VARCHAR(50) NOT NULL,     -- 'hero', 'gallery', 'story'
      section_variant VARCHAR(20) NOT NULL,  -- 'hero_1', 'hero_2'
      category VARCHAR(50) NOT NULL,         -- 'weddings', 'kids', 'corporate'

      -- DATA EN JSON (OPTIMIZADO) 🚀
      variables_json JSON NOT NULL,          -- Todas las variables de la sección
      variables_count INT GENERATED ALWAYS AS (JSON_LENGTH(variables_json)) STORED,

      -- METADATA ANALYTICS 📊
      usage_stats JSON,                      -- Estadísticas de uso
      last_modified DATETIME DEFAULT NOW() ON UPDATE NOW(),
      created_at DATETIME DEFAULT NOW(),

      -- INDICES OPTIMIZADOS
      FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (plan_id) REFERENCES plans(id),

      INDEX idx_user_analytics (user_id, plan_id, category),
      INDEX idx_order_analytics (order_id, section_type),
      INDEX idx_section_analytics (section_type, section_variant, category),
      INDEX idx_variables_count (variables_count, section_type),
      UNIQUE KEY unique_invitation_section (invitation_id, section_type)
  );

  📊 EJEMPLOS DE DATA ANALYTICS

  EJEMPLO 1: Usuario de Plan Premium - Wedding

  {
    "invitation_id": 1234,
    "user_id": 567,
    "order_id": 890,
    "plan_id": 2,
    "section_type": "hero",
    "section_variant": "hero_2",
    "category": "weddings",
    "variables_json": {
      "groom_name": "Carlos",
      "bride_name": "Ana",
      "weddingDate": "2024-12-15T17:00:00",
      "eventLocation": "Lima, Perú",
      "heroImageUrl": "https://...",
      "custom_colors": {"primary": "#D4AF37", "secondary": "#FFFFFF"}
    },
    "variables_count": 6,
    "usage_stats": {
      "sections_used": ["hero", "gallery", "story", "itinerary"],
      "total_customizations": 23,
      "premium_features": ["custom_colors", "video_background"]
    }
  }

  EJEMPLO 2: Usuario Basic - Kids Birthday

  {
    "invitation_id": 5678,
    "user_id": 999,
    "order_id": 1111,
    "plan_id": 1,
    "section_type": "party-hero",
    "section_variant": "party-hero_1",
    "category": "kids",
    "variables_json": {
      "childName": "Sofia",
      "age": 5,
      "birthdayDate": "2024-10-20",
      "partyTheme": "Princesas",
      "backgroundColor": "#FFB6C1"
    },
    "variables_count": 5,
    "usage_stats": {
      "sections_used": ["party-hero", "birthday-child"],
      "total_customizations": 8,
      "premium_features": []
    }
  }

  🔍 QUERIES DE ANALYTICS PODEROSAS

  1. Variables más usadas por sección:

  SELECT
      section_type,
      section_variant,
      JSON_KEYS(variables_json) as used_variables,
      COUNT(*) as usage_count,
      AVG(variables_count) as avg_variables_per_user
  FROM invitation_sections_data
  GROUP BY section_type, section_variant
  ORDER BY usage_count DESC;

  2. Análisis por plan (qué usan más los premium vs básicos):

  SELECT
      p.name as plan_name,
      isd.section_type,
      AVG(isd.variables_count) as avg_customizations,
      COUNT(DISTINCT isd.user_id) as unique_users,
      JSON_EXTRACT(isd.usage_stats, '$.premium_features') as premium_features_used
  FROM invitation_sections_data isd
  JOIN plans p ON isd.plan_id = p.id
  GROUP BY p.id, isd.section_type;

  3. Comportamiento por categoría:

  SELECT
      category,
      section_type,
      COUNT(*) as total_usage,
      COUNT(DISTINCT user_id) as unique_users,
      AVG(variables_count) as complexity_score
  FROM invitation_sections_data
  GROUP BY category, section_type
  ORDER BY total_usage DESC;

  📈 INSIGHTS QUE PODRÍAS OBTENER

  🎯 PARA PRODUCT MANAGEMENT:

  - ¿Qué secciones usan MÁS los usuarios?
  - ¿Qué variables NUNCA se personalizan? (candidatas a eliminar)
  - ¿Los usuarios Premium usan realmente más features?
  - ¿Qué combinaciones de secciones son populares?

  💰 PARA BUSINESS STRATEGY:

  - ROI de cada feature por plan
  - Conversión de Basic a Premium based en usage
  - Variables que justifican precio Premium
  - Patrones de uso por demografía

  🚀 PARA DEVELOPMENT:

  - Performance optimization (cachear secciones populares)
  - A/B testing de nuevas variables
  - Predecir qué features desarrollar próximamente

  ⚡ OPTIMIZACIONES DE PERFORMANCE

  1. JSON Indexing (MySQL 8.0+):

  -- Index en variables específicas más buscadas
  ALTER TABLE invitation_sections_data
  ADD INDEX idx_groom_name ((CAST(variables_json->>'$.groom_name' AS CHAR(100))));

  ALTER TABLE invitation_sections_data
  ADD INDEX idx_wedding_date ((CAST(variables_json->>'$.weddingDate' AS DATETIME)));

  2. Queries optimizadas con JSON:

  -- Buscar invitaciones por nombre del novio
  SELECT * FROM invitation_sections_data
  WHERE variables_json->>'$.groom_name' = 'Carlos';

  -- Estadísticas de uso de colores personalizados
  SELECT
      variables_json->>'$.custom_colors.primary' as primary_color,
      COUNT(*) as usage_count
  FROM invitation_sections_data
  WHERE JSON_EXTRACT(variables_json, '$.custom_colors') IS NOT NULL
  GROUP BY primary_color;

● 🎭 MIGRACIÓN DE SISTEMA ACTUAL

  PASO 1: Migrar de invitation_data a invitation_sections_data

  -- Script de migración
  INSERT INTO invitation_sections_data (
      invitation_id, user_id, order_id, plan_id,
      section_type, section_variant, category,
      variables_json, usage_stats
  )
  SELECT
      id.invitation_id,
      i.user_id,
      i.order_id,
      i.plan_id,
      id.field_category as section_type,
      CONCAT(id.field_category, '_1') as section_variant,
      'weddings' as category,
      JSON_OBJECT(
          GROUP_CONCAT(id.field_name),
          GROUP_CONCAT(id.field_value)
      ) as variables_json,
      JSON_OBJECT(
          'migration_date', NOW(),
          'source', 'invitation_data_migration'
      ) as usage_stats
  FROM invitation_data id
  JOIN invitations i ON id.invitation_id = i.id
  GROUP BY id.invitation_id, id.field_category;

  💎 VALOR AGREGADO PARA TU NEGOCIO

  1. PERSONALIZATION ENGINE:

  -- Sugerir secciones basadas en uso popular
  SELECT section_type, section_variant
  FROM invitation_sections_data
  WHERE plan_id = ? AND category = ?
  GROUP BY section_type, section_variant
  ORDER BY COUNT(*) DESC
  LIMIT 5;

  2. UPSELLING INTELIGENTE:

  -- Usuarios básicos que usan muchas variables (candidatos a Premium)
  SELECT user_id, AVG(variables_count) as complexity_score
  FROM invitation_sections_data
  WHERE plan_id = 1 -- Basic plan
  GROUP BY user_id
  HAVING complexity_score > 10
  ORDER BY complexity_score DESC;

  3. FEATURE DEPRECATION:

  -- Variables que nadie usa en 6 meses (candidatas a eliminar)
  SELECT
      section_type,
      JSON_KEYS(variables_json) as unused_variables
  FROM invitation_sections_data
  WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
  GROUP BY section_type
  HAVING COUNT(*) < 5;
