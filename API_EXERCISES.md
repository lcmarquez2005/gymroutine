# Documentación de API: Catálogo y CRUD de Ejercicios

Este documento detalla la estructura del catálogo de ejercicios ampliado y los endpoints REST disponibles para el frontend de **GymRoutine**.

---

## Recursos Estáticos y Multimedia

El backend expone dos directorios de archivos públicos sin necesidad de autenticación (JWT):

1. **Imágenes del Catálogo Original (`/images/**`)**:
   - Mapeado directamente a la carpeta del dataset original.
   - Ejemplo de acceso: `GET http://localhost:8080/images/flat/ab-wheel-rollout-start.webp`
2. **Multimedia Personalizada del Usuario (`/uploads/**`)**:
   - Mapeado a la carpeta `uploads/` local del backend.
   - Ideal para guardar imágenes o videos grabados por el usuario haciendo los ejercicios.
   - Ejemplo de acceso: `GET http://localhost:8080/uploads/ejercicio-personalizado-1.mp4`

---

## Modelo de Datos: `ExerciseDTO`

Representa la estructura de intercambio (JSON) de un ejercicio.

```json
{
  "id": "ab-wheel-rollout",
  "name": "Rueda Abdominal",
  "muscleGroup": "core",
  "jointPain": false,
  "possibleInjury": false,
  "feelingSick": false,
  "restTime": 60,
  "sets": [],
  "nameEn": "Ab Wheel Rollout",
  "nameDe": "Bauchroller",
  "nameEs": "Rueda Abdominal",
  "descriptionEn": "A core exercise rolling a wheel forward and back, training anti-extension of the spine.",
  "descriptionDe": "Eine Rumpfübung, bei der ein Rad nach vorn und zurück gerollt wird, um Anti-Extension der Wirbelsäule zu trainieren.",
  "descriptionEs": "Un ejercicio de core haciendo rodar una rueda adelante y atrás, que entrena la antiextensión de la columna.",
  "category": "strength",
  "forceType": "pull",
  "mechanic": "compound",
  "difficulty": "intermediate",
  "equipment": "ab_wheel",
  "bodyPart": "core",
  "primaryMuscles": "rectus_abdominis,transverse_abdominis",
  "secondaryMuscles": "anterior_deltoid,latissimus_dorsi,obliques,serratus_anterior",
  "goals": "hypertrophy,strength",
  "tags": "core_focus",
  "isUnilateral": false,
  "isBodyweight": false,
  "instructionsEn": "Kneel on the floor and grip the ab wheel handles shoulder-width.\nBrace the core hard so the lower back stays neutral.\nRoll the wheel slowly forward, extending the body as far as you can control.\nStop before the hips sag or the back arches.\nPull the wheel back to the knees by contracting the abs.",
  "instructionsDe": "...",
  "instructionsEs": "Arrodíllate en el suelo y agarra las asas de la rueda a la anchura de los hombros.\nActiva fuertemente el core para que la zona lumbar quede neutra.\nRueda la rueda lentamente hacia adelante, extendiendo el cuerpo lo más lejos que puedas controlar.\nDetente antes de que las caderas se hundan o la espalda se arquee.\nTira de la rueda de regreso hacia las rodillas contrayendo los abdominales.",
  "tipsEn": "Brace the core before each rep — do not let the lower back arch.\nBuild range gradually, stopping short of any hip sag.\nDrop to a wall stop if you cannot control the bottom.",
  "tipsDe": "...",
  "tipsEs": "Activa el core antes de cada repetición — no dejes que la lumbar se arquee.\nAumenta el rango progresivamente, parando antes de que las caderas se hundan.\nUsa un tope contra la pared si no puedes controlar la posición baja.",
  "met": 6.0,
  "imageStart": "images/flat/ab-wheel-rollout-start.webp",
  "imagePeak": "images/flat/ab-wheel-rollout-peak.webp",
  "customVideoUrl": null,
  "customImageUrl": null
}
```

### Notas sobre los campos:
* `id`: Para los 400 ejercicios por defecto, el ID es un slug legíble (ej. `ab-wheel-rollout`). Para ejercicios creados de manera personalizada, será un UUID.
* `muscleGroup` y `name`: Mantienen la compatibilidad retroactiva con las rutinas existentes (mapeados automáticamente de `bodyPart` y `nameEs` respectivamente).
* `primaryMuscles`, `secondaryMuscles`, `goals`, `tags`: Se devuelven como strings separados por comas para simplificar el parseo en el front.
* `instructions...` y `tips...`: Vienen delimitados por saltos de línea (`\n`) para que el front los pueda separar en listas fácilmente.
* `customVideoUrl` y `customImageUrl`: Reservados para guardar la ruta o URL de videos/fotos grabados por el usuario.

---

## Endpoints REST (`/api/v1/exercises`)

### 1. Obtener catálogo completo
* **HTTP Method**: `GET`
* **Ruta**: `/api/v1/exercises`
* **Seguridad**: Requiere cabecera `Authorization: Bearer <token_jwt>`.
* **Respuesta (`200 OK`)**: Listado de ejercicios activos en formato JSON.

### 2. Crear ejercicio personalizado
* **HTTP Method**: `POST`
* **Ruta**: `/api/v1/exercises`
* **Seguridad**: Requiere cabecera `Authorization: Bearer <token_jwt>`.
* **Cuerpo de la Petición**:
  ```json
  {
    "nameEs": "Mi Ejercicio Personalizado",
    "bodyPart": "pecho",
    "primaryMuscles": "pectoralis_major",
    "customVideoUrl": "uploads/mi_video.mp4"
  }
  ```
* **Respuesta (`200 OK`)**: Retorna el `ExerciseDTO` creado con su ID generado automáticamente (UUID).

### 3. Editar ejercicio existente
* **HTTP Method**: `PUT`
* **Ruta**: `/api/v1/exercises/{id}`
* **Seguridad**: Requiere cabecera `Authorization: Bearer <token_jwt>`.
* **Cuerpo de la Petición**: Envía únicamente los campos que desees actualizar.
  ```json
  {
    "customVideoUrl": "uploads/ab-wheel-usuario.mp4",
    "customImageUrl": "uploads/ab-wheel-usuario-portada.jpg"
  }
  ```
* **Respuesta (`200 OK`)**: Retorna el objeto `ExerciseDTO` actualizado.

### 4. Eliminar/Desactivar ejercicio
* **HTTP Method**: `DELETE`
* **Ruta**: `/api/v1/exercises/{id}`
* **Seguridad**: Requiere cabecera `Authorization: Bearer <token_jwt>`.
* **Respuesta (`204 No Content`)**: Desactiva el ejercicio lógicamente (`active = false`) para evitar romper el historial de entrenamientos o rutinas que ya utilicen este ejercicio.
