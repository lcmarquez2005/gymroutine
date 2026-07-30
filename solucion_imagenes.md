# 🛠️ Solución: Manejo de Imágenes de RepDB en Aplicaciones Externas

Al integrar el dataset de ejercicios de **RepDB** en cualquier aplicación, es común cometer el error de asumir que todos los ejercicios contienen imágenes con las claves `start` (postura inicial) y `peak` (postura máxima). 

Este documento explica por qué ocurre este comportamiento y cómo debes estructurar tu código para evitar imágenes rotas o en blanco.

---

## 🔍 El Problema

El esquema de imágenes del JSON (`exercises.json`) varía según el tipo de ejercicio:

1. **Ejercicios Dinámicos (ej: Press de Banca, Sentadillas):**
   Tienen movimiento diferenciado y contienen las claves `start` y `peak`.
   ```json
   "images": {
     "flat": {
       "start": "images/flat/squat-start.webp",
       "peak": "images/flat/squat-peak.webp"
     }
   }
   ```

2. **Ejercicios Continuos o Estáticos (ej: Bicicleta de Aire, Plancha, Estiramientos):**
   No tienen fases diferenciadas de inicio/fin, por lo que **solo** contienen la clave `main`.
   ```json
   "images": {
     "flat": {
       "main": "images/flat/air-bike-main.webp"
     }
   }
   ```

Si tu aplicación busca únicamente `images.flat.start` o `images.flat.peak`, estos campos darán `undefined` en los ejercicios estáticos, provocando que no se muestre ninguna imagen.

---

## 💡 Comportamiento Esperado (Algoritmo de Fallback)

Para mostrar siempre la imagen correcta sin importar el tipo de ejercicio, debes implementar una lógica de descarte en cadena (fallback):

* **Para la imagen por defecto (o de Inicio):** Usa `start`, si no existe usa `main`, y si tampoco existe usa `peak`.
* **Para la imagen en movimiento (o de Pico/Hover):** Usa `peak`, si no existe usa `main`, y si tampoco existe usa `start`.

---

## 💻 Ejemplos de Implementación

### En JavaScript (Frontend)

```javascript
// Obtiene el objeto de imágenes planas del ejercicio
const flatImages = exercise.images?.flat || {};

// Aplicación del orden de prioridad (Fallback)
const imagenInicio = flatImages.start || flatImages.main || flatImages.peak || 'ruta/a/imagen-por-defecto.png';
const imagenFin = flatImages.peak || flatImages.main || flatImages.start || 'ruta/a/imagen-por-defecto.png';

// Si deseas saber si el ejercicio tiene animación de dos poses:
const esAnimado = !!(flatImages.start && flatImages.peak && flatImages.start !== flatImages.peak);
```

### En TypeScript

```typescript
interface RepDBImages {
  flat?: {
    start?: string;
    peak?: string;
    main?: string;
  };
}

function resolveExerciseImages(images?: RepDBImages) {
  const flat = images?.flat || {};
  return {
    startUri: flat.start ?? flat.main ?? flat.peak ?? 'default.png',
    peakUri: flat.peak ?? flat.main ?? flat.start ?? 'default.png',
    isAnimated: Boolean(flat.start && flat.peak && flat.start !== flat.peak)
  };
}
```

### En Python

```python
def resolver_imagenes(ejercicio):
    images = ejercicio.get("images", {}).get("flat", {})
    
    # Obtener valores con fallback en cascada
    start_img = images.get("start") or images.get("main") or images.get("peak") or "default.png"
    peak_img = images.get("peak") or images.get("main") or images.get("start") or "default.png"
    
    return {
        "start": start_img,
        "peak": peak_img,
        "animated": "start" in images and "peak" in images and images["start"] != images["peak"]
    }
```
