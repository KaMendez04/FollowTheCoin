# Follow The Coin

Un juego interactivo de pixel art donde sigues y atrapas monedas.

## Estructura del Proyecto

Este proyecto sigue las mejores prácticas de Next.js con una organización modular:

```
src/
  components/          # Componentes React
    game/             # Componentes específicos del juego
      pixel-character.tsx
      pixel-scene.tsx
      index.ts        # Exportaciones del módulo
    ui/               # Componentes UI reutilizables
    theme-provider.tsx
    index.ts          # Exportaciones principales
  types/              # Definiciones de TypeScript
    game.ts           # Tipos relacionados con el juego
    index.ts
  constants/          # Constantes y configuración
    game.ts           # Configuración del juego
    index.ts
  utils/              # Funciones de utilidad
    storage.ts        # Utilidades de localStorage
    index.ts
  hooks/              # Custom hooks de React
  lib/                # Configuración general
  styles/             # Archivos CSS
```

## Características de la Organización

### **Separación de Responsabilidades**
- **Types**: Todas las definiciones de TypeScript en un solo lugar
- **Constants**: Configuración centralizada y fácil de modificar
- **Utils**: Funciones reutilizables y helper functions
- **Components**: Organizados por dominio (game, ui, etc.)

### **Imports Optimizados**
- Uso de rutas absolutas con `@/` para mejor mantenibilidad
- Archivos `index.ts` para exportaciones limpias
- Imports consistentes en toda la aplicación

### **Tipado Fuerte**
- Todos los tipos definidos en archivos dedicados
- Interfaces reutilizables entre componentes
- Mejor autocompletado y detección de errores

## Tecnologías

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **Framer Motion** - Animaciones
- **Radix UI** - Componentes accesibles

## Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm start
```

## Arquitectura de Componentes

### Game Components
- `PixelScene`: Componente principal del juego
- `PixelCharacter`: Personajes animados de pixel art

### UI Components
- Componentes reutilizables de Radix UI
- Theme provider para modo oscuro/claro

### Utils
- `storage`: Abstracción de localStorage con manejo de errores
- Funciones helper para operaciones comunes

## Mejores Prácticas Implementadas

1. **Estructura de carpetas modular**
2. **Imports absolutos y consistentes**
3. **Tipado TypeScript completo**
4. **Separación de lógica y presentación**
5. **Configuración centralizada**
6. **Componentes reutilizables**
