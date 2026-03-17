# Debugging iPhone Issues

## Cómo ver los logs en Safari iPhone

1. **En tu Mac**, abre Safari
2. Ve a **Safari → Preferences → Advanced**
3. Marca "Show Develop menu in menu bar"
4. Conecta tu iPhone por USB
5. En Safari iPhone, abre tu sitio
6. En Safari Mac: **Develop → [Tu iPhone] → [Tu sitio]**
7. Se abrirá la consola del inspector

## Qué buscar

### Para el Popover
Busca logs como:
```
iPhone detected - applying centering fix
```

Si ves esto, el fix se está aplicando. Si el popover sigue sin estar centrado, el problema es en el CSS.

### Para el Giroscopio
Busca estos logs en orden:
```
🔍 Initializing gyroscope attraction...
✅ DeviceOrientation supported
📱 Device check - iOS: true HTTPS: true
📲 iOS 13+ detected - will request permission on touch
👆 TAP ANYWHERE ON THE SCREEN TO ENABLE GYROSCOPE
```

Luego toca la pantalla y busca:
```
🔄 Requesting gyro permission...
✅ Permission state: granted
🎉 Gyroscope enabled!
🎯 Starting gyro tracking
```

## Posibles problemas

### Popover no centrado
- ❌ No ves "iPhone detected" → El user agent no se detecta correctamente
- ✅ Ves "iPhone detected" pero sigue sin centrar → Problema en CSS

### Giroscopio no funciona
- ❌ No ves "iOS 13+ detected" → No es iOS 13+ o no es Safari
- ❌ Ves "iOS 13+ detected" pero no pide permisos al tocar → Problema con event listener
- ❌ Ves "Permission state: denied" → Usuario rechazó permisos
- ❌ Ves error "not secure" → No estás en HTTPS

## Verificar HTTPS
En la consola, ejecuta:
```javascript
console.log(window.location.protocol)
```

Debe mostrar: `https:`

## Verificar User Agent
En la consola, ejecuta:
```javascript
console.log(navigator.userAgent)
```

Debe contener: `iPhone` y `Safari`

## Próximos pasos
1. Abre la consola en tu iPhone
2. Toca una tarjeta - verifica que el popover se centra
3. Toca la pantalla - verifica que aparece el diálogo de permisos
4. Comparte los logs que ves en la consola
