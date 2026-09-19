# 🌾 Plataforma de Conexión Productores Rurales – Mercados Urbanos

Sistema web que permite a productores rurales de **Formosa y el NEA** publicar sus productos, negociar precios en tiempo real mediante un chat y conectar directamente con compradores urbanos (comercios, restaurantes y mayoristas), eliminando intermediarios.

**Stack completo:** Node.js + Express + Sequelize (MySQL) en el backend · React + Tailwind en el frontend · Git Flow para el control de versiones.

---

## 🗂️ FASE 1 · Diagrama de datos y flujo Git

### Diagrama entidad-relación

```
┌────────────────────┐          ┌────────────────────┐
│      PRODUCTOR     │          │      COMPRADOR     │
├────────────────────┤          ├────────────────────┤
│ id PK              │          │ id PK              │
│ nombre             │          │ nombre             │
│ email UQ           │          │ email UQ           │
│ password           │          │ password           │
│ ubicacion          │          │ tipo               │
│ tipo_productos     │          │ ubicacion          │
│ suscripcion        │          │                    │
│ (premium/estandar) │          │                    │
│ deletedAt (soft)   │          │ deletedAt (soft)   │
└─────────┬──────────┘          └─────────┬──────────┘
          │ 1                           N │
          │                               │
          │                       ┌───────┴────────┐
          │ 1               M:N  │ PRODUCTO       │
          │                ┌─────┤ id PK          │
          │                │     │ nombre         │
          │                │     │ descripcion    │
          │                │     │ precio         │
          │                │     │ stock          │
          │                │     │ productor_id FK│
          │                │     │ deletedAt(soft)│
          │                │     └────────┬───────┘
          │                │              │ 1
          │                │              │ N
          │                │     ┌────────┴────────┐
          │                │     │   TRANSACCION   │  (M:N Productor↔Comprador)
          │                └────►│ id PK           │
          │                      │ producto_id FK  │
          │                      │ productor_id FK │
          └─────────────────────►│ comprador_id FK │
                                 │ cantidad        │
                                 │ precio_negociado│
                                 │ estado          │
                                 │ fecha           │
                                 └──────────────────┘

        CHAT (M:N Productor↔Comprador)
        ├── id PK
        ├── productor_id FK
        ├── comprador_id FK
        ├── mensaje
        ├── precio_oferta   ← valida el precio negociado de la transacción
        └── fecha

Suscripción Premium (1 a 1 opcional): modelada como campo ENUM en PRODUCTOR.
```

### Reglas de negocio implementadas

| Regla | Implementación |
|---|---|
| No se pueden publicar productos sin productor | `crearProducto` valida que exista un `Productor` para el usuario autenticado (`productoController.js`) |
| Emails únicos entre productores y compradores | Unique en BD + verificación cruzada `Productor`/`Comprador` en `authController.js` (respuesta 409) |
| No confirmar pedidos con stock insuficiente | Verificación al crear la transacción y al confirmarla (`transaccionController.js`) |
| Eliminación lógica (soft delete) | `paranoid: true` en Productor, Comprador, Producto, Transaccion y Chat |
| Precio negociado > 0 y validado en el chat | `isFloat({ gt: 0 })` + la confirmación exige un mensaje en el `Chat` con `precio_oferta` igual al `precio_negociado` |

### Flujo de trabajo Git (estándar IPF)

```
main
 └── develop
      ├── feature/backend-api
      ├── feature/frontend-react
      └── feature/docker-docs
```

- `main` → código estable y listo para entregar.
- `develop` → integración de ramas `feature/*`.
- `feature/<descripcion>` → cada funcionalidad se desarrolla y se fusiona en `develop` con merge limpio (sin fast-forward forzado).
- Los commits se escriben en español con mensajes descriptivos (`git add -p` / commits atómicos).

---

## 📦 FASE 2 · Backend (Express + Sequelize)

### Estructura

```
backend/
 ├── src/
 │   ├── config/          # env.js, db.js (conexión MySQL + sequelize)
 │   ├── models/          # Productor, Producto, Comprador, Transaccion, Chat + index.js (asociaciones)
 │   ├── controllers/     # Lógica de negocio y respuestas HTTP
 │   ├── routes/          # Rutas con middlewares y validadores
 │   ├── middlewares/     # validateRequest, errorHandler, auth (JWT + roles)
 │   └── validators/      # Schemas express-validator por entidad
 ├── tests/               # Suite de pruebas E2E (npm test)
 ├── app.js               # Configuración del servidor Express
 ├── server.js            # Punto de entrada: sincroniza BD y escucha
 ├── .env.example
 └── .gitignore
```

### Endpoints principales

| Método | Ruta | Acción | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/productores/registro` | Registrar productor | — |
| POST | `/api/v1/compradores/registro` | Registrar comprador | — |
| POST | `/api/v1/auth/login` | Login (productor o comprador) | — |
| GET | `/api/v1/productos` | Listar productos (filtro por `productor_id`, `en_stock`) | — |
| POST | `/api/v1/productos` | Publicar producto | productor |
| PATCH / DELETE | `/api/v1/productos/:id` | Editar / eliminar (soft) | productor dueño |
| POST | `/api/v1/transacciones` | Crear pedido (pendiente) | comprador |
| PATCH | `/api/v1/transacciones/:id/estado` | Confirmar (productor) / Entregar (comprador) | según rol |
| GET/POST | `/api/v1/chats/productor/:id/comprador/:id` | Conversación / enviar mensaje con `precio_oferta` | participantes |
| GET | `/api/v1/productores/:id/estadisticas` | Métricas del productor | token |
| GET | `/api/v1/productores/:id/compradores` | Compradores conectados vía transacciones | token |

### Instalación y puesta en marcha

```bash
cd backend
cp .env.example .env      # completar credenciales de MySQL
npm install
npm run seed              # crea la BD, las tablas y datos demo
npm run dev               # servidor en http://localhost:4000
npm test                  # suite E2E (20 pruebas)
```

> En `server.js` la sincronización usa `sync({ alter: true })` en desarrollo. La base se crea automáticamente con el seed (`nodemon` no la crea).

---

## 🎨 FASE 3 · Frontend (React + Tailwind)

### Estructura

```
frontend/
 ├── src/
 │   ├── services/        # api.js (axios) + servicios por dominio
 │   ├── context/         # AuthContext (sesión con JWT)
 │   ├── components/      # Navbar, Modal, Spinner, Alerta, ProtectedRoute
 │   └── pages/           # Login, Registro, Inicio, Productos, Productores, Compradores, Transacciones, Chats
 ├── index.html
 ├── vite.config.js       # proxy /api → localhost:4000
 ├── tailwind.config.js
 └── package.json
```

### Instalación y puesta en marcha

```bash
cd frontend
npm install
npm run dev               # app en http://localhost:5173 (proxy hacia el backend)
```

### Funcionalidades de UX

- Formularios con validación y feedback claro (errores por campo + alertas).
- Listados dinámicos, estados de carga (`Spinner`) y empty states.
- Modales de creación/edición y confirmación de eliminación.
- Flujo completo de negociación: el comprador oferta un precio en el chat y crea el pedido; el productor lo confirma solo si el precio coincide con la oferta.
- Protección de rutas y redirección automática a `/login` ante token expirado (interceptor axios).

---

## ✅ FASE 4 · Guía de prueba y checklist de evaluación

### Precondición

1. MySQL activo (el proyecto fue probado con MySQL 8.4 en WAMP, puerto 3306).
2. `backend/.env` con credenciales correctas.
3. Backend en `:4000` y Frontend en `:5173`.

### Checklist funcional

| # | Criterio | Cómo comprobarlo |
|---|---|---|
| 1 | Registro de productor y comprador | Crear cuenta en `/registro`, elegir rol |
| 2 | Login por rol | `/login` con `juan@productor.com` (productor) o `comprar@restaurante.com` (comprador), password `123456` |
| 3 | Email único | Registrar un comprador con el email del productor → error 409 |
| 4 | Publicar producto logueado como productor | Sección Productos → "+ Publicar producto" |
| 5 | No publicar sin productor | `POST /productos` sin token → 401; sin rol productor → 403 |
| 6 | Crear pedido (comprador) | Botón "Pedir" en un producto; cantidad ≤ stock y precio > 0 |
| 7 | Stock insuficiente | Pedir más unidades que el stock → error del backend |
| 8 | Confirmación validada en chat | El comprador oferta $X en `/chats`; el productor confirma el pedido de $X → OK. Confirmar con precio nunca ofertado → 400 |
| 9 | Stock al confirmar | Ver que el stock del producto disminuye al confirmar |
| 10 | Entrega | El comprador marca "entregado" sobre un pedido confirmado |
| 11 | Soft delete | Eliminar un producto; no aparece en el listado pero sigue en BD con `deleted_at` |
| 12 | Permisos | Un comprador no puede editar/eliminar productos ajenos (403) |
| 13 | Errores semánticos | 200 OK · 201 creado · 400 validación · 401 no autenticado · 403 sin permiso · 404 no existe · 409 conflicto · 500 error interno |

### Datos demo (seed)

| Rol | Email | Password |
|---|---|---|
| Productor | `juan@productor.com` | `123456` |
| Productor | `maria@productor.com` | `123456` |
| Comprador | `comprar@restaurante.com` | `123456` |
| Comprador | `ventas@mayorista.com` | `123456` |

### Pruebas automatizadas

```bash
cd backend
npm run seed     # estado limpio (opcional, el test reconstruye la BD)
npm test         # 20 casos E2E sobre las reglas de negocio
```

---

## 🔐 Seguridad

- Contraseñas con `bcryptjs` (hash de 10 rondas).
- Autenticación JWT (8 h) con roles `productor` / `comprador`.
- Middlewares `authenticate` + `authorize`.
- Variables sensibles fuera del repositorio (`.env` en `.gitignore`).