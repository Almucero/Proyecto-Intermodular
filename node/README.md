# Deployment

Comandos básicos:

```powershell
npm run dev         # Modo desarrollo con hot-reload
npm run build       # Compilar TypeScript (tsc)
npm run build:full  # Generar Prisma client, seed de admins y compilar
npm start           # Ejecutar producción (dist)
```

Comandos de utilidad:

```powershell
npm run seed:admin  # Ejecuta el seed para crear/actualizar administradores (lee vars de entorno)
npm run clean:data  # Elimina datos (games, developers, publishers y usuarios no-admin)
npm run seed:data   # Limpia (clean:data) y siembra datos de ejemplo (10 entradas por tabla)
npm test            # Ejecutar tests (Jest)
npm run test:watch  # Tests en modo watch
npm run test:coverage # Tests con cobertura
```

## Prisma

```powershell
npx prisma studio      # UI para ver/editar datos
npx prisma migrate dev # Nueva migración
npx prisma generate    # Regenerar cliente
npx prisma db push     # Push sin migración (dev)
npx prisma db seed     # Ejecutar seeds (si los tienes configurados)
```

## Quick start (local)

**Paso 1:** Crea `.env` en base a `.env.example` con las variables necesarias: `DATABASE_URL`, `JWT_SECRET`, `BCRYPT_SALT_ROUNDS` y las variables para crear admins:

```text
ADMIN_EMAILS=admin1@example.com,admin2@example.com
ADMIN_PASSWORDS=Pass1!,Pass2!      # opcional: si no se proporcionan contraseñas se usará una contraseña por defecto para esos admins
ADMIN_NAMES=Admin1,Admin2          # opcional
```

**Paso 2:** Instala dependencias:

```powershell
npm install
```

**Paso 3:** Compila, prueba y arranca:

```powershell
npm run build:full   # ejecuta prisma generate + seedAdmin + tsc
npm run test
npm run dev          # en dev ahora se sincronizan los admins desde ADMIN_EMAILS antes de arrancar
```

**Paso 4:** Abre la documentación Swagger en <http://localhost:3000/api-docs> para comprobar que el funcionamiento sea correcto, allí verás los endpoints y las respuestas documentadas (incluidos códigos 200/201/400/401/403/404/409/500 según corresponda).

### TODO

- Borrar carpetas en cloudinary funciona cuando le da la gana
- añadir mas juegos (80/200)
- Posibles adiciones: games: tags para juegos, pegi, reseñas, especificaciones pc. user: favoritos, cesta
