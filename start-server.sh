#!/bin/bash

echo "========================================"
echo "  Servidor da Árvore dos Palpites"
echo "========================================"
echo ""

# Verifica se Python está instalado
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "[ERRO] Python não encontrado!"
        echo "Por favor, instale o Python: https://www.python.org/downloads/"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "Iniciando servidor..."
echo ""
$PYTHON_CMD server.py



