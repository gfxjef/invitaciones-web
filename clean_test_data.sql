-- ========================================
-- SCRIPT DE LIMPIEZA DE DATOS DE PRUEBA
-- ========================================
-- PRECAUCIÓN: Este script ELIMINA TODOS los datos de prueba
-- Ejecutar solo si quieres empezar completamente de cero
-- ========================================

-- Desactivar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- 1. LIMPIAR TABLAS DE VARIABLES Y SECCIONES
TRUNCATE TABLE invitation_data;
TRUNCATE TABLE invitation_sections_data;

-- 2. LIMPIAR MULTIMEDIA
TRUNCATE TABLE invitation_media;

-- 3. LIMPIAR EVENTOS
TRUNCATE TABLE invitation_events;

-- 4. LIMPIAR RESPUESTAS Y CONFIRMACIONES
TRUNCATE TABLE invitation_responses;
TRUNCATE TABLE confirmations;

-- 5. LIMPIAR INVITADOS
TRUNCATE TABLE guests;

-- 6. LIMPIAR URLs
TRUNCATE TABLE invitation_urls;

-- 7. LIMPIAR INVITACIONES
DELETE FROM invitations;
ALTER TABLE invitations AUTO_INCREMENT = 1;

-- 8. OPCIONAL: Limpiar órdenes y carritos de prueba
-- TRUNCATE TABLE order_items;
-- TRUNCATE TABLE orders;
-- TRUNCATE TABLE cart_items;
-- TRUNCATE TABLE carts;

-- Reactivar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- VERIFICAR QUE TODO ESTÁ LIMPIO
SELECT 'invitation_data' as tabla, COUNT(*) as registros FROM invitation_data
UNION ALL
SELECT 'invitation_sections_data', COUNT(*) FROM invitation_sections_data
UNION ALL
SELECT 'invitations', COUNT(*) FROM invitations
UNION ALL
SELECT 'invitation_events', COUNT(*) FROM invitation_events
UNION ALL
SELECT 'invitation_media', COUNT(*) FROM invitation_media;