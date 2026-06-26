#!/bin/bash
set -e

NODE_VERSION="v22.12.0"
NODE_DIR="/home/cadu/Documentos/agente de analise/.node-env"

echo "=== Removendo ambiente Node.js antigo ==="
rm -rf "$NODE_DIR"

echo "=== Baixando o Node.js $NODE_VERSION portátil ==="
curl -s -o node-dist.tar.xz "https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-linux-x64.tar.xz"

echo "=== Criando diretório de destino ==="
mkdir -p "$NODE_DIR"

echo "=== Extraindo arquivos ==="
tar -xJf node-dist.tar.xz -C "$NODE_DIR" --strip-components=1

echo "=== Limpando arquivos temporários ==="
rm node-dist.tar.xz

echo "=== Node.js $NODE_VERSION configurado com sucesso em: $NODE_DIR ==="

"$NODE_DIR/bin/node" -v
"$NODE_DIR/bin/npm" -v
