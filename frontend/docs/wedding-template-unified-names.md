# Wedding Template - Unified Couple Names Implementation

## Overview
This document explains the implementation of the unified couple names system across wedding template sections (Hero, Couple, Footer). The system ensures that when users edit "Nombre del Novio" and "Nombre de la Novia" in the customizer, changes are reflected in all sections simultaneously.

## Architecture

### Data Flow
```
Customizer Input → useDynamicCustomizer → TemplateRenderer → TemplateBuilder → Section Components
```

### Key Components

#### 1. useDynamicCustomizer Hook
**Location**: `frontend/src/lib/hooks/useDynamicCustomizer.ts`

The main hook responsible for managing customizer state and transforming data for template components.

**Key Implementation**:
```typescript
// Lines 373-375: Auto-generation of coupleNames
coupleNames: data.coupleNames ||
            (data.groom_name && data.bride_name ?
             `${data.groom_name} & ${data.bride_name}` :
             `${data.groom_name || 'Jefferson'} & ${data.bride_name || 'Rosmery'}`)
```

#### 2. Section Components

##### Hero1 Component
**Location**: `frontend/src/components/templates/categories/weddings/sections/hero/Hero1.tsx`

- **Receives**: `groom_name`, `bride_name`
- **Generates**: `coupleNames` internally
- **Displays**: Concatenated format "Jefferson & Rosmery"

##### Couple1 Component
**Location**: `frontend/src/components/templates/categories/weddings/sections/couple/Couple1.tsx`

- **Receives**: Individual `groom_name`, `bride_name`, and related fields
- **Displays**: Individual names with their respective descriptions and images

##### Footer1 Component
- **Receives**: `groom_name`, `bride_name`
- **Generates**: `coupleNames` internally
- **Displays**: Concatenated format "Jefferson & Rosmery"

## Implementation Details

### Field Mapping
The system uses a unified field mapping where:
- `groom_name`: Individual groom's name
- `bride_name`: Individual bride's name
- `coupleNames`: Auto-generated concatenated format

### Customizer Configuration
```typescript
// Wedding customizer fields
{
  id: 'groom_name',
  label: 'Nombre del Novio',
  type: 'text',
  value: data.groom_name || 'Jefferson'
},
{
  id: 'bride_name',
  label: 'Nombre de la Novia',
  type: 'text',
  value: data.bride_name || 'Rosmery'
}
```

### Data Transformation
The `transformToTemplateProps` function in `useDynamicCustomizer` handles the transformation:

1. **For Hero Section**:
   - Receives individual names from customizer
   - Generates `coupleNames` automatically
   - Passes both individual names and concatenated format

2. **For Couple Section**:
   - Receives individual names and descriptions
   - Uses them directly without concatenation

3. **For Footer Section**:
   - Same as Hero section
   - Auto-generates concatenated format

## Usage

### For Developers

1. **Adding New Sections**:
   If you need to add a new section that uses couple names:
   ```typescript
   // In your component
   interface YourSectionProps {
     groom_name: string;
     bride_name: string;
     // Other props...
   }

   // The component will receive individual names
   // Generate coupleNames if needed:
   const coupleNames = `${groom_name} & ${bride_name}`;
   ```

2. **Customizer Fields**:
   The customizer automatically provides these fields:
   - `groom_name`: Individual groom name
   - `bride_name`: Individual bride name
   - Auto-generated `coupleNames` for sections that need it

### For Users

1. **Editing Names**:
   - Navigate to the customizer panel
   - Find "Nombre del Novio" and "Nombre de la Novia" fields
   - Edit either field
   - Changes reflect immediately in all sections

2. **Display Formats**:
   - **Hero**: Shows "Groom & Bride" format
   - **Couple**: Shows individual names with descriptions
   - **Footer**: Shows "Groom & Bride" format

## Technical Benefits

1. **Single Source of Truth**: All names are managed from one place
2. **Automatic Synchronization**: Changes propagate to all sections
3. **Flexible Display**: Each section can format names as needed
4. **Backward Compatibility**: Supports legacy `coupleNames` field

## Troubleshooting

### Common Issues

1. **Names Not Updating in Hero/Footer**:
   - Check that `useDynamicCustomizer` is generating `coupleNames`
   - Verify the section is reading the correct props

2. **Individual Names Not Showing in Couple Section**:
   - Ensure `groom_name` and `bride_name` are passed separately
   - Check that the section isn't using the concatenated `coupleNames`

3. **Default Values Appearing**:
   - Verify customizer data is being saved correctly
   - Check that the template is using customizer data over defaults

## Migration Notes

### From Legacy System
If migrating from the old system where sections had duplicate fields:
1. Remove duplicate field definitions from section components
2. Update props to use unified `groom_name` and `bride_name`
3. Generate `coupleNames` internally if needed

### Database Considerations
- Store individual names separately in the database
- Generate concatenated format on-the-fly
- This allows maximum flexibility for different display formats

## Future Enhancements

Potential improvements for the system:
1. Support for different concatenation formats (e.g., "& ", "y", "and")
2. Localization support for different languages
3. Custom separators between names
4. Support for hyphenated last names

## Related Files

- `/frontend/src/lib/hooks/useDynamicCustomizer.ts` - Main customizer hook
- `/frontend/src/components/templates/categories/weddings/sections/hero/Hero1.tsx` - Hero section
- `/frontend/src/components/templates/categories/weddings/sections/couple/Couple1.tsx` - Couple section
- `/frontend/src/components/templates/categories/weddings/sections/footer/Footer1.tsx` - Footer section
- `/frontend/src/components/customizer/DynamicCustomizer.tsx` - Customizer UI component

## Version History

- **2025-09-21**: Initial implementation of unified couple names system
- Removed duplicate switch cases in customizer hooks
- Added auto-generation of `coupleNames` from individual fields
- Fixed data flow between customizer and template sections