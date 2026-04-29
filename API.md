# GymRoutine API Specification

Este documento define la estructura de los endpoints RESTful necesarios para conectar el frontend de **GymRoutine** con un backend desarrollado en **Spring Boot**. La estructura está basada en el estado actual y entidades de la aplicación React.

## Base URL Recomendada
`/api/v1`

---

## 1. Autenticación y Usuarios (`/auth`, `/users`)

### Autenticación
- **POST** `/auth/login`
  - **Descripción**: Inicia sesión en la aplicación.
  - **Body**: `{ "email": "...", "password": "..." }`
  - **Respuesta**: `{ "token": "jwt_token_here", "user": { ... } }`

- **POST** `/auth/register`
  - **Descripción**: Registra un nuevo usuario.
  - **Body**: `{ "name": "...", "email": "...", "password": "..." }`
  - **Respuesta**: `{ "token": "jwt_token_here", "user": { ... } }`

### Usuarios
- **GET** `/users/me`
  - **Descripción**: Obtiene los datos del usuario autenticado, incluyendo sus días de entrenamiento y estadísticas generales.
  - **Respuesta**:
    ```json
    {
      "id": "user-1",
      "name": "Alex Márquez",
      "email": "alex@example.com",
      "trainingDays": [
        {
          "date": "2023-10-25",
          "muscleGroupsTrained": ["pecho", "triceps"]
        }
      ]
    }
    ```

---

## 2. Rutinas (`/routines`)

- **GET** `/routines`
  - **Descripción**: Obtiene todas las rutinas del usuario autenticado.
  - **Respuesta**: `List<Routine>`

- **GET** `/routines/{id}`
  - **Descripción**: Obtiene los detalles de una rutina específica por su ID.
  - **Respuesta**: `Routine`

- **POST** `/routines`
  - **Descripción**: Crea una nueva rutina.
  - **Body**:
    ```json
    {
      "name": "Pecho y Tríceps",
      "targetMuscleGroup": "pecho",
      "assignedDays": ["lunes", "jueves"],
      "exercises": [ ... ] // Lista de ejercicios con sus sets iniciales
    }
    ```
  - **Respuesta**: `Routine` (con ID generado y guardado)

- **PUT** `/routines/{id}`
  - **Descripción**: Actualiza una rutina existente (cambio de nombre, ejercicios, días asignados).
  - **Body**: `Routine`
  - **Respuesta**: `Routine` actualizada

- **DELETE** `/routines/{id}`
  - **Descripción**: Elimina una rutina.
  - **Respuesta**: `204 No Content`

---

## 3. Ejercicios (Librería) (`/exercises`)

- **GET** `/exercises`
  - **Descripción**: Obtiene la librería global y personal de ejercicios disponibles para el usuario.
  - **Respuesta**: `List<Exercise>`

- **POST** `/exercises`
  - **Descripción**: Añade un nuevo ejercicio personalizado a la librería del usuario.
  - **Body**:
    ```json
    {
      "name": "Press Militar",
      "muscleGroup": "hombros"
    }
    ```
  - **Respuesta**: `Exercise` (con ID generado)

---

## 4. Sesiones de Entrenamiento / Historial (`/workouts`)

- **GET** `/workouts`
  - **Descripción**: Obtiene el historial de entrenamientos completados del usuario. Se recomienda permitir parámetros de paginación (`?page=0&size=10`).
  - **Respuesta**: `List<WorkoutSession>`

- **GET** `/workouts/{id}`
  - **Descripción**: Obtiene los detalles completos de una sesión de entrenamiento específica finalizada.
  - **Respuesta**: `WorkoutSession`

- **POST** `/workouts`
  - **Descripción**: Guarda una nueva sesión de entrenamiento completada (llamado al pulsar "Terminar Entrenamiento").
  - **Body**:
    ```json
    {
      "routineName": "Pecho y Tríceps",
      "date": "2023-10-28T10:00:00Z",
      "durationMinutes": 65,
      "totalVolume": 4500,
      "completedSets": 12,
      "totalSets": 15,
      "muscleGroupsTrained": ["pecho", "triceps"],
      "exercises": [ ... ] // Ejercicios con el registro exacto de las series completadas
    }
    ```
  - **Respuesta**: `WorkoutSession` (con ID generado)

---

## Modelos de Datos (DTOs Recomendados para Spring Boot)

Asegúrate de que las Entidades (Entities) en Java / Kotlin se mapeen correctamente a estos tipos o crea DTOs (Data Transfer Objects) que respeten esta estructura para evitar problemas de compatibilidad en el cliente:

### `RoutineDTO`
- `String id`
- `String name`
- `String targetMuscleGroup`
- `List<ExerciseDTO> exercises`
- `List<String> assignedDays`

### `ExerciseDTO`
- `String id`
- `String name`
- `String muscleGroup`
- `List<SetDTO> sets`
- `Integer restTime` (Opcional, en segundos)

### `SetDTO`
- `String id`
- `Integer reps`
- `Float weight`
- `Boolean completed`

### `WorkoutSessionDTO`
- `String id`
- `String routineName`
- `String date` (ISO 8601)
- `Integer durationMinutes`
- `Float totalVolume`
- `Integer completedSets`
- `Integer totalSets`
- `List<String> muscleGroupsTrained`
- `List<ExerciseDTO> exercises`

### `TrainingDayDTO`
- `String date` (ISO 8601)
- `List<String> muscleGroupsTrained`
