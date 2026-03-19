#!/bin/bash

# Script para recriar o setup do Android (caso necessário)
echo "Configurando o projeto para Android..."

# Construir o frontend primeiro
npx vite build

# Adicionar plataforma Android (se ainda não existir)
if [ ! -d "android" ]; then
  npx cap add android
else
  echo "Pasta android/ já existe, pulando npx cap add..."
fi

# Sincronizar os arquivos com a plataforma Android
npx cap sync android

echo ""
echo "Configuração concluída!"
echo "Para abrir o projeto no Android Studio, execute: npx cap open android"
