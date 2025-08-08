# Issues Frontend - Semana 5

## 16. [FRONTEND] Diseño responsive completo
**Prioridad:** Alta
**Etiquetas:** frontend, UI, responsive
**Descripción:**
- Ajustar todos los componentes para móvil/tablet
- Breakpoints: 320px, 768px, 1024px, 1440px
- Menú hamburguesa funcional
- Optimizar imágenes por dispositivo

**Criterios de aceptación:**
- [ ] Sin scroll horizontal
- [ ] Textos legibles en todos los tamaños
- [ ] Touch targets mínimo 44x44px
- [ ] Imágenes responsive

---

## 17. [FRONTEND] Implementar internacionalización (i18n)
**Prioridad:** Alta
**Etiquetas:** frontend, i18n, localization
**Descripción:**
- Configurar sistema i18n (ES/EN)
- Traducir todos los textos estáticos
- Persistir idioma seleccionado
- Cambio de idioma sin recargar

**Criterios de aceptación:**
- [ ] Todos los textos traducidos
- [ ] Selector de idioma funcional
- [ ] Fechas y monedas localizadas
- [ ] URLs amigables por idioma

---

## 18. [FRONTEND] Accesibilidad WCAG 2.1
**Prioridad:** Media
**Etiquetas:** frontend, a11y, accessibility
**Descripción:**
- Auditar y corregir contrastes de color
- Añadir ARIA labels donde corresponda
- Navegación completa por teclado
- Skip links y focus visible

**Criterios de aceptación:**
- [ ] Contraste mínimo 4.5:1
- [ ] Tab order lógico
- [ ] Screen reader compatible
- [ ] Sin errores en axe DevTools

---

## 19. [FRONTEND] Optimización de performance
**Prioridad:** Media
**Etiquetas:** frontend, performance, optimization
**Descripción:**
- Implementar lazy loading de componentes
- Optimizar bundle size
- Comprimir imágenes (WebP)
- Implementar cache estratégico

**Criterios de aceptación:**
- [ ] Lighthouse score > 90
- [ ] FCP < 2s
- [ ] TTI < 3.5s
- [ ] Bundle < 200KB inicial

---

## 20. [FRONTEND] PWA básica
**Prioridad:** Baja
**Etiquetas:** frontend, PWA, mobile
**Descripción:**
- Añadir manifest.json
- Service worker para cache offline
- Instalable en dispositivos
- Splash screen personalizado

**Criterios de aceptación:**
- [ ] Instalable desde browser
- [ ] Funciona offline (cache)
- [ ] Icono y splash screen
- [ ] Push notifications ready