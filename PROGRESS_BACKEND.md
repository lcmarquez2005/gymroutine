# Progreso del Proyecto: GymRoutine Backend

Este documento detalla el estado actual del proyecto, las fases completadas y el trabajo restante según la hoja de ruta definida.

## Fases del Proyecto

### ✅ Fase 1: Cimientos y Configuración Inicial
- [x] Configuración de Spring Boot 3.3.0.
- [x] Conexión a Base de Datos MySQL local.
- [x] Mapeo de variables de entorno con `spring-dotenv`.
- [x] Creación de `UserEntity` y `UserRepository`.
- [x] Creación del primer endpoint `GET /api/v1/users/me`.

### ✅ Fase 2: Autenticación y Seguridad
- [x] Integración de Spring Security y `java-jwt`.
- [x] Creación de `SecurityConfig` para resolver dependencias circulares y habilitar CORS.
- [x] Generación de tokens JWT mediante `JwtService`.
- [x] Protección de rutas mediante `JwtAuthenticationFilter`.
- [x] Encriptado de contraseñas con `BCrypt`.
- [x] Endpoints `POST /api/v1/auth/register` y `POST /api/v1/auth/login`.

### ⏳ Fase 3: Módulo de Rutinas y Ejercicios (En progreso)
- [x] Creación de entidades `RoutineEntity`, `ExerciseEntity`, `RoutineExerciseEntity` y `RoutineSetEntity`.
- [x] Creación de repositorios de JPA correspondientes.
- [x] Endpoints para CRUD de Ejercicios (`GET`, `POST` en `/api/v1/exercises`).
- [x] Endpoints para CRUD de Rutinas (`GET`, `POST`, `PUT`, `DELETE` en `/api/v1/routines`).
- [x] Validaciones de pertenencia (un usuario solo puede ver/modificar sus rutinas).

### 📅 Fase 4: Historial y Sesiones de Entrenamiento
- [ ] Entidades de Sesión (`WorkoutSessionEntity`, `WorkoutExerciseEntity`, `WorkoutSetEntity`).
- [ ] Endpoint `POST /api/v1/workouts` (Guardado con `@Transactional`).
- [ ] Lógica de validación y cálculo de volumen real en el backend.

### 📅 Fase 5: Optimizaciones y Calidad
- [ ] Integración de MapStruct para reducir código boilerplate en los DTOs.
- [ ] Manejo Global de Errores mediante `@RestControllerAdvice`.
- [ ] Despliegue o testing final.
