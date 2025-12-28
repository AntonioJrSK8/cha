#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para popular o banco de dados com dados fictícios
"""

import sys
import io

# Configura encoding UTF-8 para stdout no Windows ANTES de importar outros módulos
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from database import init_db, add_palpite, get_all_palpites, clear_all_palpites
import random
from datetime import datetime, timedelta

# Dados fictícios para popular o banco
dados_ficticios = [
    {
        'nome': 'Ana Silva',
        'sexo': 'menina',
        'sugestaoNome': 'Isabella',
        'mensagem': 'Que venha com saúde e muita alegria! Desejo tudo de melhor para essa família especial.',
        'dataPalpite': (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d')
    },
    {
        'nome': 'Carlos Oliveira',
        'sexo': 'menino',
        'sugestaoNome': 'Gabriel',
        'mensagem': 'Parabéns pelo bebê! Que ele traga muitas felicidades e momentos inesquecíveis.',
        'dataPalpite': (datetime.now() - timedelta(days=9)).strftime('%Y-%m-%d')
    },
    {
        'nome': 'Maria Santos',
        'sexo': 'menina',
        'sugestaoNome': 'Sofia',
        'mensagem': 'Que esse momento seja repleto de amor e carinho. Desejo toda felicidade do mundo!',
        'dataPalpite': (datetime.now() - timedelta(days=8)).strftime('%Y-%m-%d')
    },
    {
        'nome': 'João Pereira',
        'sexo': 'menino',
        'sugestaoNome': 'Miguel',
        'mensagem': 'Parabéns! Que o bebê seja abençoado e traga muita luz para a família.',
        'dataPalpite': (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    },
    {
        'nome': 'Fernanda Costa',
        'sexo': 'menina',
        'sugestaoNome': 'Alice',
        'mensagem': 'Desejo que essa nova vida seja cheia de sorrisos e momentos especiais!',
        'dataPalpite': (datetime.now() - timedelta(days=6)).strftime('%Y-%m-%d')
    },
    {
        'nome': 'Roberto Alves',
        'sexo': 'menino',
        'sugestaoNome': 'Rafael',
        'mensagem': 'Parabéns pelo chá de revelação! Que o bebê seja saudável e feliz.',
        'dataPalpite': (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
    },
    {
        'nome': 'Juliana Ferreira',
        'sexo': 'menina',
        'sugestaoNome': 'Laura',
        'mensagem': 'Que momento especial! Desejo toda felicidade e saúde para o bebê e a família.',
        'dataPalpite': (datetime.now() - timedelta(days=4)).strftime('%Y-%m-%d')
    },
    {
        'nome': 'Paulo Mendes',
        'sexo': 'menino',
        'sugestaoNome': 'Lucas',
        'mensagem': 'Parabéns! Que essa nova jornada seja repleta de amor e alegria.',
        'dataPalpite': (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
    },
    {
        'nome': 'Patricia Lima',
        'sexo': 'menina',
        'sugestaoNome': 'Julia',
        'mensagem': 'Desejo que o bebê traga muita felicidade e realizações para todos vocês!',
        'dataPalpite': (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')
    },
    {
        'nome': 'Marcia Brandão',
        'sexo': 'menina',
        'sugestaoNome': 'Beatriz',
        'mensagem': 'Que lindo esse momento! Parabéns e que venha com muito amor e carinho!',
        'dataPalpite': (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    },
    {
        'nome': 'Ricardo Souza',
        'sexo': 'menino',
        'sugestaoNome': 'Enzo',
        'mensagem': 'Parabéns pela nova vida que está chegando! Desejo toda felicidade do mundo!',
        'dataPalpite': datetime.now().strftime('%Y-%m-%d')
    }
]

def popular_banco():
    """Popula o banco de dados com dados fictícios"""
    print("Inicializando banco de dados...")
    init_db()
    
    print("\nLimpando banco de dados existente...")
    clear_all_palpites()
    
    print(f"\nAdicionando {len(dados_ficticios)} registros ficticios...")
    
    for i, dados in enumerate(dados_ficticios, 1):
        # O 10º registro é o ganhador
        eh_ganhador = (i == 10)
        
        palpite_id = add_palpite(
            nome=dados['nome'],
            sexo=dados['sexo'],
            mensagem=dados['mensagem'],
            data_palpite=dados['dataPalpite'],
            sugestao_nome=dados['sugestaoNome'],
            eh_ganhador=eh_ganhador
        )
        
        status = " [GANHADOR DO PREMIO!]" if eh_ganhador else ""
        print(f"  {i}. {dados['nome']} - {dados['sexo']} - ID: {palpite_id}{status}")
    
    print("\nBanco de dados populado com sucesso!")
    
    # Mostra estatísticas
    palpites = get_all_palpites()
    ganhadores = [p for p in palpites if p.get('ehGanhador')]
    
    print(f"\nEstatisticas:")
    print(f"   Total de palpites: {len(palpites)}")
    print(f"   Ganhadores: {len(ganhadores)}")
    if ganhadores:
        ganhador = ganhadores[0]
        print(f"   Ganhador do premio: {ganhador['nome']} (ID: {ganhador['id']})")
    
    print("\nBanco de dados pronto para uso!")

if __name__ == "__main__":
    try:
        popular_banco()
    except Exception as e:
        print(f"\n❌ Erro ao popular banco de dados: {e}")
        import traceback
        traceback.print_exc()

