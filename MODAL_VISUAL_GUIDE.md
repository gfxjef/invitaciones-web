# Guía Visual del Modal PlanSelector

## 🎨 Comportamiento Visual

### Estado Inicial: ShareURLModal
```
┌────────────────────────────────────────┐
│  Compartir Invitación                  │
├────────────────────────────────────────┤
│                                        │
│  Opción Básica                         │
│  [URL normal...]  [Copiar]             │
│                                        │
│  Opción Premium                        │
│  [Preview URL...] [🔓 Desbloquear]     │ ← Usuario hace clic aquí
│                                        │
└────────────────────────────────────────┘
```

### Usuario hace clic en "Desbloquear"

#### ⬇️ Se abre PlanSelector como modal flotante

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  FONDO NEGRO CON 50% DE TRANSPARENCIA (bg-black/50)          │
│  ═══════════════════════════════════════════════════════════  │
│                                                     [X]       │ ← Botón cerrar
│     ┌─────────────────────────────────────────────────┐      │
│     │                                                 │      │
│     │        Elige el plan perfecto                   │      │
│     │  Crea invitaciones digitales inolvidables      │      │
│     │                                                 │      │
│     │  ┌──────────────┐  ┌──────────────────────┐    │      │
│     │  │ Plan Básico  │  │  Plan Premium ⭐    │    │      │
│     │  │              │  │  (Recomendado)      │    │      │
│     │  │  S/ 99       │  │                     │    │      │
│     │  │              │  │  S/ 140             │    │      │
│     │  │  ✓ 1 edición │  │  ✓ 3 ediciones ⚡   │    │      │
│     │  │  ✓ PDF       │  │  ✓ PDF              │    │      │
│     │  │  ✓ Link      │  │  ✓ Link corto ⚡     │    │      │
│     │  │  ✓ Countdown │  │  ✓ QR diseño ⚡      │    │      │
│     │  │  ✓ Locación  │  │  ✓ Estadísticas ⚡  │    │      │
│     │  │  ✓ WhatsApp  │  │                     │    │      │
│     │  │              │  │  [✓ Plan            │    │      │
│     │  │ [Seleccionar]│  │   Seleccionado] ←───┼────┼──── Usuario hace clic
│     │  └──────────────┘  └──────────────────────┘    │      │
│     │                                                 │      │
│     │   Pago seguro con: Izipay | Yape | Visa       │      │
│     │                                                 │      │
│     └─────────────────────────────────────────────────┘      │
│                                                               │
│  EL CONTENIDO FLOTA SOBRE EL OVERLAY TRANSPARENTE            │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Características del Modal Flotante:

#### 1. **Overlay (Fondo)**
```css
/* Cubre TODA la pantalla */
position: fixed;
inset: 0; /* top: 0, right: 0, bottom: 0, left: 0 */
background: rgba(0, 0, 0, 0.5); /* Negro al 50% */
z-index: 50;
```

#### 2. **Contenido Centrado**
```css
/* Centrado vertical y horizontalmente */
position: fixed;
inset: 0;
display: flex;
align-items: center; /* Centrado vertical */
justify-content: center; /* Centrado horizontal */
padding: 1rem; /* Espaciado en móviles */
overflow-y: auto; /* Scroll si es necesario */
```

#### 3. **Contenedor del PlanSelector**
```css
/* Sin restricciones de tamaño fijo */
width: 100%;
max-width: 7xl; /* 80rem / 1280px */
/* Se adapta al contenido */
```

#### 4. **Botón Cerrar (X)**
```css
/* Esquina superior derecha */
position: absolute;
right: 1.5rem;
top: 1.5rem;
z-index: 60; /* Por encima del contenido */
background: rgba(255, 255, 255, 0.1); /* Fondo semi-transparente */
color: white;
```

## 🔄 Flujo de Interacción

### Paso 1: Usuario en ShareURLModal
```
Usuario → Ve "Opción Premium"
       → Click "Desbloquear"
```

### Paso 2: Se abre PlanSelector Modal
```
Sistema → Cierra ShareURLModal (temporalmente)
       → Abre overlay negro 50% transparente
       → Muestra PlanSelector flotante centrado
       → Plan Premium pre-seleccionado
```

### Paso 3: Usuario selecciona Premium
```
Usuario → Ve botón "✓ Plan Seleccionado" (verde)
       → Click en el botón
```

### Paso 4: Se genera Short URL
```
Sistema → Cierra PlanSelector Modal
       → Ejecuta handlePremiumUnlocked()
       → Genera short URL en backend
       → Muestra toast "URL personalizada generada"
       → Regresa a ShareURLModal con URL generada
```

## 📐 Responsividad

### Desktop (1920x1080)
```
┌────────────────────────────────────────────────┐
│        Overlay 50% transparente                │
│                                                │
│    ┌──────────────────────────────────┐       │
│    │  PlanSelector (max-w-7xl)        │       │
│    │  Centrado perfectamente          │       │
│    │  Ambos planes lado a lado        │       │
│    └──────────────────────────────────┘       │
│                                                │
└────────────────────────────────────────────────┘
```

### Tablet (768x1024)
```
┌──────────────────────────┐
│  Overlay 50%             │
│                          │
│  ┌──────────────────┐    │
│  │ PlanSelector     │    │
│  │ Planes lado a    │    │
│  │ lado (apretados) │    │
│  └──────────────────┘    │
│                          │
└──────────────────────────┘
```

### Mobile (375x667)
```
┌─────────────────┐
│ Overlay 50%     │
│                 │
│ ┌─────────────┐ │
│ │ PlanSelector│ │
│ │ Scroll ↕    │ │
│ │ Planes      │ │
│ │ apilados    │ │
│ └─────────────┘ │
│                 │
└─────────────────┘
```

## 🎯 Elementos Clave Implementados

### ✅ 1. Overlay Transparente al 50%
```tsx
<DialogOverlay className="bg-black/50" />
```
- Fondo negro con 50% de opacidad
- Cubre toda la pantalla
- Permite ver contenido detrás (difuso)

### ✅ 2. Contenido Sin Restricciones
```tsx
<DialogPrimitive.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
  <div className="w-full max-w-7xl">
    {content}
  </div>
</DialogPrimitive.Content>
```
- No tiene `max-w-lg` ni tamaños fijos
- Se adapta al contenido real del PlanSelector
- Centrado perfectamente

### ✅ 3. Botón Cerrar Flotante
```tsx
<DialogPrimitive.Close className="absolute right-6 top-6 ... bg-white/10 hover:bg-white/20">
  <svg><!-- X icon --></svg>
</DialogPrimitive.Close>
```
- Posición fija en esquina
- Fondo semi-transparente blanco
- Hover effect

### ✅ 4. Prevención de Cierre Accidental
```tsx
onPointerDownOutside={(e) => e.preventDefault()}
```
- Usuario NO puede cerrar haciendo clic fuera
- Solo con botón X o ESC

## 🎨 Capas (Z-Index)

```
Z-50:  Overlay negro 50%
Z-50:  Contenido del modal (PlanSelector)
Z-60:  Botón cerrar (X)
```

## 🔧 Código Implementado

### PlanSelector.tsx - Sección Modal
```typescript
if (asModal && onClose) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        {/* Overlay con 50% de transparencia */}
        <DialogOverlay className="bg-black/50" />

        {/* Contenido centrado sin restricciones de tamaño */}
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="w-full max-w-7xl">
            {content} {/* Todo el diseño de PlanSelector */}
          </div>

          {/* Botón de cerrar (X) */}
          <DialogPrimitive.Close className="absolute right-6 top-6 ...">
            <svg><!-- X icon --></svg>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
```

## 📱 Experiencia de Usuario

### Estado 1: Inicial
```
[Invitaciones List] → Click "Copiar URL" → [ShareURLModal se abre]
```

### Estado 2: Desbloqueo
```
[ShareURLModal] → Click "Desbloquear" → [Overlay 50% aparece]
                                     → [PlanSelector flota centrado]
```

### Estado 3: Selección
```
[PlanSelector Modal] → Click "✓ Plan Seleccionado"
                    → [Modal se cierra]
                    → [Genera short URL]
                    → [Toast aparece]
```

### Estado 4: Completado
```
[ShareURLModal reaparece] → URL Premium generada
                         → Botón cambia a "Copiar"
                         → Usuario puede copiar
```

## 🎭 Comparación: Antes vs Ahora

### ANTES (Incorrecto) ❌
```
- Modal con tamaño fijo (max-w-lg)
- No overlay visible o mal configurado
- Contenido restringido
- Parece una caja pequeña
```

### AHORA (Correcto) ✅
```
- Modal flotante sobre TODO
- Overlay negro 50% transparente
- Contenido se adapta (max-w-7xl)
- Parece un modal profesional
- Centrado perfecto
- Botón X visible
```

## 🚀 Cómo Probar

1. **Abrir navegador**: `http://localhost:3000/mi-cuenta/invitaciones`
2. **Click "Copiar URL"** en cualquier invitación
3. **Click "Desbloquear"** en sección Premium
4. **Verificar**:
   - ✅ Fondo negro semi-transparente (50%)
   - ✅ PlanSelector flotante centrado
   - ✅ Se ve TODO el contenido
   - ✅ Botón X en esquina superior derecha
   - ✅ No se puede cerrar haciendo clic fuera
5. **Click "✓ Plan Seleccionado"**
6. **Verificar**:
   - ✅ Modal se cierra
   - ✅ Toast de éxito
   - ✅ URL generada aparece

---

**Implementado**: 2025-10-12
**Estado**: ✅ Completo
**Visual**: Modal flotante con overlay 50% transparente
