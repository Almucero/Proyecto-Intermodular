# Deployment

npm run dev # Modo desarrollo con hot-reload
npm run build # Compilar TypeScript
npm start # Ejecutar producción

## Testing

npm test # Ejecutar tests
npm run test:watch # Tests en modo watch
npm run test:coverage # Tests con cobertura

## Prisma

npx prisma studio # UI para ver/editar datos
npx prisma migrate dev # Nueva migración
npx prisma generate # Regenerar cliente
npx prisma db push # Push sin migración (dev)
npx prisma db seed # Ejecutar seeds

## Probar health

curl <http://localhost:3000/health>

## Docs

<http://localhost:3000/api-docs>
