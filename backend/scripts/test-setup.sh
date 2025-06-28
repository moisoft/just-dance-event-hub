#!/bin/bash

# Script para configurar ambiente de testes

echo "🔧 Configurando ambiente de testes..."

# Verificar se PostgreSQL está rodando
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL não está rodando. Inicie o PostgreSQL primeiro."
    exit 1
fi

# Criar banco de dados de teste se não existir
echo "📊 Criando banco de dados de teste..."
psql -h localhost -U postgres -c "CREATE DATABASE just_dance_hub_test;" 2>/dev/null || echo "Banco de teste já existe"

# Instalar dependências se necessário
echo "📦 Verificando dependências..."
npm install

# Executar testes
echo "🧪 Executando testes..."
npm test

echo "✅ Testes concluídos!" 