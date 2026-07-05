# Verificación de instalación limpia

Fecha: 5 de julio de 2026.

## macOS

Entorno verificado: macOS arm64, Node.js 22.22.2 y npm 10.9.7.

Se ejecutó desde un clon nuevo:

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Resultado:

- instalación completada sin vulnerabilidades declaradas por npm;
- cliente Prisma generado;
- base SQLite creada en `apps/backend/prisma/dev.db`;
- seed completado con 50 EcoGestos;
- frontend disponible en `http://localhost:5173`;
- `GET http://localhost:3000/api/health` respondió `200` y `ok: true`.

## Linux mediante Docker

Entorno verificado: contenedores Linux arm64 basados en Node.js 22 Alpine,
Docker 29.4.0 y Docker Compose 5.1.2.

Se ejecutó:

```bash
cp .env.example .env
docker compose build --no-cache
docker compose up
```

Resultado:

- imágenes `ecogesto-api` y `ecogesto-web` construidas;
- migración y seed completados dentro del contenedor;
- API y frontend accesibles a través de nginx;
- volumen SQLite conservado tras reiniciar el contenedor de la API;
- la API volvió a responder `200` con 50 EcoGestos cargados.

En la máquina de verificación, el puerto 8080 estaba ocupado por un contenedor
ajeno (`exam-phpmyadmin`). La integración nginx se comprobó temporalmente en el
puerto 18080 sin detener ni modificar ese proyecto.

## Controles de calidad

```text
npm run lint       correcto
npm test           2 archivos, 3 pruebas superadas
npm run build:all  correcto
```
