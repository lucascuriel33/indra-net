<p align="center">
  <img src="https://img.shields.io/badge/cloudflare-pages-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare Pages"/>
  <img src="https://img.shields.io/badge/database-D1_(SQLite)-003682?style=flat-square&logo=sqlite&logoColor=white" alt="D1"/>
  <img src="https://img.shields.io/badge/payments-MercadoPago-00B1EA?style=flat-square&logo=mercadopago&logoColor=white" alt="MercadoPago"/>
  <img src="https://img.shields.io/badge/language-es-red?style=flat-square" alt="Español"/>
</p>

<h1 align="center">
  <br>
  ◉ Indra Net
  <br>
</h1>

<p align="center">
  <strong>Tienda e-commerce serverless con diseño cinematográfico</strong><br>
  <sub>Cloudflare Pages · D1 · Pages Functions · MercadoPago</sub>
</p>

<p align="center">
  <a href="#-inicio-rápido">Inicio Rápido</a> ·
  <a href="#-deployment">Deployment</a> ·
  <a href="#-api">API</a> ·
  <a href="#-mercadopago">MercadoPago</a> ·
  <a href="#-sistema-de-diseño">Diseño</a>
</p>

---

## Qué es Indra Net

Una tienda online que corre 100% en el edge de Cloudflare — sin servidores, sin contenedores, sin infraestructura que mantener. Las páginas estáticas se sirven desde el CDN global, la lógica de negocio corre en Pages Functions (edge JavaScript), y los datos viven en D1, la base de datos SQLite serverless de Cloudflare. Los pagos se procesan a través de MercadoPago.

La interfaz está construida con una estética inspirada en Linear y Vercel: fondos de negro profundo con gradientes animados, texturas de ruido SVG, un motivo geométrico de red (la "Red de Indra"), tarjetas con sombras multicapa, y un efecto de spotlight que sigue el cursor del mouse.

---

## ◈ Estructura del Proyecto

```
indra-net/
│
├── public/                         Archivos estáticos → CDN global
│   ├── index.html                  Tienda principal
│   ├── product.html                Detalle de producto
│   ├── checkout.html               Checkout con MercadoPago
│   ├── admin.html                  Login de administrador
│   ├── dashboard.html              Panel de administración (CRUD)
│   ├── success.html                Pago exitoso
│   ├── failure.html                Pago fallido
│   ├── pending.html                Pago pendiente
│   ├── _routes.json                Rutas estáticas vs. funciones
│   └── static/
│       ├── css/style.css           Sistema de diseño completo
│       └── js/main.js              Carrito, toasts, spotlights
│
├── functions/                      Edge Functions (serverless JS)
│   ├── _middleware.js              Auth + CORS
│   ├── api/
│   │   ├── products/               CRUD de productos
│   │   ├── categories/             Listado de categorías
│   │   ├── orders/                 Gestión de pedidos
│   │   ├── checkout/               Crear pedido + preferencia MP
│   │   └── webhook/mp.js           Webhook IPN de MercadoPago
│   └── admin/
│       ├── login.js                Autenticación
│       ├── logout.js               Cerrar sesión
│       └── check.js                Verificar estado de sesión
│
├── schema.sql                      Esquema de la base de datos D1
├── seed.sql                        Datos iniciales de productos
├── wrangler.toml                   Configuración de Cloudflare
├── package.json                    Scripts de desarrollo y deploy
└── .dev.vars.example               Template de secrets locales
```

---

## 🚀 Inicio Rápido

### Requisitos previos

- [Node.js](https://nodejs.org/) v18+
- Cuenta en [Cloudflare](https://dash.cloudflare.com/sign-up)
- Cuenta en [GitHub](https://github.com/) o [GitLab](https://gitlab.com/)
- (Opcional) Cuenta de desarrollador en [MercadoPago](https://www.mercadopago.com/developers)

### Instalación

```bash
# 1. Instalar Wrangler y autenticarse
npm install -g wrangler
wrangler login

# 2. Crear la base de datos D1
npx wrangler d1 create indra-net-db
```

Copiar el `database_id` que devuelve el comando y pegarlo en `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "indra-net-db"
database_id = "acá-va-tu-id"
```

```bash
# 3. Configurar secrets locales
cp .dev.vars.example .dev.vars
# Editar .dev.vars con tus credenciales

# 4. Inicializar la base de datos local
npm run db:reset:local

# 5. Levantar el servidor de desarrollo
npx wrangler pages dev public
```

Abrir [http://localhost:8788](http://localhost:8788) → la tienda completa funcionando con datos de D1.

---

## ☁ Deployment

### Opción A — Git integration (recomendado)

Cada push a `main` hace deploy automático.

```bash
# Subir el repo a GitHub
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/indra-net.git
git branch -M main && git push -u origin main
```

Después, en el [Dashboard de Cloudflare](https://dash.cloudflare.com/?to=/:account/workers-and-pages):

1. **Workers & Pages** → **Crear** → **Pages** → **Conectar a Git**
2. Seleccionar el repo `indra-net`
3. Configuración de build:
   - Build command: _(dejar vacío)_
   - Build output directory: `public`
4. **Guardar y Deploy**

### Opción B — Deploy manual

```bash
npx wrangler pages deploy public
```

### Después del primer deploy

#### Vincular la base de datos D1

**Workers & Pages** → `indra-net` → **Settings** → **Bindings** → **Add** → **D1 database**
- Variable name: `DB`
- Seleccionar `indra-net-db`

> Si `wrangler.toml` tiene el `database_id` correcto, el binding se aplica automáticamente en el siguiente deploy.

#### Inicializar la base de datos remota

```bash
npx wrangler d1 execute indra-net-db --file=schema.sql --remote
npx wrangler d1 execute indra-net-db --file=seed.sql --remote
```

#### Variables de entorno

**Workers & Pages** → `indra-net` → **Settings** → **Environment variables**:

| Variable | Descripción | Tipo |
|:---------|:------------|:-----|
| `ADMIN_USERNAME` | Usuario del panel admin | Encrypt |
| `ADMIN_PASSWORD` | Contraseña del panel admin | Encrypt |
| `ADMIN_SECRET` | String aleatorio de 32+ caracteres para firmar cookies | Encrypt |
| `MP_ACCESS_TOKEN` | Access Token de MercadoPago | Encrypt |
| `MP_PUBLIC_KEY` | Public Key de MercadoPago | Plain |
| `SITE_URL` | URL del sitio desplegado (ej. `https://indra-net.pages.dev`) | Plain |
| `CURRENCY` | Moneda para MercadoPago (ej. `ARS`, `UYU`, `MXN`) | Plain |

Guardar → el proyecto se re-deploya automáticamente.

### Dominio personalizado

En el proyecto de Pages: **Custom domains** → **Set up a custom domain** → ingresar tu dominio. Si el dominio está en Cloudflare, el DNS se configura solo.

---

## ⚡ API

### Endpoints públicos

```
GET    /api/products                 Listar productos (?category=, ?search=)
GET    /api/products/:id             Producto por ID
GET    /api/products/by-slug/:slug   Producto por slug
GET    /api/categories               Categorías únicas
POST   /api/checkout                 Crear pedido + preferencia MercadoPago
POST   /api/webhook/mp               Webhook IPN de MercadoPago
```

### Endpoints admin (autenticación por cookie)

```
POST   /admin/login                  Autenticar (setea cookie HttpOnly)
GET    /admin/logout                 Cerrar sesión
GET    /admin/check                  Verificar si hay sesión activa
POST   /api/products                 Crear producto
PUT    /api/products/:id             Actualizar producto
DELETE /api/products/:id             Eliminar producto
GET    /api/orders                   Listar todos los pedidos
PUT    /api/orders/:id/status        Actualizar estado de pedido
```

### Páginas

```
/                       Tienda
/product.html?slug=xxx  Detalle de producto
/checkout.html          Checkout
/admin.html             Login admin
/dashboard.html         Panel de administración
/success.html           Pago exitoso
/failure.html           Pago fallido
/pending.html           Pago pendiente
```

---

## 💳 MercadoPago

### Configuración

1. Ir a [mercadopago.com/developers](https://www.mercadopago.com/developers)
2. Crear una aplicación
3. En **Credenciales**, copiar el **Access Token** y la **Public Key**
4. Para testing, usar las credenciales de **Test / Sandbox**
5. Agregar como variables de entorno en Cloudflare (ver tabla arriba)
6. Asegurarse de que `SITE_URL` apunte a la URL desplegada

### Flujo de pago

```
Usuario llena carrito
  → Checkout: ingresa nombre + email
    → POST /api/checkout → crea Order en D1 + llama a API de MercadoPago
      → Redirect a MercadoPago (init_point)
        → Usuario paga
          → MercadoPago redirige a /success, /failure, o /pending
          → MercadoPago envía IPN a /api/webhook/mp → actualiza estado en D1
```

### Webhook

Configurar la URL de notificaciones IPN en la aplicación de MercadoPago:

```
https://tu-sitio.pages.dev/api/webhook/mp
```

---

## 🎨 Sistema de Diseño

### Capas de fondo (de abajo hacia arriba)

1. **Gradiente radial base** — negro profundo (`#020203`) con resplandor índigo sutil desde el centro superior
2. **Textura de ruido SVG** — ruido fractal al 1.8% de opacidad, efecto de grano fílmico
3. **Blobs de gradiente animados** — tres esferas (índigo, violeta, azul) con blur de 120px flotando en ciclos de 20–30 segundos
4. **Motivo Red de Indra** — grilla geométrica de nodos y líneas al 2.5% de opacidad

### Tokens de color

```
Fondos       #020203 (profundo)    #050506 (base)
Texto        #EDEDEF (primario)    #8A8F98 (atenuado)    #555962 (tenue)
Acento       #5E6AD2 → #6872D9 (hover)
Estados      #30A46C (éxito)       #F5A623 (advertencia) #E5484D (peligro)
```

### Tarjetas de producto

Cada tarjetas tiene sombras multicapa (borde highlight + sombra ajustada + sombra difusa + oscuridad ambiental), un borde superior con gradiente de 1px, y un efecto de **spotlight** que sigue el cursor — un gradiente radial de 400px del color acento al 10% de opacidad.

### Placeholders generativos

Los productos sin imagen reciben un SVG único tipo constelación, generado deterministicamente a partir del ID del producto: nodos de diferentes tamaños conectados por líneas finas en el rango azul-violeta.

---

## 🛠 Desarrollo

```bash
# Servidor local con hot reload
npx wrangler pages dev public

# Resetear base de datos local
npm run db:reset:local

# Deploy a producción (si está conectado a Git)
git push

# Deploy manual
npx wrangler pages deploy public
```

### Scripts disponibles

| Comando | Acción |
|:--------|:-------|
| `npm run dev` | Servidor de desarrollo local |
| `npm run deploy` | Deploy manual a Cloudflare |
| `npm run db:create` | Crear base de datos D1 |
| `npm run db:schema` | Ejecutar schema en D1 remota |
| `npm run db:seed` | Insertar datos iniciales en D1 remota |
| `npm run db:reset` | Schema + seed en remoto |
| `npm run db:reset:local` | Schema + seed en local |

---

<p align="center">
  <sub>Construido con nada más que HTML, CSS, JS y la edge network de Cloudflare.</sub><br>
  <sub>◉ Todos los nodos conectados.</sub>
</p>
