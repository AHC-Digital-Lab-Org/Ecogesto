# Despliegue en producción (Apache + MariaDB)

## Arquitectura real

Este monorepo compila a **un único proceso Node** (`apps/backend`, framework Hono)
que sirve dos cosas a la vez:

- La API bajo `/api/*`.
- Los ficheros estáticos del frontend (React/Vite) ya compilados, vía
  `FRONTEND_DIST_DIR` (por defecto `../frontend/dist` relativo al proceso backend).

Por eso **Apache no sirve el frontend directamente**: su único trabajo es hacer de
proxy inverso hacia ese proceso Node (y terminar TLS). No hay build separado de
"frontend estático en Apache" + "API en otro sitio": todo pasa por el mismo puerto
Node, así que no hay problemas de CORS ni hace falta configurar `VITE_API_URL`
(el frontend usa `/api` por defecto, que cae en el mismo origen).

La respuesta corta a "¿es tan fácil como clone + npm install + generate?": **casi**,
pero faltan tres pasos que no son opcionales: aplicar las migraciones de Prisma,
compilar (`build:all`, no solo `build`) y dejar el proceso Node corriendo con un
gestor de procesos (systemd) detrás de Apache. Todo el detalle abajo.

## Requisitos en el servidor

- Node.js **>= 22** y npm (ver `engines` en [package.json](package.json)).
- Apache con los módulos: `proxy`, `proxy_http`, `ssl`, `headers`.
- Acceso de red desde el servidor a tu MariaDB (host, puerto, usuario, contraseña,
  y el certificado CA si la conexión exige TLS, como en SkySQL).
- Git.
- (Opcional) `certbot` si vas a emitir el certificado TLS con Let's Encrypt.

Habilitar módulos de Apache (Debian/Ubuntu):

```bash
sudo a2enmod proxy proxy_http ssl headers
sudo systemctl restart apache2
```

## 1. Clonar e instalar dependencias

```bash
cd /var/www
git clone <url-del-repo> ecogestos
cd ecogestos
npm ci
```

`npm ci` instala todos los workspaces (`apps/backend`, `apps/frontend`,
`packages/shared`) de una vez.

## 2. Variables de entorno de producción

Crea/edita `apps/backend/.env` (es el único `.env` que debe existir — **no** crees
también uno en `apps/backend/prisma/.env`, Prisma da error si detecta el mismo
`DATABASE_URL` definido en dos sitios a la vez):

```bash
NODE_ENV=production
API_PORT=3000
APP_ORIGIN=https://tu-dominio.com
SESSION_SECRET=<valor-aleatorio-largo-distinto-del-de-desarrollo>

# MariaDB de producción
DATABASE_URL="mysql://USUARIO:PASSWORD@HOST:PUERTO/NOMBRE_BD?sslaccept=strict&sslcert=/ruta/absoluta/al/certificado-ca.pem"

# Ruta absoluta al build del frontend (evita ambigüedades de cwd)
FRONTEND_DIST_DIR=/var/www/ecogestos/apps/frontend/dist

STORAGE_DRIVER=local
UPLOADS_DIR=/var/www/ecogestos/uploads
```

Notas importantes:

- **`NODE_ENV=production` es obligatorio para que funcione el login.** La cookie
  de sesión se marca `secure` solo en producción
  ([session.ts](apps/backend/src/middlewares/session.ts:23)), lo que significa que
  el sitio **debe servirse por HTTPS** o los navegadores descartarán la cookie.
- Si tu MariaDB requiere TLS con verificación de certificado (como SkySQL), copia
  el `.pem` de la CA al servidor de producción y usa esa ruta en `sslcert=`. La
  ruta que uses en tu máquina de desarrollo (`/home/tu-usuario/Descargas/...`) no
  existirá en el servidor.
- `SESSION_SECRET` debe ser un valor propio de producción, no reutilices el de
  desarrollo.

## 3. Base de datos

Desde `apps/backend`:

```bash
cd apps/backend

# Genera el cliente de Prisma según schema.prisma
npm run db:generate

# Aplica las migraciones ya existentes contra la BD de producción
npx prisma migrate deploy
```

`prisma migrate deploy` aplica las migraciones versionadas en
[apps/backend/prisma/migrations](apps/backend/prisma/migrations) sin pedir
confirmación ni generar migraciones nuevas — es el comando pensado para producción
(a diferencia de `prisma migrate dev`, que es solo para desarrollo).

Seed de datos (catálogo de ecogestos, categorías, etc.) — **solo la primera vez**,
o cuando sepas que es seguro re-ejecutarlo sobre datos reales:

```bash
npm run db:seed
```

## 4. Build de producción

Desde la raíz del repo:

```bash
npm run build:all
```

Usa `build:all` (no `build` a secas): `build` solo compila frontend+shared para
Netlify y no genera `apps/backend/dist`, que es lo que necesitas para arrancar el
servidor Node en producción. `build:all` compila `shared` + `backend` + `frontend`.

Esto deja:

- `apps/backend/dist/src/index.js` → el servidor a ejecutar.
- `apps/frontend/dist/` → los estáticos que ese servidor sirve.

## 5. Ejecutar el backend como servicio (systemd)

Crea `/etc/systemd/system/ecogestos.service`:

```ini
[Unit]
Description=EcoGestos AHC backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ecogestos/apps/backend
EnvironmentFile=/var/www/ecogestos/apps/backend/.env
ExecStart=/usr/bin/node dist/src/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ecogestos
sudo systemctl status ecogestos
```

Comprueba que arrancó bien:

```bash
curl http://127.0.0.1:3000/api/health
```

## 6. Apache como proxy inverso + HTTPS

VirtualHost (`/etc/apache2/sites-available/ecogestos.conf`):

```apache
<VirtualHost *:80>
    ServerName tu-dominio.com
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName tu-dominio.com

    SSLEngine on
    SSLCertificateFile      /etc/letsencrypt/live/tu-dominio.com/fullchain.pem
    SSLCertificateKeyFile   /etc/letsencrypt/live/tu-dominio.com/privkey.pem

    ProxyPreserveHost On
    ProxyPass        / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    RequestHeader set X-Forwarded-Proto "https"
</VirtualHost>
```

```bash
sudo a2ensite ecogestos.conf
sudo systemctl reload apache2

# Certificado TLS (si usas Let's Encrypt)
sudo certbot --apache -d tu-dominio.com
```

## 7. Actualizar un despliegue existente

```bash
cd /var/www/ecogestos
git pull
npm ci
npm run db:generate
cd apps/backend && npx prisma migrate deploy && cd ../..
npm run build:all
sudo systemctl restart ecogestos
```

## Resumen mínimo de comandos (primer despliegue)

```bash
git clone <url-del-repo> ecogestos && cd ecogestos
npm ci
# editar apps/backend/.env con DATABASE_URL, SESSION_SECRET, NODE_ENV=production, etc.
npm run db:generate
(cd apps/backend && npx prisma migrate deploy)
npm run db:seed          # opcional, solo primera vez
npm run build:all
# configurar systemd + Apache (secciones 5 y 6)
sudo systemctl enable --now ecogestos
sudo a2ensite ecogestos.conf && sudo systemctl reload apache2
```

## Troubleshooting

- **"Can't reach database server"**: normalmente no es de red — revisa que el
  fichero de `sslcert` exista en esa ruta *en el servidor de producción* y que el
  usuario del servicio (`www-data`) tenga permiso de lectura sobre él.
- **Login no persiste / la cookie de sesión desaparece**: falta `NODE_ENV=production`
  o el sitio se está sirviendo por HTTP en vez de HTTPS.
- **Error de Prisma "conflict between env var in .env and prisma/.env"**: hay un
  `DATABASE_URL` duplicado en `apps/backend/.env` y `apps/backend/prisma/.env`.
  Debe existir en uno solo de los dos (usa `apps/backend/.env`).
- **404 en rutas del frontend al recargar**: comprueba que `FRONTEND_DIST_DIR`
  apunta a una ruta absoluta válida y que `npm run build:all` generó
  `apps/frontend/dist/index.html`.
