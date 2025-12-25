# Configuración de Reglas de Seguridad de Firebase

## Firestore Rules

### Aplicar desde Firebase Console (Recomendado)

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto "mi-web-app-7eb91"
3. En el menú lateral, ve a **Firestore Database**
4. Click en la pestaña **Rules**
5. Copia el contenido del archivo `firestore.rules` de este proyecto
6. Pégalo en el editor de reglas
7. Click en **Publish**

### Aplicar desde Firebase CLI (Alternativa)

Si tienes Firebase CLI instalado:

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Login
firebase login

# Inicializar (solo primera vez)
firebase init firestore

# Desplegar reglas
firebase deploy --only firestore:rules
```

---

## Storage Rules

### Aplicar desde Firebase Console (Recomendado)

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto "mi-web-app-7eb91"
3. En el menú lateral, ve a **Storage**
4. Click en la pestaña **Rules**
5. Copia el contenido del archivo `storage.rules` de este proyecto
6. Pégalo en el editor de reglas
7. Click en **Publish**

### Aplicar desde Firebase CLI (Alternativa)

```bash
# Inicializar (solo primera vez)
firebase init storage

# Desplegar reglas
firebase deploy --only storage
```

---

## Resumen de Reglas

### Firestore

**Colecciones públicas (lectura):**
- `research_articles` - Solo admins y usuarios con permiso pueden crear
- `news_articles` - Solo admins y usuarios con permiso pueden crear
- `development_apps` - Solo admins y usuarios con permiso pueden crear
- `threads` - Cualquier usuario autenticado puede crear
- `comments` - Cualquier usuario autenticado puede crear
- `stats` - Lectura pública, escritura para autenticados
- `settings` - Lectura pública, escritura solo admins
- `presence` - Lectura pública, cada usuario puede actualizar su propio estado

**Colecciones protegidas:**
- `users` - Solo usuarios autenticados pueden leer, admins pueden modificar roles

### Storage

**Carpetas:**
- `research_articles/` - Lectura pública, escritura para autenticados, eliminación solo admins
- `news_articles/` - Lectura pública, escritura para autenticados, eliminación solo admins
- `development_apps/` - Lectura pública, escritura para autenticados, eliminación solo admins
- `forum_images/` - Lectura pública, escritura para autenticados, eliminación solo admins

---

## Verificar Reglas

Después de aplicar las reglas, verifica que funcionan correctamente:

1. **Test de lectura pública**: Abre la app sin login y verifica que puedes ver contenido
2. **Test de escritura protegida**: Intenta crear contenido sin permisos (debe fallar)
3. **Test de permisos**: Otorga permiso a un usuario y verifica que puede publicar
4. **Test de admin**: Verifica que solo admins pueden cambiar roles

---

## Troubleshooting

### Error: "Missing or insufficient permissions"
- Las reglas están funcionando correctamente
- El usuario no tiene los permisos necesarios
- Verifica los permisos en Admin Dashboard

### Error: "PERMISSION_DENIED"
- Las reglas están bloqueando la operación
- Revisa que las reglas estén publicadas correctamente
- Verifica que el usuario esté autenticado

### Las reglas no se aplican
- Espera 1-2 minutos después de publicar
- Limpia la caché del navegador
- Verifica en Firebase Console que las reglas están publicadas
