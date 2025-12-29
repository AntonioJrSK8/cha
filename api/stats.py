import json
import sys
import os

# Adiciona o diretório api ao path
sys.path.insert(0, os.path.dirname(__file__))

from database import init_db, get_stats, get_ganhador

def handler(request):
    """Handler para Serverless Function do Vercel"""
    
    # Inicializa banco
    try:
        init_db()
    except Exception as e:
        print(f"Erro ao inicializar banco: {e}")
    
    # Headers CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json; charset=utf-8'
    }
    
    # Obtém método HTTP
    method = request.get('method', 'GET') if isinstance(request, dict) else getattr(request, 'method', 'GET')
    
    # OPTIONS - CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        # GET - Retorna estatísticas
        if method == 'GET':
            stats = get_stats()
            # Adiciona informações do ganhador
            ganhador = get_ganhador()
            if ganhador:
                stats['ganhador_info'] = ganhador
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(stats, ensure_ascii=False)
            }
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Método não permitido'}, ensure_ascii=False)
            }
    
    except Exception as e:
        import traceback
        print(f"Erro: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}, ensure_ascii=False)
        }
