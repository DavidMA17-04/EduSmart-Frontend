# Bitácora de Desarrollo — EduSmart Frontend (CTP de Hojancha)

### Registro de Bitácora - 2026-07-27

# Fase de Análisis Frontend - Arquitectura FSD con Vite e Interfaces de Carga Masiva

**Proyecto:** EduSmart — CTP de Hojancha  
**Sprint:** 1 | **Rama Local:** `feature-Aaron`  
**Autor:** Arquitectura Frontend EduSmart  

---

## 1. Resumen de Decisiones de Arquitectura y Segmentación (FSD)
- **Adopción de Feature-Sliced Design (FSD v2.0):** Se desglosó el flujo de Incorporación de Usuarios (Feature 2) respetando la jerarquía estricta `entities`, `features` y `pages`.
- **Estructura de la Feature `features/import-users`:**
  - `ui/`: Subdividido en módulos independientes para cada Wireframe: `MethodSelector` (WF-13), `FileDropzone` (WF-14) e `ImportPreviewTable` (WF-15).
  - `model/`: Centraliza el estado de la máquina de carga (`useImportUsersStore.ts`), la estructura de la matriz de filas parsedas, los algoritmos de validación en cliente y la simulación de datos.
  - `api/`: Define los contratos DTOs requeridos para el envío masivo final al servidor NestJS.
- **Entidad Global `entities/user`:** Aloja la interfaz canónica de `User` y los enumerados globales (`UserRole`, `UserStatus`) para consumo del sistema.

## 2. Contratos de Datos y Modelo de Inconsistencias
- **Interface Base `User`:** Mapea la cédula costarricense (`nationalId`), nombre, apellidos, correo institucional y rol CTP.
- **Tipado de Pre-visualización `ImportedUserRow`:** Incluye metadata de cliente (`tempId`, `rowNumber`, `isValid`) y el arreglo de errores de celda `RowValidationError[]`.
- **Granularidad de Errores (`RowValidationError`):** Identifica el campo afectado (`field`), el código de error (`REQUIRED`, `INVALID_EMAIL`, `INVALID_NATIONAL_ID`, `INVALID_ROLE`) y el mensaje explicativo a pintar en los badges de la tabla visual (WF-15).

## 3. Estrategia de Mocking y Aislamiento Frontend
- **Desarrollo Desconectado:** Inclusión de dataset sintético (`MOCK_IMPORTED_ROWS`) en `features/import-users/model/mockData.ts` con registros exitosos y registros intencionalmente defectuosos.
- **Validación Interactivas en WF-15:** Permite poner a prueba de forma inmediata la velocidad de recarga HMR de Vite, validando el filtrado por registros erróneos, resumen de contadores y corrección de celdas en caliente sin dependencia de servicios de backend.

---

### Registro de Bitácora - 2026-07-30

# Fase de Análisis Frontend - Arquitectura en Capas e Interfaces de Carga Masiva

**Proyecto:** EduSmart — CTP de Hojancha  
**Sprint:** 1 | **Rama Local:** `feature-Aaron`  
**Autor:** Arquitectura Frontend EduSmart  

---

## 1. Definición Formal de Arquitectura (Component-Driven Layered Architecture)
- **Desestimación de FSD:** Se formaliza la elección de una **Arquitectura en Capas Basada en Componentes** tradicional para React, simplificando la estructura en favor de una organización directa por responsabilidad técnica (`pages`, `components`, `layout`, `hooks`, `types`, `services`).
- **Segmentación por Carpetas:**
  - **`src/pages/user-onboarding/UserOnboardingPage.tsx`**: Vista contenedora principal que administra los pasos del wizard (WF-13, WF-14, WF-15).
  - **`src/components/user-onboarding/`**: Componentes modulares independientes (`MethodSelector.tsx`, `FileDropzone.tsx`, `ImportPreviewTable.tsx`, `ImportSummaryHeader.tsx`).
  - **`src/layout/DashboardLayout.tsx`**: Layout base que provee la carcasa institucional del CTP de Hojancha (Sidebar, Navbar y `<Outlet />`).

## 2. Modelado de Datos e Inconsistencias (`src/types/user.ts`)
- **Interfaces TypeScript:**
  - `User` e `UserInputDTO`: Cédula costarricense (`nationalId`), nombre, apellidos, correo institucional (`@ctphojancha.ed.cr`) y rol CTP (`ADMIN`, `TEACHER`, `STUDENT`, `COORDINATOR`).
  - `RowValidationError`: Estructura para capturar errores de celda con códigos (`REQUIRED`, `INVALID_EMAIL`, `INVALID_NATIONAL_ID`, `INVALID_ROLE`, `DUPLICATE_ID`).
  - `ImportedUserRow`: Objeto wrapper para la vista previa con banderas de validez (`isValid`) y estado de la fila.

## 3. Lógica de Hook Aislado y Mocking (`src/hooks/useUserImport.ts`)
- **Custom Hook `useUserImport.ts`:** Encapsula el estado de carga (`currentStep`, `file`, `importedRows`), la simulación de lectura de archivos (*mocking* sintético con errores provocados) y la edición/re-validación interactiva.
- **Styling Dinámico con Tailwind CSS:** Clases asignadas a celdas erróneas (`bg-red-50 text-red-900 border-red-300`) y badges de advertencia visuales antes de enviar la carga definitiva a NestJS (`src/services/userService.ts`).

## 4. Ejecución del Refactor de Carpetas (Reorganización Física)
- **Desmontaje de FSD:** Se eliminaron las carpetas `src/app/`, `src/entities/` y `src/features/`.
- **Estructura Tradicional en Capas Implementada:**
  - `src/components/user-onboarding/`: Alojamiento de `MethodSelector.tsx`, `FileDropzone.tsx`, `ImportPreviewTable.tsx` y `UserRoleBadge.tsx`.
  - `src/hooks/`: Creación de `useUserImport.ts` centralizado.
  - `src/types/`: Centralización de `user.ts` (entidades, DTOs, enumerados e inconsistencias).
  - `src/utils/`: Funciones aisladas `parseFile.ts`, `validateRows.ts` y `mockData.ts`.
  - `src/services/`: Definición de `userService.ts` para integración futura con NestJS.
  - `src/layout/`: Creación de `DashboardLayout.tsx`.
  - `src/pages/user-onboarding/`: `UserOnboardingPage.tsx` orquestador limpio.
- **Verificación:** Ejecución limpia de `tsc --noEmit` y `vite build` con 0 errores de compilación.

---

### Registro de Bitácora - 2026-07-30

# Fase de Análisis Frontend - Mapeo de Arquitectura Base EduSmart

**Proyecto:** EduSmart — CTP de Hojancha  
**Sprint:** 1 | **Rama Local:** `feature-Aaron`  
**Autor:** Arquitectura Frontend EduSmart  

---

## 1. Distribución de UI (`src/pages/` y `src/components/`)
- **`src/pages/user-onboarding/UserOnboardingPage.tsx`**: Vista contenedora principal que orquesta el Wizard de Incorporación (WF-13, WF-14, WF-15) mediante control de pasos.
- **`src/components/user-onboarding/`**: Componentes visuales reutilizables:
  - `MethodSelector.tsx` (WF-13: Selección entre registro manual e importación masiva).
  - `FileDropzone.tsx` (WF-14: Drag & Drop con Tailwind CSS y selector tradicional).
  - `ImportPreviewTable.tsx` (WF-15: Tabla de pre-visualización con badges de error por celda y edición en caliente).
  - `UserRoleBadge.tsx`: Visualización estilizada de roles institucionales del CTP de Hojancha.
- **`src/layout/DashboardLayout.tsx`**: Carcasa estructural reutilizable (Navbar, Sidebar CTP Hojancha, Main Content).

## 2. Tipados y Estructuración de Datos (`src/types/user.ts`)
- **`User` e `UserInputDTO`**: Interface canónica del usuario del CTP de Hojancha (cédula, nombre, correo `@ctphojancha.ed.cr`, rol institucional).
- **`RowValidationError`**: Tipado de inconsistencias por celda (`REQUIRED`, `INVALID_EMAIL`, `INVALID_NATIONAL_ID`, `INVALID_ROLE`, `DUPLICATE_IN_FILE`).
- **`ImportedUserRow`**: Wrapper de pre-visualización para administrar el estado de validez de la fila (`isValid`, `tempId`, `errors`).

## 3. Lógica y Estado (`src/utils/`, `src/hooks/` y `src/services/`)
- **`src/utils/`**: Funciones puras para lectura y parseo (`parseFile.ts`), algoritmo de validación por celda (`validateRows.ts`) y dataset sintético (`mockData.ts`).
- **`src/hooks/useUserImport.ts`**: Custom hook reactivo que encapsula la máquina de estados del wizard, simulación de carga y re-validación reactiva con clases de Tailwind CSS.
- **`src/services/userService.ts`**: Capa de abstracción para envío de payload procesado al backend NestJS (`POST /users/bulk`).

---

### Registro de Bitácora - 2026-09-04

**Proyecto:** EduSmart — CTP de Hojancha  
**Rama:** `Feature-Mau`  
**Autor:** Mauricio Chavarria  

Continuidad post-diagnóstico OpenSpec (PBI-01/02/03):
- Docs: `docs/LAYOUT_ADMIN.md`
- UX: se quitó el link muerto `/admin/settings` y la card placeholder “Actividad reciente”
- Layout actual documentado en `docs/LAYOUT_ADMIN.md` (AdminShell + rutas + paleta MEP)

---
