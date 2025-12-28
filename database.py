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
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS palpites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            sexo TEXT NOT NULL CHECK(sexo IN ('menina', 'menino')),
            sugestao_nome TEXT,
            mensagem TEXT NOT NULL,
            data_palpite DATE NOT NULL,
            data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"✅ Banco de dados inicializado: {DB_PATH}")

def add_palpite(nome, sexo, mensagem, data_palpite, sugestao_nome=None):
    """Adiciona um novo palpite ao banco de dados"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO palpites (nome, sexo, sugestao_nome, mensagem, data_palpite)
            VALUES (?, ?, ?, ?, ?)
        ''', (nome, sexo, sugestao_nome, mensagem, data_palpite))
        
        conn.commit()
        palpite_id = cursor.lastrowid
        conn.close()
        return palpite_id
    except sqlite3.Error as e:
        conn.close()
        raise Exception(f"Erro ao salvar palpite: {e}")

def get_all_palpites():
    """Retorna todos os palpites do banco de dados"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Permite acessar colunas por nome
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, nome, sexo, sugestao_nome, mensagem, 
               data_palpite, data_registro
        FROM palpites
        ORDER BY data_registro DESC
    ''')
    
    rows = cursor.fetchall()
    conn.close()
    
    # Converte para lista de dicionários
    palpites = []
    for row in rows:
        palpites.append({
            'id': row['id'],
            'nome': row['nome'],
            'sexo': row['sexo'],
            'sugestaoNome': row['sugestao_nome'],
            'mensagem': row['mensagem'],
            'dataPalpite': row['data_palpite'],
            'dataRegistro': row['data_registro']
        })
    
    return palpites

def get_stats():
    """Retorna estatísticas dos palpites"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM palpites')
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM palpites WHERE sexo = 'menina'")
    meninas = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM palpites WHERE sexo = 'menino'")
    meninos = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        'total': total,
        'meninas': meninas,
        'meninos': meninos
    }

def clear_all_palpites():
    """Remove todos os palpites do banco de dados"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM palpites')
    conn.commit()
    conn.close()

# Inicializa o banco quando o módulo é importado
if __name__ != '__main__':
    init_db()

