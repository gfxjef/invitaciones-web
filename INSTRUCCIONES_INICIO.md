# 🚀 Instrucciones para Iniciar el Sistema

## Estado Actual: SERVICIOS DETENIDOS

**Análisis de Puertos:**
- ❌ Puerto 5000 (Backend Flask): **NO ESTÁ EN USO**
- ❌ Puerto 3000 (Frontend Next.js): **NO ESTÁ EN USO**

**Por eso ves:** "Error cargando pedidos" y "No hay pedidos"

---

## ✅ Solución: Iniciar Ambos Servicios

### 1️⃣ Iniciar Backend (Flask)

Abre una **terminal nueva** y ejecuta:

```bash
cd "C:\Users\USER\Desktop\python projects\invitaciones_web\backend"
venv\Scripts\activate
python app.py
```

**Deberías ver:**
```
 * Running on http://127.0.0.1:5000
 * Running on http://localhost:5000
```

---

### 2️⃣ Iniciar Frontend (Next.js)

Abre **otra terminal nueva** y ejecuta:

```bash
cd "C:\Users\USER\Desktop\python projects\invitaciones_web\frontend"
npm run dev
```

**Deberías ver:**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
```

---

## 🧪 Verificar que Funciona

### Prueba 1: Backend Responde
```bash
curl http://localhost:5000/api/health
```
Debe devolver `{"status": "ok"}`

### Prueba 2: Login Funciona
```bash
cd backend
venv\Scripts\python.exe test_orders_performance.py
```

Debe mostrar:
```
✅ Login successful (3-5s)
✅ Orders fetched (3-4s)
   Orders count: 131
```

### Prueba 3: Frontend Carga
Abre en el navegador:
```
http://localhost:3000/mi-cuenta/pedidos
```

Haz login con:
- **Email:** gfxjef@gmail.com
- **Password:** TestPassword123

**Deberías ver:** 131 pedidos del usuario

---

## 🔧 Cambios Realizados (Ya Aplicados)

### Backend Optimizado
- ✅ Consultas SQL optimizadas: 132 queries → 2 queries
- ✅ Tiempo de respuesta: Timeout (>10s) → 3-4 segundos
- ✅ Endpoint funcionando correctamente

### Frontend Conectado
- ✅ Eliminados datos mock hardcodeados
- ✅ Conectado a API real del backend
- ✅ Mapeo de estados correcto (PAID → completed, etc.)
- ✅ Error de TypeScript corregido

---

## ⚠️ Problemas Comunes

### "Error cargando pedidos"
**Causa:** Backend no está corriendo
**Solución:** Ejecuta paso 1️⃣

### "0 pedidos realizados"
**Causa:** Frontend no conectado al backend
**Solución:** Ejecuta pasos 1️⃣ y 2️⃣, luego recarga la página

### Timeout después de 10 segundos
**Causa:** Backend está colgado
**Solución:** Mata el proceso y reinicia:
```bash
# En Windows
tasklist | findstr python
taskkill /F /PID [número_de_PID]
# Luego ejecuta paso 1️⃣ de nuevo
```

---

## 📊 Performance Esperado

Con los cambios aplicados:

| Métrica | Antes | Después |
|---------|-------|---------|
| Queries SQL | 132 | 2 |
| Tiempo Login | 5s | 3-5s |
| Tiempo Orders | >10s (timeout) | 3-4s |
| Pedidos mostrados | 0 (mock) | 131 (reales) |

---

## 🎯 Verificación Final

Cuando ambos servicios estén corriendo, verifica en el navegador:

1. **Ir a:** http://localhost:3000/mi-cuenta/pedidos
2. **Login:** gfxjef@gmail.com / TestPassword123
3. **Esperar:** 3-4 segundos
4. **Resultado:** Deberías ver 131 pedidos con:
   - Números de orden (ORD-XXXXXXXXXX)
   - Estados (Completado, Pendiente, Cancelado)
   - Totales en PEN (Soles peruanos)
   - Productos (Nuestra Boda, etc.)
   - Filtros y búsqueda funcionando

---

**Última actualización:** 2025-10-03
**Archivos modificados:**
- `backend/api/orders.py` - Optimización N+1 query
- `frontend/src/app/mi-cuenta/pedidos/page.tsx` - Conexión API real
- `frontend/src/app/invitacion/[id]/page.tsx` - Fix TypeScript
