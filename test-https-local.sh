#!/bin/bash

# Script para probar HTTPS en local con ngrok
# Uso: ./test-https-local.sh

echo "🔒 Configurando HTTPS local con ngrok..."
echo ""

# Verifica si ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok no está instalado"
    echo ""
    echo "Instálalo con:"
    echo "  brew install ngrok"
    echo ""
    exit 1
fi

# Verifica si Jekyll está corriendo
if ! curl -s http://localhost:4000 > /dev/null 2>&1; then
    echo "⚠️  No se detecta servidor en localhost:4000"
    echo ""
    echo "Inicia Jekyll primero con:"
    echo "  jekyll serve"
    echo ""
    exit 1
fi

echo "✅ Jekyll detectado en localhost:4000"
echo ""
echo "🚀 Iniciando ngrok..."
echo ""
echo "Instrucciones:"
echo "1. Verás una URL HTTPS como: https://abc123.ngrok.io"
echo "2. Copia esa URL"
echo "3. Abre en tu iPhone Safari"
echo "4. Toca la pantalla para habilitar el giroscopio"
echo "5. Abre un popover - debería estar centrado"
echo ""
echo "Presiona Ctrl+C para detener"
echo ""

ngrok http 4000
