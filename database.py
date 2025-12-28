#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Módulo para gerenciar o banco de dados SQLite dos palpites
"""

import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path

# Caminho do banco de dados
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'palpites.db')

def init_db():
    """Inicializa o banco de dados e cria a tabela se não existir"""
    conn = sqlite3.connect(DB_PATH, timeout=5.0)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS palpites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            sexo TEXT NOT NULL CHECK(sexo IN ('menina', 'menino')),
            sugestao_nome TEXT,
            mensagem TEXT NOT NULL,
            data_palpite DATE NOT NULL,
            data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            eh_ganhador INTEGER DEFAULT 0
        )
    ''')
    
    # Adiciona a coluna eh_ganhador se a tabela já existir (migração)
    try:
        cursor.execute('ALTER TABLE palpites ADD COLUMN eh_ganhador INTEGER DEFAULT 0')
        print("✅ Coluna 'eh_ganhador' adicionada à tabela existente")
    except sqlite3.OperationalError:
        # Coluna já existe, não precisa fazer nada
        pass
    
    conn.commit()
    conn.close()
    print(f"✅ Banco de dados inicializado: {DB_PATH}")

def add_palpite(nome, sexo, mensagem, data_palpite, sugestao_nome=None, eh_ganhador=False):
    """Adiciona um novo palpite ao banco de dados
    
    Args:
        nome: Nome da pessoa
        sexo: 'menina' ou 'menino'
        mensagem: Mensagem carinhosa
        data_palpite: Data do palpite (YYYY-MM-DD)
        sugestao_nome: Sugestão de nome (opcional)
        eh_ganhador: True se for o ganhador do voucher de R$ 100,00 (padrão: False)
    """
    # Usa timeout para evitar travamentos
    conn = sqlite3.connect(DB_PATH, timeout=5.0)
    cursor = conn.cursor()
    
    try:
        # Converte boolean para integer (SQLite não tem tipo BOOLEAN nativo)
        eh_ganhador_int = 1 if eh_ganhador else 0
        
        cursor.execute('''
            INSERT INTO palpites (nome, sexo, sugestao_nome, mensagem, data_palpite, eh_ganhador)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (nome, sexo, sugestao_nome, mensagem, data_palpite, eh_ganhador_int))
        
        conn.commit()
        palpite_id = cursor.lastrowid
        conn.close()
        return palpite_id
    except sqlite3.Error as e:
        conn.close()
        raise Exception(f"Erro ao salvar palpite: {e}")

def get_all_palpites():
    """Retorna todos os palpites do banco de dados"""
    # Usa timeout para evitar travamentos
    conn = sqlite3.connect(DB_PATH, timeout=5.0)
    conn.row_factory = sqlite3.Row  # Permite acessar colunas por nome
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT id, nome, sexo, sugestao_nome, mensagem, 
                   data_palpite, data_registro, eh_ganhador
            FROM palpites
            ORDER BY data_registro DESC
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        # Converte para lista de dicionários
        palpites = []
        for row in rows:
            # Verifica se a coluna existe (para compatibilidade com bancos antigos)
            try:
                eh_ganhador = bool(row['eh_ganhador']) if 'eh_ganhador' in row.keys() else False
            except:
                eh_ganhador = False
            
            palpites.append({
                'id': row['id'],
                'nome': row['nome'],
                'sexo': row['sexo'],
                'sugestaoNome': row['sugestao_nome'],
                'mensagem': row['mensagem'],
                'dataPalpite': row['data_palpite'],
                'dataRegistro': row['data_registro'],
                'ehGanhador': eh_ganhador
            })
        
        return palpites
    except sqlite3.Error as e:
        conn.close()
        raise Exception(f"Erro ao buscar palpites: {e}")

def get_stats():
    """Retorna estatísticas dos palpites"""
    conn = sqlite3.connect(DB_PATH, timeout=5.0)
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM palpites')
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM palpites WHERE sexo = 'menina'")
    meninas = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM palpites WHERE sexo = 'menino'")
    meninos = cursor.fetchone()[0]
    
    # Busca o ganhador do voucher
    cursor.execute("SELECT nome FROM palpites WHERE eh_ganhador = 1 LIMIT 1")
    ganhador_row = cursor.fetchone()
    ganhador = ganhador_row[0] if ganhador_row else None
    
    conn.close()
    
    return {
        'total': total,
        'meninas': meninas,
        'meninos': meninos,
        'ganhador': ganhador
    }

def get_ganhador():
    """Retorna informações do ganhador do voucher, se houver"""
    conn = sqlite3.connect(DB_PATH, timeout=5.0)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT id, nome, sexo, sugestao_nome, mensagem, 
                   data_palpite, data_registro
            FROM palpites
            WHERE eh_ganhador = 1
            LIMIT 1
        ''')
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'id': row['id'],
                'nome': row['nome'],
                'sexo': row['sexo'],
                'sugestaoNome': row['sugestao_nome'],
                'mensagem': row['mensagem'],
                'dataPalpite': row['data_palpite'],
                'dataRegistro': row['data_registro']
            }
        return None
    except sqlite3.Error as e:
        conn.close()
        raise Exception(f"Erro ao buscar ganhador: {e}")

def clear_all_palpites():
    """Remove todos os palpites do banco de dados"""
    conn = sqlite3.connect(DB_PATH, timeout=5.0)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM palpites')
    conn.commit()
    conn.close()

# Inicializa o banco quando o módulo é importado
if __name__ != '__main__':
    init_db()

