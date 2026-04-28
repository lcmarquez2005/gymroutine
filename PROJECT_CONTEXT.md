# Contexto del Proyecto Frontend: gymroutine

## 1. Identidad del Proyecto
**gymroutine** es una Single Page Application (SPA) para el seguimiento de entrenamientos. En esta fase, el enfoque es 100% Frontend, utilizando datos simulados (Mocks) para validar la experiencia de usuario antes de integrar Spring Boot.

## 2. Stack Tecnológico (Frontend)
* **Framework:** React 18+ (Vite).
* **Lenguaje:** TypeScript (Estricto).
* **Estilos:** Tailwind CSS.
* **Iconos:** Lucide React.
* **Estado Global:** React Context API.
* **Simulación de API:** Mock Services con delays para simular latencia de red.

## 3. Reglas de Oro de Programación
1.  **Mocking:** Crear archivos `.ts` en `/src/services` que devuelvan `Promises` con datos de prueba, facilitando la futura migración a Axios.
2.  **TypeScript:** Definir interfaces rigurosas en `/src/types`. Prohibido el uso de `any`.
3.  **Componentes:** Funcionales con `export const ComponentName: React.FC<Props> = ...`.
4.  **Excel:** Lógica de fórmulas siempre en **Inglés**.

## 4. Estructura del Proyecto (Carpeta src/)
La IA debe organizar los archivos así:
* `api/`: (Vacío por ahora) Solo configuración base.
* `components/`: Componentes atómicos de UI (Botones, Cards, Inputs).
* `context/`: `AuthContext.tsx` y `WorkoutContext.tsx` (Manejan el estado local como si fuera la DB).
* `hooks/`: `useAuth.ts`, `useWorkout.ts` (Lógica para consumir los mocks).
* `layouts/`: `MainLayout.tsx` (con Bottom Navigation para móvil).
* `pages/`: `Login.tsx`, `Dashboard.tsx`, `ExerciseLibrary.tsx`, `RoutineEditor.tsx`, `ActiveWorkout.tsx`, `WorkoutSummary.tsx`, `Profile.tsx`, `Settings.tsx`, `Register.tsx`, etc.
* `services/`: Mocks de servicios (ej. `routine.service.ts` devuelve datos estáticos).
* `types/`: Interfaces de `User`, `Routine`, `Exercise`, `Set`.
* `utils/`: Helpers para fechas y manejo de arrays de entrenamiento.

## 5. Requerimientos Funcionales (Fase Frontend)
* **Simulación de Auth:** Login que guarde un usuario ficticio en el estado.
* **Dashboard Dinámico:** Debe mostrar la rutina según el grupo muscular que desee entrenar, debe poder elegir que entrenar hoy o entrenar en base al dia de la semana.
* **CRUD Local:** El usuario debe poder crear, editar y eliminar rutinas.
* **Exercise Library:** El usuario debe poder buscar, editar, agregar, crear y eliminar ejercicios.
* **Flujo de Entrenamiento:** Pantalla de registro de peso/reps por ejercicio. Los datos se guardan en el estado global durante la sesión y se limpian al finalizar el entrenamiento.
* **Configuración de Días:** Interfaz para marcar que dias fue la persona al gym. y mostrar en el dashboard de perfil los dias entrenados, y que ejercicios hizo cada dia ( pecho, espalda, brazos, piernas).

## 6. Reglas de Negocio (Frontend-Side)
* Si no hay una rutina para "Hoy", mostrar un estado vacío con invitación a crear una.
* El "Modo Entrenamiento" solo se activa si la rutina tiene al menos un ejercicio.
* Validar inputs de peso y reps (no permitir negativos o vacíos).

## 7. Guía Visual (Tailwind)
* **Mobile-First:** Limitar ancho en desktop a `max-w-md` y centrar.
* **Colores:** Primario `blue-600`, Fondo `bg-slate-50`, Texto `text-slate-900`.
* **Interactividad:** Estados de `:hover`, `:active` y transiciones suaves en botones.