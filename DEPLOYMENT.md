# Guía de Deployment en Vercel - zynapse

## Paso 1: Preparación del Proyecto ✅ COMPLETADO

- ✅ Creado archivo `.env` con credenciales de Firebase
- ✅ Creado archivo `.env.example` como template
- ✅ Actualizado `firebaseConfig.js` para usar variables de entorno
- ✅ Añadido `.env` al `.gitignore`

## Paso 2: Verificar que la App Funciona Localmente

Reinicia el servidor de desarrollo para que cargue las variables de entorno:

```bash
# Detén el servidor actual (Ctrl+C)
# Luego ejecuta:
npm run dev
```

Verifica que la aplicación sigue funcionando correctamente.

## Paso 3: Inicializar Git (si no está inicializado)

```bash
git init
git add .
git commit -m "Preparar proyecto para deployment en Vercel"
```

## Paso 4: Subir a GitHub

### Opción A: Crear nuevo repositorio desde GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `mi-web-app` (o el que prefieras)
3. Descripción: "zynapse - Plataforma de comunidad con Firebase"
4. Público o Privado (tu elección)
5. NO inicialices con README, .gitignore o licencia
6. Click en "Create repository"

### Luego en tu terminal:

```bash
git remote add origin https://github.com/TU_USUARIO/mi-web-app.git
git branch -M main
git push -u origin main
```

### Opción B: Si ya tienes un repositorio

```bash
git add .
git commit -m "Preparar para deployment"
git push
```

## Paso 5: Crear Cuenta en Vercel

1. Ve a https://vercel.com
2. Click en "Sign Up"
3. Selecciona "Continue with GitHub"
4. Autoriza Vercel para acceder a tus repositorios

## Paso 6: Importar Proyecto en Vercel

1. En el dashboard de Vercel, click en "Add New..."
2. Selecciona "Project"
3. Busca tu repositorio `mi-web-app`
4. Click en "Import"

## Paso 7: Configurar el Proyecto

### Framework Preset
- Vercel debería detectar automáticamente "Vite"
- Si no, selecciónalo manualmente

### Build Settings
- **Build Command**: `npm run build` (ya configurado)
- **Output Directory**: `dist` (ya configurado)
- **Install Command**: `npm install` (ya configurado)

### Root Directory
- Dejar en `.` (raíz del proyecto)

## Paso 8: Configurar Variables de Entorno

**MUY IMPORTANTE**: Antes de hacer deploy, añade las variables de entorno:

1. En la sección "Environment Variables", añade cada una:

```
VITE_FIREBASE_API_KEY = AIzaSyDaVuCXBz4WKVT38NZJgWvL7CfbFRh2hXU
VITE_FIREBASE_AUTH_DOMAIN = mi-web-app-7eb91.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = mi-web-app-7eb91
VITE_FIREBASE_STORAGE_BUCKET = mi-web-app-7eb91.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 742328175956
VITE_FIREBASE_APP_ID = 1:742328175956:web:052a1841ba2e2c801d8cc1
```

2. Para cada variable:
   - Name: (nombre de la variable, ej: `VITE_FIREBASE_API_KEY`)
   - Value: (valor correspondiente)
   - Environment: Selecciona "Production", "Preview", y "Development"
   - Click "Add"

## Paso 9: Deploy

1. Click en "Deploy"
2. Vercel comenzará a construir tu aplicación
3. Espera 2-3 minutos mientras se completa el build
4. ¡Listo! Tu app estará disponible en una URL como: `https://mi-web-app-xxx.vercel.app`

## Paso 10: Configurar Dominio en Firebase (IMPORTANTE)

Para que la autenticación funcione, debes añadir el dominio de Vercel a Firebase:

1. Ve a Firebase Console: https://console.firebase.google.com
2. Selecciona tu proyecto "mi-web-app-7eb91"
3. Ve a "Authentication" → "Settings" → "Authorized domains"
4. Click en "Add domain"
5. Añade tu dominio de Vercel: `mi-web-app-xxx.vercel.app`
6. Click "Add"

## Paso 11: Verificar Deployment

Visita tu URL de Vercel y verifica:
- ✅ La página carga correctamente
- ✅ Login con Google funciona
- ✅ Todas las secciones se muestran
- ✅ El foro funciona
- ✅ Admin dashboard es accesible

## Paso 12: Configurar Dominio Personalizado (Opcional)

Si tienes un dominio propio:

1. En Vercel Dashboard → Settings → Domains
2. Click "Add"
3. Ingresa tu dominio (ej: `zynapse.com`)
4. Sigue las instrucciones para configurar DNS
5. Añade también este dominio a Firebase Authorized domains

## Deployments Automáticos

Ahora cada vez que hagas `git push` a tu repositorio:
- Vercel automáticamente desplegará los cambios
- Recibirás una URL de preview para cada commit
- Los cambios en `main` se desplegarán a producción automáticamente

## Comandos Útiles

```bash
# Ver logs de build
vercel logs

# Desplegar manualmente (si instalas Vercel CLI)
npm i -g vercel
vercel

# Ver deployments
vercel ls
```

## Troubleshooting

### Error: "Firebase not initialized"
- Verifica que todas las variables de entorno estén configuradas en Vercel
- Asegúrate de que los nombres empiecen con `VITE_`

### Error: "Auth domain not authorized"
- Añade el dominio de Vercel a Firebase Authorized domains

### Build falla
- Revisa los logs en Vercel Dashboard
- Verifica que `npm run build` funcione localmente

## Próximos Pasos

Después del deployment:
1. ✅ Configurar reglas de seguridad de Firestore
2. ✅ Configurar reglas de Storage
3. ✅ Realizar verificación final de todos los flujos
