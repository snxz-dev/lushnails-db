# AGENTS.md - Development Guide for LUSH NAILS SPA

## Project Overview

This is a Create React App (CRA) project building a business website for Lush Nails Spa. It uses JavaScript with React 19, CSS for styling, and @testing-library/react for testing.

---

## Build / Test Commands

### Development
```bash
npm start
```
Runs the app in development mode at http://localhost:3000

### Testing
```bash
# Run all tests in watch mode
npm test

# Run a single test file
npm test -- src/App.test.js

# Run tests with coverage
npm test -- --coverage

# Run tests in CI mode (no watch)
npm test -- --watchAll=false
```

### Building
```bash
# Build for production
npm run build

# Build output goes to the /build folder
```

### Linting
ESLint is configured via react-scripts. The config extends `react-app` and `react-app/jest`.

---

## Code Style Guidelines

### Language & Types
- Use **JavaScript** (this project does not use TypeScript)
- Avoid adding TypeScript - keep the project consistent
- No PropTypes are currently used; if adding props validation, use PropTypes

### Import Organization
```javascript
// 1. React imports first
import React, { useState, useEffect } from 'react';

// 2. External libraries (none currently)
// import SomeLibrary from 'some-library';

// 3. CSS imports
import './styles/App.css';
import './styles/menu.css';

// 4. Asset imports (images, icons, etc.)
import logoImage from './assets/logo.svg';
import imgCabello from './assets/Cabello.jpeg';
import imgManicure from './assets/Unas.jpeg';
import imgPestanas from './assets/PestanasCejas.jpeg';

// 5. Component imports
import App from './App';
```

### Naming Conventions
- **Components**: PascalCase (e.g., `App`, `CustomButton`)
- **Functions/Hooks**: camelCase (e.g., `handleInputChange`, `useState`, `toggleServicios`)
- **Constants**: UPPER_SNAKE_CASE for truly constant values (e.g., `CORREO_TRABAJO`, `WHATSAPP_LINKS`)
- **Files**: camelCase (e.g., `app.js`, `handleNavClick`)
- **CSS Classes**: kebab-case (e.g., `.navbar-logo`, `.service-category-block`, `.whatsapp-btn`)

### Function Components
```javascript
// Preferred: function declaration
function App() {
  const [state, setState] = useState(initialValue);
  
  const handleEvent = (e) => {
    // handler logic
  };
  
  return (<JSX />);
}

export default App;
```

### React Hooks Usage
- Use `useState` for local component state
- Use `useEffect` for side effects (data fetching, subscriptions, DOM manipulation)
- Always include dependency arrays in `useEffect`

### CSS Style
- This project uses separate CSS files in `src/styles/`
- Avoid inline styles except for dynamic values or specific component adjustments
- When using inline styles for specific cards, use simple conditional logic:
```javascript
style={{ 
  width: category === 'otros' ? '50%' : '100%',
  margin: category === 'otros' ? '80px auto' : 'unset'
}}
```

### Inline Style Adjustments (Current Usage)
- Services section images use inline styles for width, height, and margins
- Contact section uses inline styles for background colors
- Some category titles use inline margin-top for positioning (cabello: 25px, otros: 135px)
- Arrows use green color (#2F4A34)

### Error Handling
- Currently uses `alert()` for user feedback - this is acceptable for simple forms
- For production, consider replacing with proper error states and UI feedback
- Use try/catch for async operations

### Event Handling
```javascript
// Good pattern from codebase:
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

// Toggle function for services
const toggleServicios = () => {
  setServicioActivo(servicioActivo === 'all' ? null : 'all');
};
```

### Working with Forms
- Store form data in state objects
- Use `onChange` handlers that update specific fields
- Validate before submission (currently uses HTML5 `required` + JS validation)

### Accessibility
- Always include `alt` text for images
- Use `aria-label` for icon-only buttons
- Ensure form inputs have associated labels
- Use semantic HTML elements (`<nav>`, `<section>`, `<footer>`)

---

## Current Services Configuration

The services section uses these images:
- **Uñas**: `assets/Unas.jpeg`
- **Pestañas y Cejas**: `assets/PestanasCejas.jpeg` (label: "PESTAÑAS Y CEJAS")
- **Cabello**: `assets/Cabello.jpeg`
- **Otros**: `logo.svg` (50% width, centered with 80px margin-top, label: "OTROS", margin-top: 135px)

Services data structure includes optional `label` property for custom display names.

**Expand/Collapse Behavior:**
- Clicking on image OR arrow toggles all services at once
- Uses `servicioActivo` state with 'all' value to show/hide all
- Arrows: ▼ (closed) / ▲ (open), color green (#2F4A34)
- CSS class `.expanded` controls visibility via `display: none/block`

---

## Contact Section Configuration

Current styling:
- Section background: `#2F4A34` (green)
- Card background: `#F5F5DC` (beige)
- Text color: black
- Schedule info has been removed - only shows "Agenda tu cita" heading and WhatsApp button

---

## Branch Locations Configuration

Three branch locations with WhatsApp contact buttons:
- **San Antonio de Pichincha**: Calles 13 de Junio y Santa Ana
- **Pusuqui**: Calle Rafael Cuervo
- **Calderon**: Capitán Génovanny calles y Derby

Each branch has a "Contactar" button that links to WhatsApp.

---

## WhatsApp Floating Button

The WhatsApp button in the bottom-right corner has:
- Main button with WhatsApp icon that opens a menu
- Menu shows 3 options: San Antonio, Pusuqui, Calderon (positioned to the left of main button)
- Uses `whatsappMenuOpen` state to toggle menu visibility
- Uses `WHATSAPP_LINKS` constant for URL configuration

CSS classes used:
- `.whatsapp-float-container`: Main container (position: fixed, right: 30px, bottom: 30px)
- `.whatsapp-btn`: The main button (60x60px, green background, outline: none)
- `.whatsapp-menu`: Menu positioned to the left (bottom: 0, right: 80px)
- `.whatsapp-option`: Each branch option button (green background, white text)

---

## Project Structure

```
/home/stalyn/Emprendimientos /spa/
├── public/
│   └── index.html
├── src/
│   ├── assets/          # Images, videos, SVGs
│   ├── styles/          # CSS files
│   ├── App.js          # Main component
│   ├── App.test.js    # Tests
│   ├── index.js       # Entry point
│   └── reportWebVitals.js
├── package.json
└── README.md
```

---

## Making Changes

### Adding New Components
1. Create new JS file in `src/`
2. Import and use in App.js
3. Add tests in `src/App.test.js` or separate file

### Adding New Styles
1. Add CSS to existing file in `src/styles/` or create new file
2. Import in App.js

### Adding Assets
1. Place images in `src/assets/`
2. Import and use (as done in App.js)

---

## Testing Guidelines

### Test File Location
- Place tests in same directory as component: `ComponentName.test.js`
- Current test: `src/App.test.js`

### Testing Patterns (Based on existing test)
```javascript
import { render, screen } from '@testing-library/react';
import App from './App';

test('description of what is being tested', () => {
  render(<App />);
  expect(screen.getByText(/expected text/i)).toBeInTheDocument();
});
```

### What to Test
- Component renders without crashing
- Important UI elements are present
- User interactions work as expected

---

## Common Issues

### Running Tests Fails
If tests fail, ensure you're in the project directory:
```bash
cd /home/stalyn/Emprendimientos /spa
npm test
```

### Build Errors
- Check that all imports resolve
- Ensure CSS files exist before importing
- Verify asset paths are correct (images must exist in assets folder)

---

## Dependencies

Key packages in `package.json`:
- `react`: ^19.2.4
- `react-dom`: ^19.2.4
- `react-scripts`: 5.0.1
- `@testing-library/react`: ^16.3.2
- `@testing-library/jest-dom`: ^6.9.1
- `@testing-library/user-event`: ^13.5.0

---

## Notes for Agents

- This is a business website - avoid changes that affect the core business logic
- Keep this project separate from other projects - do not mix different projects or codebases
- The form currently uses `mailto:` for submissions - this is intentional
- Social media links (Facebook, Instagram, TikTok) and WhatsApp are hardcoded (update in App.js if needed)
- Consider accessibility before making UI changes
- Avoid removing existing translations (the site is in Spanish)
- The site is in Spanish - maintain Spanish text content
- When adding images to services, ensure they exist in the assets folder before importing
- When modifying WhatsApp button or menu, keep the button outline: none to remove black border
- WhatsApp menu is positioned to the left of the main button - be careful when adjusting positions
- Services section uses global toggle - clicking any image or arrow shows/hides ALL services info
- Service category blocks need `.expanded` class for content visibility (CSS: display: none/block)

---

## Estado del Proyecto

**PROYECTO COMPLETO Y TERMINADO** - Listo para subir a GitHub en la próxima sesión.

Todas las funcionalidades han sido implementadas y probadas:
- Página principal con información del spa
- Servicios (Uñas, Pestañas y Cejas, Cabello, Otros)
- Galería de imágenes
- Sucursales (San Antonio, Pusuqui, Calderón)
- Botón flotante de WhatsApp
- Formulario de contacto
- Diseño responsivo y accesible

---

## Git Workflow (Para Próxima Sesión)

```bash
# Verificar estado
git status

# Agregar archivos
git add .

# Crear commit
git commit -m "Proyecto completo LUSH NAILS SPA"

# Subir a GitHub
git push origin main
```