#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor HTTP com API REST para o site "Árvore dos Palpites"
Usa SQLite para armazenar os palpites
"""

import http.server
import socketserver
import os
import sys
import json
import urllib.parse
from pathlib import Path
from database import init_db, add_palpite, get_all_palpites, get_stats, clear_all_palpites

# Porta padrão
PORT = 8000

# Diretório atual (onde está o servidor)
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class APIHandler(http.server.SimpleHTTPRequestHandler):
    """Handler customizado com API REST"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        """Adiciona headers CORS"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urllib.parse.urlparse(self.path)
        
        # API endpoints
        if parsed_path.path == '/api/palpites':
            self.handle_get_palpites()
        elif parsed_path.path == '/api/stats':
            self.handle_get_stats()
        else:
            # Serve arquivos estáticos
            super().do_GET()
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urllib.parse.urlparse(self.path)
        
        if parsed_path.path == '/api/palpites':
            self.handle_post_palpite()
        else:
            self.send_error(404, "Not Found")
    
    def do_DELETE(self):
        """Handle DELETE requests"""
        parsed_path = urllib.parse.urlparse(self.path)
        
        if parsed_path.path == '/api/palpites':
            self.handle_delete_palpites()
        else:
            self.send_error(404, "Not Found")
    
    def handle_get_palpites(self):
        """Retorna todos os palpites"""
        try:
            palpites = get_all_palpites()
            self.send_json_response(200, {'palpites': palpites})
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})
    
    def handle_get_stats(self):
        """Retorna estatísticas dos palpites"""
        try:
            stats = get_stats()
            self.send_json_response(200, stats)
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})
    
    def handle_post_palpite(self):
        """Adiciona um novo palpite"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Validação dos dados
            required_fields = ['nome', 'sexo', 'mensagem', 'dataPalpite']
            for field in required_fields:
                if field not in data:
                    self.send_json_response(400, {'error': f'Campo obrigatório ausente: {field}'})
                    return
            
            if data['sexo'] not in ['menina', 'menino']:
                self.send_json_response(400, {'error': 'Sexo deve ser "menina" ou "menino"'})
                return
            
            # Adiciona o palpite
            palpite_id = add_palpite(
                nome=data['nome'],
                sexo=data['sexo'],
                mensagem=data['mensagem'],
                data_palpite=data['dataPalpite'],
                sugestao_nome=data.get('sugestaoNome')
            )
            
            self.send_json_response(201, {'id': palpite_id, 'message': 'Palpite adicionado com sucesso'})
        except json.JSONDecodeError:
            self.send_json_response(400, {'error': 'JSON inválido'})
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})
    
    def handle_delete_palpites(self):
        """Remove todos os palpites"""
        try:
            clear_all_palpites()
            self.send_json_response(200, {'message': 'Todos os palpites foram removidos'})
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})
    
    def send_json_response(self, status_code, data):
        """Envia uma resposta JSON"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_cors_headers()
        self.end_headers()
        
        response = json.dumps(data, ensure_ascii=False, indent=2)
        self.wfile.write(response.encode('utf-8'))
    
    def end_headers(self):
        """Adiciona headers CORS em todas as respostas"""
        self.send_cors_headers()
        super().end_headers()
    
    def log_message(self, format, *args):
        """Customiza as mensagens de log"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    """Função principal"""
    # Inicializa o banco de dados
    print("🔧 Inicializando banco de dados...")
    init_db()
    
    # Verifica se a porta está disponível
    try:
        with socketserver.TCPServer(("", PORT), APIHandler) as httpd:
            print("=" * 60)
            print("🌳 Servidor da Árvore dos Palpites")
            print("=" * 60)
            print(f"\n✅ Servidor rodando em:")
            print(f"   http://localhost:{PORT}")
            print(f"   http://127.0.0.1:{PORT}")
            print(f"\n📁 Diretório: {DIRECTORY}")
            print(f"\n🗄️  Banco de dados: {os.path.join(DIRECTORY, 'palpites.db')}")
            print(f"\n📡 Endpoints da API:")
            print(f"   GET  /api/palpites  - Lista todos os palpites")
            print(f"   POST /api/palpites  - Adiciona um novo palpite")
            print(f"   GET  /api/stats     - Estatísticas dos palpites")
            print(f"\n💡 Dicas:")
            print(f"   - Acesse http://localhost:{PORT} no navegador")
            print(f"   - Para parar o servidor, pressione Ctrl+C")
            print(f"   - Para usar outra porta, execute: python server.py [PORTA]")
            print("\n" + "=" * 60)
            print("Aguardando requisições...\n")
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n\n🛑 Servidor encerrado pelo usuário.")
                sys.exit(0)
                
    except OSError as e:
        if e.errno == 48 or e.errno == 98:  # Porta já em uso
            print(f"\n❌ Erro: A porta {PORT} já está em uso!")
            print(f"💡 Tente usar outra porta: python server.py {PORT + 1}")
            sys.exit(1)
        else:
            print(f"\n❌ Erro ao iniciar servidor: {e}")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Permite especificar a porta como argumento
    if len(sys.argv) > 1:
        try:
            PORT = int(sys.argv[1])
            if PORT < 1 or PORT > 65535:
                print("❌ Erro: A porta deve estar entre 1 e 65535")
                sys.exit(1)
        except ValueError:
            print("❌ Erro: A porta deve ser um número")
            print("💡 Uso: python server.py [PORTA]")
            sys.exit(1)
    
    main()
