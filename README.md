# Sistema Backend de Turnos y Reservas

Entrega final del curso de Backend. API del Sistema Backend de Turnos y Reservas, hecha con Node.js, Express (ESM), MongoDB Atlas y Mongoose. Gestiona los recursos `services` y `bookings` y define el modelo `messages`. Los datos se guardan en colecciones de MongoDB.

La API acepta filtros, paginación y ordenamiento en el listado de servicios, valida todos los datos de entrada con **Zod** antes de llegar a la base y devuelve las reservas con los datos completos de sus servicios usando `populate`.

Además de la API REST, incluye vistas renderizadas en el servidor con **Handlebars** y actualizaciones en tiempo real con **Socket.io**: cuando se crea o modifica un servicio o una reserva, las vistas abiertas se actualizan sin recargar la página.

## Requisitos de la entrega

| Requisito | Dónde se cumple |
|-----------|-----------------|
| CRUD completo de servicios | `GET`, `POST`, `PUT` y `DELETE` en `/api/services` ([Recurso `services`](#recurso-services)). |
| Crear y consultar reservas, y asociarles servicios | `POST /api/bookings`, `GET /api/bookings/:bid` y `POST /api/bookings/:bid/services/:sid` ([Recurso `bookings`](#recurso-bookings)). |
| Las reservas guardan `ObjectId` y `quantity`, nunca el objeto completo | `src/models/booking.model.js`: `services: [{ service: ObjectId, quantity }]`. |
| Filtros, paginación y ordenamiento por query params | `GET /api/services?category=&available=&page=&limit=&sortBy=&order=` ([detalle](#filtros-paginación-y-ordenamiento)). |
| Reservas con los datos completos de sus servicios (`populate`) | `GET /api/bookings/:bid` ([ejemplo](#consultar-una-reserva-con-sus-servicios-completos)). |
| Validación con Zod antes de llegar a la base | `src/validations` + middleware `src/middlewares/validate.js` ([Validaciones](#validaciones-zod)). |
| Vista con Handlebars | `/views/services` y `/views/bookings` ([Vistas](#vistas-handlebars)). |
| Tiempo real con Socket.io | Las vistas se actualizan solas al crear o modificar servicios y reservas ([Tiempo real](#tiempo-real-socketio)). |
| MongoDB Atlas + Mongoose en capas | `routes → controllers → services → repositories → DAO → models` ([Arquitectura](#arquitectura-en-capas)). |
| Configuración con `.env`, `.env.example` incluido, sin credenciales | `src/config/env.config.js` valida las variables; `.env` y `node_modules` están en `.gitignore`. |

## Inicio rápido

```bash
npm install
cp .env.example .env      # completar MONGO_URI (en PowerShell: copy .env.example .env)
npm run seed              # opcional: carga 4 servicios de ejemplo
npm start
```

Después abrí `http://localhost:8080`, que redirige a la vista de servicios.

## Instalación

```bash
git clone <url-del-repo>
cd <carpeta-del-repo>
npm install
```

Creá tu archivo `.env` a partir de `.env.example`:

```
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/turnos?retryWrites=true&w=majority
```

El archivo `.env` no se sube al repositorio (está en `.gitignore`, igual que `node_modules`).

### Obtener la URI de MongoDB Atlas

1. Creá una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) y un cluster gratuito (M0).
2. En **Database Access**, creá un usuario con contraseña.
3. En **Network Access**, permití tu IP (o `0.0.0.0/0` para pruebas).
4. En el cluster, entrá a **Connect → Drivers** y copiá la URI.
5. Reemplazá `<usuario>` y `<password>`, y agregá el nombre de la base antes del `?` (por ejemplo `/turnos`).

## Ejecución

| Script          | Qué hace |
|-----------------|----------|
| `npm start`     | Levanta el servidor. |
| `npm run dev`   | Levanta el servidor y lo reinicia al guardar cambios (`node --watch`). |
| `npm run seed`  | Carga 4 servicios de ejemplo. Solo inserta si la colección está vacía, así que no duplica ni pisa datos. |

El servidor se conecta a MongoDB y después corre en `http://localhost:8080`. Si no puede conectarse, no arranca y muestra el error.

| URL                                    | Qué es |
|----------------------------------------|--------|
| `http://localhost:8080/`               | Redirige a `/views/services`. |
| `http://localhost:8080/views/services`  | Vista de servicios (en tiempo real). |
| `http://localhost:8080/views/bookings`  | Vista de reservas (en tiempo real). |
| `http://localhost:8080/api/...`         | API REST. |

## Variables de entorno

| Variable    | Descripción                     | Ejemplo                                  |
|-------------|---------------------------------|------------------------------------------|
| `PORT`      | Puerto del servidor             | `8080`                                   |
| `NODE_ENV`  | Entorno de ejecución            | `development`                            |
| `MONGO_URI` | URI de conexión a MongoDB Atlas | `mongodb+srv://...mongodb.net/turnos`    |

Si falta alguna, la app no arranca y muestra un mensaje de error.

## Arquitectura en capas

Cada petición recorre las capas en este orden:

```
router → validación (Zod) → controller → service → repository → DAO → MongoDB (Mongoose)
```

| Capa       | Carpeta             | Responsabilidad |
|------------|---------------------|-----------------|
| Router     | `src/routes`        | Define los endpoints y les asigna el middleware de validación y el controller. |
| Validación | `src/validations`, `src/middlewares/validate.js` | Esquemas de Zod y middleware que valida `body`, `params` y `query`. Si algo no es válido corta con `400` antes de llegar al controller. |
| Controller | `src/controllers`   | Lee `req.params`, `req.query` y `req.body`, llama al service y responde con `res.status().json()` (API) o `res.render()` (vistas). |
| Service    | `src/services`      | Contiene las reglas de negocio. No conoce `req` ni `res`. |
| Repository | `src/repositories`  | Ofrece los métodos de acceso a datos, sin reglas de negocio. |
| DAO        | `src/dao`           | Consulta y escribe en MongoDB usando los modelos de Mongoose. Sin lógica de negocio. |
| Modelos    | `src/models`        | Schemas de Mongoose de cada colección. |

Reglas de negocio que viven en los services:

- Responder `404` cuando un servicio o una reserva no existe.
- Ignorar el `id` enviado al actualizar un servicio.
- Armar los filtros, el orden y los metadatos de paginación del listado de servicios.
- Al agregar un servicio que ya está en la reserva, incrementar `quantity` en vez de duplicarlo.

El repository recibe el DAO en su constructor. Por eso la migración a MongoDB solo reemplazó los DAOs, sin tocar routers ni controllers.

Las vistas usan las mismas capas que la API: `views.router → views.controller → service → repository → DAO → model`. El controller de vistas no tiene lógica de negocio: pide los datos al service y los pasa a la plantilla.

## Vistas (Handlebars)

| Ruta               | Plantilla                         | Muestra |
|--------------------|-----------------------------------|---------|
| `/views/services`  | `src/views/services.handlebars`   | Todos los servicios: nombre, descripción, duración, precio, categoría y disponibilidad. Incluye un formulario para crear servicios y un botón para cambiar la disponibilidad. |
| `/views/bookings`  | `src/views/bookings.handlebars`   | Todas las reservas con cliente, fecha, hora, estado y los servicios reservados (con cantidad y precio). |

Las plantillas no tienen datos escritos a mano: todo viene de MongoDB. El layout está en `src/views/layouts/main.handlebars`, los helpers de formato (precio, disponibilidad) en `src/views/helpers.js` y los estilos en `src/public/css/styles.css`.

## Tiempo real (Socket.io)

Socket.io se inicia junto con el servidor HTTP (`src/sockets/socket.js`). Después de cada acción que cambia datos, el controller de la API emite un evento con la lista actualizada, que se obtiene a través de los services (`src/sockets/notifier.js`):

| Acción                                      | Evento emitido                         |
|---------------------------------------------|----------------------------------------|
| `POST /api/services`                        | `services:updated`                     |
| `PUT /api/services/:sid`                    | `services:updated`, `bookings:updated` |
| `DELETE /api/services/:sid`                 | `services:updated`, `bookings:updated` |
| `POST /api/bookings`                        | `bookings:updated`                     |
| `POST /api/bookings/:bid/services/:sid`     | `bookings:updated`                     |

Un cambio en un servicio también avisa a la vista de reservas, porque las reservas muestran el nombre y el precio de sus servicios.

El cliente (`src/public/js/socket.js`) escucha esos eventos y vuelve a dibujar la tabla, resaltando las filas nuevas o modificadas. Los botones de la vista de servicios usan la API REST (`POST` y `PUT /api/services`), así que la acción le llega en vivo a todos los navegadores conectados.

Para probarlo: abrí `http://localhost:8080/views/services` en dos pestañas, creá un servicio o cambiá su disponibilidad en una y mirá cómo se actualiza la otra. También funciona con los `curl` de la API: por ejemplo, con `/views/bookings` abierta, creá una reserva o agregale un servicio.

## Modelos

| Modelo    | Archivo                        | Colección  | Campos |
|-----------|--------------------------------|------------|--------|
| `Service` | `src/models/service.model.js`  | `services` | `name`, `description`, `duration`, `price`, `category`, `available` |
| `Booking` | `src/models/booking.model.js`  | `bookings` | `clientName`, `clientEmail`, `date`, `time`, `status`, `services` |
| `Message` | `src/models/message.model.js`  | `messages` | `user`, `message`, `createdAt`, `updatedAt` |

En `Booking`, los servicios se guardan como referencia por `ObjectId`, no como objeto completo:

```javascript
services: [{ service: ObjectId /* ref: 'Service' */, quantity: Number }]
```

Al consultar una reserva, Mongoose usa `populate` para devolver los datos de cada servicio.

Todas las respuestas muestran `id` en lugar de `_id` y no incluyen `__v`.

## Estructura

```
src/
  app.js                       Configura Express, Handlebars, archivos estáticos y routers
  server.js                    Conecta a MongoDB, levanta el servidor e inicia Socket.io
  config/env.config.js         Carga y valida las variables de entorno
  config/db.config.js          Conexión a MongoDB con Mongoose
  models/                      service.model.js, booking.model.js, message.model.js
  routes/                      services.router.js, bookings.router.js, views.router.js
  controllers/                 services.controller.js, bookings.controller.js, views.controller.js
  services/                    services.service.js, bookings.service.js
  repositories/                services.repository.js, bookings.repository.js
  dao/                         services.dao.js, bookings.dao.js
  validations/                 services.validation.js, bookings.validation.js, common.validation.js (esquemas de Zod)
  middlewares/validate.js      Middleware que aplica un esquema de Zod a body, params o query
  middlewares/notFound.js      Responde 404 para las rutas que no existen
  middlewares/errorHandler.js  Manejo central de errores
  errors/AppError.js           Error con código HTTP
  scripts/seed.js              Carga servicios de ejemplo (npm run seed)
  sockets/socket.js            Inicia Socket.io y emite eventos
  sockets/notifier.js          Avisa a los clientes cuando cambian servicios o reservas
  views/
    layouts/main.handlebars    Layout común (encabezado, navegación y scripts)
    services.handlebars        Vista de servicios
    bookings.handlebars        Vista de reservas
    helpers.js                 Helpers de formato para las plantillas
  public/
    css/styles.css             Estilos de las vistas
    js/socket.js               Cliente de Socket.io que actualiza las vistas
```

Funciones por capa:

| Recurso    | Controller y service | Repository y DAO |
|------------|----------------------|------------------|
| `services` | `getServices`, `getAllServices`, `getServiceById`, `createService`, `updateService`, `deleteService` | `paginate`, `getAll`, `getById`, `create`, `update`, `delete` |
| `bookings` | `getBookings`, `createBooking`, `getBookingById`, `addServiceToBooking` | `getAll`, `create`, `getById`, `update` |

`getServices` usa `paginate` para la API. `getAllServices` y `getBookings` (con `getAll`) devuelven todo sin paginar y los usan las vistas y los avisos de Socket.io; no hay un endpoint de la API que liste todas las reservas.

## Recurso `services`

```json
{
  "id": "673a1f2b9c1e4a0012345678",
  "name": "Corte de cabello",
  "description": "Corte de cabello clásico con lavado incluido",
  "duration": 30,
  "price": 5000,
  "category": "peluquería",
  "available": true
}
```

El `id` es el `ObjectId` que genera MongoDB y no se puede modificar. `duration` está en minutos.

| Método | Ruta                 | Descripción                                        | Códigos       |
|--------|----------------------|----------------------------------------------------|---------------|
| GET    | `/api/services`      | Lista los servicios con filtros, paginación y orden | 200, 400      |
| GET    | `/api/services/:sid` | Obtiene un servicio por id                         | 200, 400, 404 |
| POST   | `/api/services`      | Crea un servicio                                   | 201, 400      |
| PUT    | `/api/services/:sid` | Actualiza un servicio                              | 200, 400, 404 |
| DELETE | `/api/services/:sid` | Elimina un servicio                                | 200, 400, 404 |

### Filtros, paginación y ordenamiento

`GET /api/services` acepta estos query params (todos opcionales y combinables):

| Parámetro   | Valores                                   | Por defecto | Descripción |
|-------------|-------------------------------------------|-------------|-------------|
| `category`  | texto                                     | —           | Filtra por categoría, sin distinguir mayúsculas (`Estética` = `estética`). |
| `available` | `true`, `false`                           | —           | Filtra por disponibilidad. |
| `page`      | entero desde 1                            | `1`         | Página a devolver. |
| `limit`     | entero de 1 a 100                         | `10`        | Cantidad de resultados por página. |
| `sortBy`    | `name`, `price`, `duration`, `category`   | —           | Campo por el que se ordena. Sin `sortBy` se respeta el orden de creación. |
| `order`     | `asc`, `desc`                             | `asc`       | Sentido del orden. |

La respuesta trae el listado en `payload` y los metadatos de paginación:

```json
{
  "payload": [ { "id": "673a1f2b9c1e4a0012345678", "name": "Masaje descontracturante", "price": 9000, "...": "..." } ],
  "totalDocs": 23,
  "page": 2,
  "limit": 5,
  "totalPages": 5,
  "hasPrevPage": true,
  "hasNextPage": true,
  "prevPage": 1,
  "nextPage": 3
}
```

| Campo         | Significado |
|---------------|-------------|
| `payload`     | Servicios de la página pedida. |
| `totalDocs`   | Total de servicios que cumplen los filtros (en todas las páginas). |
| `page`        | Página actual. |
| `limit`       | Resultados por página. |
| `totalPages`  | Cantidad total de páginas (`0` si no hay resultados). |
| `hasPrevPage` / `hasNextPage` | Si existe una página anterior / siguiente. |
| `prevPage` / `nextPage`       | Número de la página anterior / siguiente, o `null`. |

Ejemplos:

```bash
# Primera página con 10 resultados (valores por defecto)
curl "http://localhost:8080/api/services"

# Solo servicios de estética disponibles
curl "http://localhost:8080/api/services?category=est%C3%A9tica&available=true"

# Página 2, de a 5 resultados
curl "http://localhost:8080/api/services?page=2&limit=5"

# Del más caro al más barato
curl "http://localhost:8080/api/services?sortBy=price&order=desc"

# Todo combinado: disponibles, ordenados por nombre, página 1 de a 3
curl "http://localhost:8080/api/services?available=true&sortBy=name&order=asc&page=1&limit=3"
```

Si se pide una página mayor a `totalPages`, `payload` llega vacío.

## Recurso `bookings`

En la base, cada reserva guarda solo la **referencia** a sus servicios:

```javascript
services: [{ service: ObjectId /* ref: 'Service' */, quantity: Number }]
```

`populate` se usa únicamente al consultar, para reemplazar cada `ObjectId` por los datos completos del servicio. Nunca se guarda el servicio completo dentro de la reserva.

| Método | Ruta                               | Descripción                      | Códigos       |
|--------|------------------------------------|----------------------------------|---------------|
| POST   | `/api/bookings`                    | Crea una reserva                 | 201, 400      |
| GET    | `/api/bookings/:bid`               | Obtiene una reserva con sus servicios completos | 200, 400, 404 |
| POST   | `/api/bookings/:bid/services/:sid` | Agrega un servicio a una reserva | 200, 400, 404 |

Una reserva nueva arranca con `services` vacío y `status` en `pending` si no se indica otro. Si un servicio de la reserva fue eliminado, se quita de la reserva la próxima vez que se le agregue un servicio.

### Consultar una reserva con sus servicios completos

```bash
curl http://localhost:8080/api/bookings/673a20109c1e4a00123456ab
```

Respuesta: los datos de la reserva (cliente, email, fecha, hora y estado) y, en `services`, cada servicio completo gracias a `populate`:

```json
{
  "id": "673a20109c1e4a00123456ab",
  "clientName": "Gonzalo",
  "clientEmail": "gonzalo@mail.com",
  "date": "2026-11-20",
  "time": "15:00",
  "status": "pending",
  "services": [
    {
      "service": {
        "id": "673a1f2b9c1e4a0012345678",
        "name": "Corte de cabello",
        "description": "Corte de cabello clásico con lavado incluido",
        "duration": 30,
        "price": 5000,
        "category": "peluquería",
        "available": true
      },
      "quantity": 2
    }
  ]
}
```

`POST /api/bookings/:bid/services/:sid` también devuelve la reserva con los servicios completos.

## Validaciones (Zod)

Los esquemas están en `src/validations` y se aplican en las rutas con el middleware `validate(schema, source)` (`src/middlewares/validate.js`). Si los datos no son válidos, la petición se corta con `400` y **no llega al controller ni a MongoDB**. Si son válidos, el controller recibe los datos ya limpios en `req.validated`: por ejemplo, se descartan los campos que no están en el esquema, como un `id` enviado en el body.

| Endpoint                                | Qué valida | Reglas |
|-----------------------------------------|------------|--------|
| `GET /api/services`                     | query      | `available` es `true`/`false`; `page` entero ≥ 1; `limit` entero de 1 a 100; `sortBy` en `name`, `price`, `duration`, `category`; `order` en `asc`, `desc`. |
| `POST /api/services`                    | body       | `name`, `description` y `category`: texto no vacío. `duration`: entero mayor a 0. `price`: número ≥ 0. `available`: booleano. Todos obligatorios. |
| `PUT /api/services/:sid`                | params, body | `sid` con formato de `ObjectId`. Mismas reglas que al crear, pero todos los campos son opcionales; hay que enviar al menos uno. |
| `GET` y `DELETE /api/services/:sid`     | params     | `sid` con formato de `ObjectId`. |
| `POST /api/bookings`                    | body       | `clientName`: texto no vacío. `clientEmail`: email válido. `date`: fecha real con formato `AAAA-MM-DD`. `time`: hora `HH:MM` (24 h). `status` (opcional): `pending`, `confirmed` o `cancelled`. |
| `GET /api/bookings/:bid`                | params     | `bid` con formato de `ObjectId`. |
| `POST /api/bookings/:bid/services/:sid` | params     | `bid` y `sid` con formato de `ObjectId`. |

Ejemplo de respuesta ante datos inválidos (`POST /api/services` con `{"name":"Prueba","price":"abc"}`):

```json
{
  "error": "description es obligatorio. duration es obligatorio. price debe ser un número. category es obligatorio. available es obligatorio",
  "details": [
    { "field": "description", "message": "description es obligatorio" },
    { "field": "duration", "message": "duration es obligatorio" },
    { "field": "price", "message": "price debe ser un número" },
    { "field": "category", "message": "category es obligatorio" },
    { "field": "available", "message": "available es obligatorio" }
  ]
}
```

Los schemas de Mongoose mantienen sus propias reglas (`required`, `min`, `enum`) como segunda barrera, pero la validación principal ocurre antes, en Zod.

## Errores

Todas las respuestas de error tienen la forma `{ "error": "mensaje" }`. Los errores de validación agregan `details` con el campo y el mensaje de cada problema.

- `400`: datos inválidos según Zod (campos faltantes, tipos incorrectos, query params inválidos o un id sin formato de `ObjectId`) o un body que no es JSON válido.
- `404`: el servicio o la reserva no existe (el id tiene formato válido, pero no está en la base), o la ruta no existe.
- `500`: error interno, por ejemplo una falla de conexión con MongoDB.

## Ejemplos

```bash
# Crear un servicio (la respuesta trae su id)
curl -X POST http://localhost:8080/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Depilación","description":"Depilación con cera","duration":20,"price":4000,"category":"estética","available":true}'

# Datos inválidos: responde 400 con el detalle
curl -X POST http://localhost:8080/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Prueba","price":"abc"}'

# Actualizar solo el precio (el id del body se ignora)
curl -X PUT http://localhost:8080/api/services/<sid> \
  -H "Content-Type: application/json" \
  -d '{"price":4500,"id":"otro"}'

# Crear una reserva (la respuesta trae su id)
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"clientName":"Gonzalo","clientEmail":"gonzalo@mail.com","date":"2026-11-20","time":"15:00"}'

# Agregar un servicio a una reserva (si se repite, quantity pasa a 2)
curl -X POST http://localhost:8080/api/bookings/<bid>/services/<sid>

# Ver la reserva con los servicios completos
curl http://localhost:8080/api/bookings/<bid>
```
