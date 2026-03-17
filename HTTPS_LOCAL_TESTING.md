# Prueba HTTPS en Local con ngrok

## Pasos rápidos:

### 1. Instala ngrok (si no lo tienes)
```bash
brew install ngrok
```

### 2. Inicia Jekyll (si no está corriendo)
```bash
jekyll serve
```

### 3. En otra terminal, ejecuta ngrok
```bash
ngrok http 4000
```

### 4. Copia la URL HTTPS
Verás algo como:
```
Forwarding                    https://abc123.ngrok.io -> http://localhost:4000
```

### 5. Abre en tu iPhone
- Copia la URL `https://abc123.ngrok.io`
- Abre Safari en tu iPhone
- Pega la URL y presiona Enter

### 6. Prueba los fixes
1. **Popover**: Toca una tarjeta - debería estar centrada en la pantalla
2. **Giroscopio**: Toca la pantalla - debería aparecer el diálogo de permisos
3. Si ves el warning en consola, significa que está detectando correctamente

## Troubleshooting

**¿No funciona ngrok?**
- Verifica que Jekyll esté corriendo en puerto 4000
- Intenta: `jekyll serve --port 4000`

**¿No aparece el diálogo de permisos?**
- Asegúrate de estar en HTTPS (la URL debe empezar con `https://`)
- Abre la consola del navegador (Safari → Develop → Console)
- Busca los logs de gyroscope

**¿El popover no está centrado?**
- Prueba en diferentes orientaciones (portrait/landscape)
- Prueba con la barra de direcciones visible y oculta

## Notas
- ngrok es temporal - cada vez que lo ejecutas genera una URL nueva
- La URL expira después de 2 horas (versión gratuita)
- Es perfecta para testing rápido en dispositivos reales
