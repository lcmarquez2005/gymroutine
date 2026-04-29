# Contexto del Proyecto Backend: gymroutine-api

Este documento define la estructura, arquitectura y reglas de negocio para construir el **backend** de la plataforma GymRoutine. Está diseñado para ser leído por IA y desarrolladores, asegurando que la API se construya en perfecta sincronía con las necesidades del frontend.

## 1. Identidad del Proyecto
**gymroutine-api** es la API RESTful que dará vida a la aplicación SPA de GymRoutine. Se encargará de la persistencia real de datos, la lógica de negocio, el cálculo de métricas de entrenamiento y la seguridad, reemplazando la actual simulación (mocking) de servicios en el frontend.

## 2. Stack Tecnológico (Backend)
* **Framework:** Spring Boot 3.x (Actualmente la versión más moderna y robusta, ya que Spring Boot 4 aún no existe formalmente).
* **Lenguaje:** Java 17 o superior.
* **Base de Datos:** MySQL 8+.
* **ORM:** Hibernate / Spring Data JPA.
* **Seguridad:** Spring Security + JWT (JSON Web Tokens) para autenticación sin estado (stateless).
* **Mapeo de Datos:** MapStruct (para transformar Entities a DTOs de Request/Response).
* **Reducción de Boilerplate:** Lombok.
* **Gestión de Dependencias:** Maven.
* **Migración de BD:** Flyway o Liquibase (Altamente recomendado).

## 3. Estructura del Proyecto (Capas de Arquitectura)

La arquitectura sigue el patrón MVC / Capas fuertemente tipado. Basado en el árbol proporcionado, así se utilizará cada carpeta:

```text
└───src
    └───main
        ├───java
        │   └───org
        │       └───example
        │           └───gymroutine
        │               │   GymroutineApplication.java (Punto de entrada)
        │               │
        │               ├───controller/
        │               │       Controladores REST (@RestController). Solo gestionan HTTP (rutas, validación de inputs, envío de respuestas DTO). Ej: `RoutineController.java`.
        │               │
        │               ├───entity/
        │               │       Clases anotadas con `@Entity` que se mapean a las tablas de MySQL. Deben reflejar exactamente el esquema relacional. Ej: `RoutineEntity.java`, `UserEntity.java`.
        │               │
        │               ├───model/
        │               │       Clases de dominio que no son entidades ni DTOs (ej. Enums, constantes, POJOs auxiliares).
        │               │
        │               ├───repository/
        │               │       Interfaces de Spring Data JPA (`@Repository`). Encargados de abstraer el acceso a la base de datos MySQL (ej. `UserRepository.java`).
        │               │
        │               └───service/
        │                   │   Interfaces que definen el contrato de los casos de uso. Ej: `RoutineService.java`.
        │                   │
        │                   ├───imp/
        │                   │       Clases que implementan los servicios (`@Service`). Contienen toda la lógica de negocio (cálculo de volúmenes, asignación de días, transaccionalidad con `@Transactional`).
        │                   │
        │                   ├───request/
        │                   │       Data Transfer Objects (DTOs) de **entrada**. Lo que el frontend envía en los `@RequestBody`. Ej: `RoutineCreateRequest.java`, `AuthLoginRequest.java`.
        │                   │
        │                   └───response/
        │                           Data Transfer Objects (DTOs) de **salida**. Lo que se envía al frontend, coincidiendo exactamente con las interfaces TypeScript. Ej: `WorkoutSessionResponse.java`.
        │
        └───resources
                application.yaml (Configuraciones de BD, JWT, servidor, CORS).
```

## 4. Reglas de Oro de Programación (Backend)
1. **Nunca exponer Entities:** Las clases `@Entity` NUNCA deben salir de la capa `service/imp`. El `controller` SIEMPRE debe devolver objetos del paquete `response/` y recibir objetos del paquete `request/`.
2. **Inyección de Dependencias Limpia:** Usar inyección por constructor a través de la anotación `@RequiredArgsConstructor` de Lombok. Evitar el uso de `@Autowired` en atributos.
3. **Manejo de Errores Global:** Implementar un `@ControllerAdvice` o `@RestControllerAdvice` para capturar excepciones (como `EntityNotFoundException` o `MethodArgumentNotValidException`) y devolver un JSON estructurado con el error en lugar de un stacktrace genérico.
4. **Validación Fuerte:** Todos los objetos en `request/` deben estar validados con `jakarta.validation` (`@NotBlank`, `@Min`, `@NotNull`). El `controller` debe usar `@Valid`.
5. **CORS:** Habilitar globalmente en Spring Security para permitir peticiones desde `http://localhost:5173` (u otros puertos del frontend de Vite).

## 5. Esquema Relacional de Base de Datos (MySQL)

Basado en el `PROJECT_CONTEXT.md` del frontend y los requisitos de `API.md`, la base de datos MySQL debe tener las siguientes tablas principales:

* **users:** Almacena la cuenta. `id`, `name`, `email`, `password_hash`.
* **routines:** Plantillas de rutinas del usuario. `id`, `user_id` (FK), `name`, `target_muscle_group`.
* **routine_assigned_days:** Tabla para manejar el array de días asignados a la rutina (`routine_id`, `day_of_week`).
* **exercises:** Librería de ejercicios. `id`, `name`, `muscle_group`. Puede ser global (sin `user_id`) o privada por usuario.
* **routine_exercises:** Tabla intermedia entre `routines` y `exercises`. Maneja el orden del ejercicio en esa rutina particular y el tiempo de descanso (`rest_time`).
* **routine_sets:** Configuración de las series por defecto para un ejercicio dentro de una rutina. (Ej: 3 sets de 10 reps).
* **workout_sessions:** El registro histórico. `id`, `user_id`, `routine_name` (texto estático por si cambia la rutina original), `date`, `duration_minutes`, `total_volume`, `completed_sets`, `total_sets`.
* **workout_exercises:** Registro de los ejercicios hechos en esa sesión. `id`, `workout_session_id`, `name`, `muscle_group`.
* **workout_sets:** Registro de cada set completado en la sesión. `id`, `workout_exercise_id`, `reps`, `weight`, `completed`.
* **training_days:** Registro para el calendario del usuario. `id`, `user_id`, `date`, `muscle_groups_trained`.

## 6. Sincronización con el Contrato del Frontend

Para que el frontend de React consuma esta API sin errores de TypeScript, asegúrate de que los objetos en `service/response/` sigan exactamente la convención de `API.md`:

- **Nomenclatura:** Usar `camelCase` en los JSON generados (Spring Boot + Jackson lo hace por defecto para variables camelCase en Java).
- **Fechas:** Utilizar formato estándar ISO 8601 (String como `"2023-10-27T10:00:00Z"`). Utilizar `java.time.Instant` o `OffsetDateTime` en Java.
- **Arrays:** Los arreglos deben ser enviados siempre, incluso si están vacíos (no enviar `null`, enviar `[]`).

## 7. Requerimientos de Lógica de Negocio
* **Guardar Entrenamientos:** El endpoint `POST /workouts` recibe una estructura muy anidada (Sesión -> Ejercicios -> Sets). El backend debe guardar todos estos registros de forma transaccional (`@Transactional`). Si algo falla, se deshace todo el guardado para evitar inconsistencias de volumen o series.
* **Cálculo Desacoplado:** El frontend envía métricas calculadas (volumen total, etc.). Por seguridad, el backend de Spring Boot debería recalcular y validar el volumen total multiplicando `reps * weight` de los sets válidos en el servidor antes de insertar en MySQL.
