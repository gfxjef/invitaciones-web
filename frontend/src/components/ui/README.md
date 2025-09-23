# UI Components Documentation

## MultiImageGalleryPicker

Componente avanzado para selección múltiple de imágenes con interfaz de galería 3x3. Permite a los usuarios subir, previsualizar y gestionar hasta 9 imágenes con funcionalidad drag & drop.

### 🎯 Características Principales

- **Grid 3x3**: Layout optimizado para hasta 9 imágenes
- **Drag & Drop**: Subida intuitiva arrastrando archivos
- **Vista previa inmediata**: Blob URLs para previsualización sin servidor
- **Eliminación segura**: Gestión robusta de memoria con cleanup automático
- **Integración completa**: Conectado con file manager de Zustand
- **Validación defensiva**: Manejo robusto de errores y datos incompletos

### 📝 Uso Básico

```typescript
import { MultiImageGalleryPicker } from '@/components/ui/MultiImageGalleryPicker';

interface GalleryImage {
  url: string;
  alt?: string;
  category?: string;
  file?: File;
  id: string;
}

function MyComponent() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  return (
    <MultiImageGalleryPicker
      value={images}
      onChange={setImages}
      fieldKey="my_gallery"
      label="Selecciona tus fotos"
      maxImages={9}
    />
  );
}
```

### 🔧 Props Interface

```typescript
interface MultiImageGalleryPickerProps {
  value?: GalleryImage[];           // Array de imágenes actuales
  onChange: (images: GalleryImage[]) => void; // Callback cuando cambian las imágenes
  fieldKey?: string;                // Identificador único para file storage
  label?: string;                   // Label del componente
  maxImages?: number;               // Máximo de imágenes (default: 9)
  disabled?: boolean;               // Estado deshabilitado
  className?: string;               // Clases CSS adicionales
}
```

### 🎨 Estados de UI

#### Estado Vacío
```jsx
// Muestra área de drop con icono de cámara y texto instructivo
<div className="border-dashed border-gray-300 p-12">
  <Camera className="mx-auto h-16 w-16 text-gray-400" />
  <p>Selecciona tus fotos</p>
  <p>Arrastra y suelta o haz clic para seleccionar hasta 9 imágenes</p>
</div>
```

#### Estado Con Imágenes
```jsx
// Grid 3x3 con imágenes y botón "Agregar más"
<div className="grid grid-cols-3 gap-3">
  {images.map(image => (
    <div key={image.id} className="relative aspect-square">
      <img src={image.url} alt={image.alt} />
      <button onClick={() => handleRemove(image.id)}>
        <X size={16} />
      </button>
    </div>
  ))}
  {canAddMore && <AddMoreButton />}
</div>
```

### 🔄 Integración con File Manager

El componente se integra automáticamente con el file manager de Zustand:

```typescript
// Storage automático de archivos
fileManager.setFile(`${fieldKey}_${imageId}`, file, objectURL);

// Limpieza automática al eliminar
fileManager.removeFile(`${fieldKey}_${imageId}`);
```

### 🛡️ Validación y Manejo de Errores

#### Validación Defensiva
```typescript
// En handleRemoveImage - protección contra URLs undefined
if (imageToRemove.url && typeof imageToRemove.url === 'string' && imageToRemove.url.startsWith('blob:')) {
  URL.revokeObjectURL(imageToRemove.url);
} else {
  console.warn('Image URL is invalid or not a blob:', imageToRemove.url);
}
```

#### Validación de Imágenes Externas
```typescript
// En useEffect - filtrado de imágenes con URLs inválidas
const validImages = value.filter((img, index) => {
  if (!img.url || typeof img.url !== 'string') {
    console.warn(`Image at index ${index} has invalid URL:`, img);
    return false;
  }
  return true;
});
```

### 🎬 Animaciones

Utiliza Framer Motion para animaciones fluidas:

```typescript
// Animación de entrada para imágenes
const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

// Animación staggered para el contenedor
const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

### 📱 Responsive Design

- **Desktop**: Grid 3x3 completo con gaps amplios
- **Tablet**: Grid 3x3 con gaps reducidos
- **Mobile**: Grid optimizado para pantallas pequeñas

### 🐛 Debugging y Logs

El componente incluye logging detallado para debugging:

```typescript
console.log('🚨 External value changed:', value);
console.log('🚨 Valid images after filtering:', validImages);
console.log('🚨 Removing image:', { imageId, selectedImages });
console.log('🚨 Revoking blob URL:', imageToRemove.url);
```

**Nota**: Los logs son temporales y deben ser removidos en producción.

### 🔗 Integración con Customizer

Para usar en el sistema de customizer:

```typescript
// En sectionFieldsMap.ts
gallery_images: {
  key: 'gallery_images',
  label: 'Fotos de la Galería',
  type: 'multi-image',        // ← Tipo crítico
  section: 'gallery',
  category: 'Galería',
  maxImages: 9,
  placeholder: 'Selecciona hasta 9 fotos para tu galería...'
}

// En CustomizerField.tsx - manejo automático
case 'multi-image':
  return (
    <MultiImageGalleryPicker
      value={Array.isArray(value) ? value : []}
      onChange={(images: GalleryImage[]) => onChange(images)}
      fieldKey={field.key}
      maxImages={(field as any).maxImages || 9}
    />
  );
```

### ⚠️ Consideraciones Importantes

1. **Memoria**: Las blob URLs se crean automáticamente y se limpian al eliminar imágenes
2. **Performance**: Usa `useCallback` para funciones y `useMemo` para cálculos pesados
3. **Accesibilidad**: Incluye labels apropiados y soporte para keyboard navigation
4. **Tipos**: Todas las interfaces están tipadas correctamente con TypeScript

### 🛠️ Troubleshooting

#### "Cannot read properties of undefined (reading 'startsWith')"
- **Causa**: `imageToRemove.url` es undefined
- **Solución**: Ya implementada con validación defensiva

#### "Images not loading"
- **Causa**: URLs externas inválidas o blob URLs revocadas
- **Solución**: Verificar validación en useEffect

#### "File manager not working"
- **Causa**: fieldKey duplicado o file manager no inicializado
- **Solución**: Usar fieldKey único y verificar store de Zustand

### 📈 Performance Tips

1. **Lazy Loading**: Considera lazy loading para grandes cantidades de imágenes
2. **Compression**: Implementa compresión de imágenes antes del upload
3. **Debouncing**: Para onChange callbacks frecuentes
4. **Memoization**: Ya implementado para funciones críticas

### 🔄 Future Improvements

- [ ] Reordenamiento drag & drop entre imágenes
- [ ] Compresión automática de imágenes grandes
- [ ] Soporte para videos cortos
- [ ] Preview modal para imágenes individuales
- [ ] Bulk actions (seleccionar múltiples para eliminar)