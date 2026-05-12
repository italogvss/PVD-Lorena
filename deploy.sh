#!/bin/bash
set -e

echo "==============================="
echo "  PDV-Lorena — Deploy Produção"
echo "==============================="

# Verifica se o .env.prod existe
if [ ! -f ".env.prod" ]; then
  echo ""
  echo "ERRO: arquivo .env.prod não encontrado."
  echo "Execute: cp .env.prod.example .env.prod"
  echo "Depois preencha os valores e rode o script novamente."
  exit 1
fi

echo ""
echo "[1/4] Atualizando código (git pull)..."
git pull origin main

echo ""
echo "[2/4] Construindo imagens Docker..."
docker compose --env-file .env.prod -f docker-compose.prod.yml build --no-cache

echo ""
echo "[3/4] Iniciando serviços..."
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d

echo ""
echo "[4/4] Aguardando banco de dados e API ficarem prontos..."
sleep 20

echo ""
echo "Verificando containers..."
docker compose --env-file .env.prod -f docker-compose.prod.yml ps

VPS_IP=$(hostname -I | awk '{print $1}')
echo ""
echo "==============================="
echo "  Deploy concluído!"
echo "==============================="
echo "  Frontend: http://$VPS_IP"
echo "  API:      http://$VPS_IP/api"
echo ""
echo "Comandos úteis:"
echo "  Logs em tempo real : docker compose -f docker-compose.prod.yml logs -f"
echo "  Reiniciar serviço  : docker compose -f docker-compose.prod.yml restart api"
echo "  Parar tudo         : docker compose -f docker-compose.prod.yml down"
echo "==============================="
