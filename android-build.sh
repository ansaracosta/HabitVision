#!/bin/bash

# Script para construir a aplicação para Android
echo "Construindo a aplicação para Android..."

# Construir o frontend com Vite (gera dist/public)
npx vite build

# Sincronizar com o projeto Android
npx cap sync android

echo ""
echo "Build concluído!"
echo "Para abrir no Android Studio, execute: npx cap open android"
