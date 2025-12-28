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
from database import init_db, add_palpite, get_all_palpites, get_stats, clear_all_palpites, get_ganhador

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
        
        # Ignora requisições de favicon.ico e chrome devtools silenciosamente
        if parsed_path.path == '/favicon.ico':
            self.send_response(204)  # No Content
            self.end_headers()
            return
        
        # Ignora requisições do Chrome DevTools
        if '.well-known' in parsed_path.path or 'devtools' in parsed_path.path:
            self.send_response(204)  # No Content
            self.end_headers()
            return
        
        # API endpoints
        if parsed_path.path == '/api/palpites':
            self.handle_get_palpites()
        elif parsed_path.path == '/api/stats':
            self.handle_get_stats()
        else:
            # Serve arquivos estáticos
            try:
                super().do_GET()
            except (ConnectionResetError, BrokenPipeError, OSError):
                # Cliente fechou a conexão - não é um erro crítico
                pass
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urllib.parse.urlparse(self.path)
        
        print(f"📥 POST recebido para: {parsed_path.path}")
        
        if parsed_path.path == '/api/palpites':
            print("✅ Roteando para handle_post_palpite()")
            self.handle_post_palpite()
        else:
            print(f"❌ Endpoint não encontrado: {parsed_path.path}")
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
            import time
            start_time = time.time()
            print(f"📥 GET /api/palpites iniciado... [{start_time:.2f}]")
            
            palpites = get_all_palpites()
            elapsed = time.time() - start_time
            print(f"✅ Palpites carregados: {len(palpites)} itens [{elapsed:.2f}s]")
            
            self.send_json_response(200, {'palpites': palpites})
            print(f"📤 Resposta GET enviada [{time.time() - start_time:.2f}s]")
        except (ConnectionResetError, BrokenPipeError, OSError) as e:
            # Cliente fechou a conexão (timeout, abort, etc) - não é um erro crítico
            print(f"⚠️ Conexão fechada pelo cliente durante GET")
            pass
        except Exception as e:
            print(f"❌ Erro ao processar GET: {e}")
            try:
                self.send_json_response(500, {'error': str(e)})
            except (ConnectionResetError, BrokenPipeError, OSError):
                pass
    
    def handle_get_stats(self):
        """Retorna estatísticas dos palpites"""
        try:
            stats = get_stats()
            # Adiciona informações do ganhador nas estatísticas
            ganhador = get_ganhador()
            if ganhador:
                stats['ganhador_info'] = ganhador
            self.send_json_response(200, stats)
        except (ConnectionResetError, BrokenPipeError, OSError) as e:
            # Cliente fechou a conexão (timeout, abort, etc) - não é um erro crítico
            pass
        except Exception as e:
            try:
                self.send_json_response(500, {'error': str(e)})
            except (ConnectionResetError, BrokenPipeError, OSError):
                pass
    
    def handle_post_palpite(self):
        """Adiciona um novo palpite"""
        try:
            import time
            start_time = time.time()
            print(f"🔄 Processando POST /api/palpites... [{start_time:.2f}]")
            
            content_length = int(self.headers.get('Content-Length', 0))
            print(f"📏 Content-Length: {content_length} [{time.time() - start_time:.2f}s]")
            
            if content_length == 0:
                print("❌ Content-Length é 0 - nenhum dado recebido")
                self.send_json_response(400, {'error': 'Nenhum dado recebido'})
                return
            
            post_data = self.rfile.read(content_length)
            print(f"📦 Dados recebidos: {len(post_data)} bytes [{time.time() - start_time:.2f}s]")
            
            data = json.loads(post_data.decode('utf-8'))
            print(f"✅ JSON decodificado: {data} [{time.time() - start_time:.2f}s]")
            
            # Validação dos dados
            required_fields = ['nome', 'sexo', 'mensagem', 'dataPalpite']
            for field in required_fields:
                if field not in data:
                    try:
                        self.send_json_response(400, {'error': f'Campo obrigatório ausente: {field}'})
                    except (ConnectionResetError, BrokenPipeError, OSError):
                        pass
                    return
            
            if data['sexo'] not in ['menina', 'menino']:
                try:
                    self.send_json_response(400, {'error': 'Sexo deve ser "menina" ou "menino"'})
                except (ConnectionResetError, BrokenPipeError, OSError):
                    pass
                return
            
            # Verifica se é o 10º palpite (ganhador)
            print(f"🔍 Verificando se é ganhador... [{time.time() - start_time:.2f}s]")
            total_palpites = len(get_all_palpites())
            eh_ganhador = (total_palpites + 1) == 10  # +1 porque vamos adicionar este
            
            if eh_ganhador:
                print(f"🎉 Este é o 10º palpite! {data['nome']} é o ganhador!")
            
            # Adiciona o palpite
            print(f"💾 Salvando no banco de dados... [{time.time() - start_time:.2f}s]")
            palpite_id = add_palpite(
                nome=data['nome'],
                sexo=data['sexo'],
                mensagem=data['mensagem'],
                data_palpite=data['dataPalpite'],
                sugestao_nome=data.get('sugestaoNome'),
                eh_ganhador=eh_ganhador
            )
            
            elapsed = time.time() - start_time
            print(f"✅ Palpite salvo com ID: {palpite_id} [{elapsed:.2f}s]")
            self.send_json_response(201, {'id': palpite_id, 'message': 'Palpite adicionado com sucesso'})
            print(f"📤 Resposta enviada ao cliente [{time.time() - start_time:.2f}s]")
        except (ConnectionResetError, BrokenPipeError, OSError) as e:
            # Cliente fechou a conexão (timeout, abort, etc) - não é um erro crítico
            pass
        except json.JSONDecodeError:
            try:
                self.send_json_response(400, {'error': 'JSON inválido'})
            except (ConnectionResetError, BrokenPipeError, OSError):
                pass
        except Exception as e:
            try:
                self.send_json_response(500, {'error': str(e)})
            except (ConnectionResetError, BrokenPipeError, OSError):
                pass
    
    def handle_delete_palpites(self):
        """Remove todos os palpites"""
        try:
            clear_all_palpites()
            self.send_json_response(200, {'message': 'Todos os palpites foram removidos'})
        except (ConnectionResetError, BrokenPipeError, OSError) as e:
            # Cliente fechou a conexão (timeout, abort, etc) - não é um erro crítico
            pass
        except Exception as e:
            try:
                self.send_json_response(500, {'error': str(e)})
            except (ConnectionResetError, BrokenPipeError, OSError):
                pass
    
    def send_json_response(self, status_code, data):
        """Envia uma resposta JSON"""
        try:
            self.send_response(status_code)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_cors_headers()
            self.end_headers()
            
            response = json.dumps(data, ensure_ascii=False, indent=2)
            self.wfile.write(response.encode('utf-8'))
        except (ConnectionResetError, BrokenPipeError, OSError) as e:
            # Cliente fechou a conexão antes de receber a resposta (timeout, abort, etc)
            # Isso é normal e não precisa ser logado como erro
            pass
        except Exception as e:
            # Outros erros podem ser logados
            try:
                self.log_error("Erro ao enviar resposta: %s", str(e))
            except:
                pass  # Se log_error falhar, ignora
    
    def end_headers(self):
        """Adiciona headers CORS em todas as respostas"""
        self.send_cors_headers()
        super().end_headers()
    
    def log_message(self, format, *args):
        """Customiza as mensagens de log"""
        # Ignora mensagens de erro de conexão fechada (normal quando cliente aborta requisição)
        message = format % args if args else format
        if '10054' not in message and 'ConnectionResetError' not in message and 'BrokenPipeError' not in message:
            print(f"[{self.log_date_time_string()}] {message}")
    
    def log_error(self, format, *args):
        """Log de erros - sobrescreve para aceitar os mesmos argumentos da classe base"""
        message = format % args if args else format
        # Ignora erros comuns que não são críticos
        if 'favicon.ico' not in message.lower() and \
           '.well-known' not in message.lower() and \
           'devtools' not in message.lower():
            print(f"[{self.log_date_time_string()}] ERROR: {message}")

def main():
    """Função principal"""
    # Inicializa o banco de dados
    print("🔧 Inicializando banco de dados...")
    init_db()
    
    # Verifica se a porta está disponível
    try:
        # Usa ThreadingMixIn para suportar requisições simultâneas
        class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
            daemon_threads = True
            allow_reuse_address = True
        
        with ThreadingHTTPServer(("", PORT), APIHandler) as httpd:
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
