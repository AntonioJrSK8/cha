import json
import sys
import os

# Adiciona o diretório api ao path
sys.path.insert(0, os.path.dirname(__file__))

from database import init_db, add_palpite, get_all_palpites, clear_all_palpites

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
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
        # GET - Lista todos os palpites
        if method == 'GET':
            palpites = get_all_palpites()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'palpites': palpites}, ensure_ascii=False)
            }
        
        # POST - Adiciona um novo palpite
        elif method == 'POST':
            # Lê body
            body = ''
            if isinstance(request, dict):
                body = request.get('body', '{}')
            elif hasattr(request, 'body'):
                body = request.body
            else:
                body = '{}'
            
            if isinstance(body, bytes):
                body = body.decode('utf-8')
            
            if not body or body == '{}':
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Nenhum dado recebido'}, ensure_ascii=False)
                }
            
            data = json.loads(body)
            
            # Validação
            required_fields = ['nome', 'sexo', 'mensagem', 'dataPalpite']
            for field in required_fields:
                if field not in data:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': f'Campo obrigatório ausente: {field}'}, ensure_ascii=False)
                    }
            
            if data['sexo'] not in ['menina', 'menino']:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Sexo deve ser "menina" ou "menino"'}, ensure_ascii=False)
                }
            
            # Verifica se é o 10º palpite (ganhador)
            palpites_existentes = get_all_palpites()
            total_palpites = len(palpites_existentes)
            eh_ganhador = (total_palpites + 1) == 10
            
            # Adiciona o palpite
            palpite_id = add_palpite(
                nome=data['nome'],
                sexo=data['sexo'],
                mensagem=data['mensagem'],
                data_palpite=data['dataPalpite'],
                sugestao_nome=data.get('sugestaoNome'),
                eh_ganhador=eh_ganhador
            )
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({
                    'id': palpite_id,
                    'message': 'Palpite adicionado com sucesso',
                    'ehGanhador': eh_ganhador
                }, ensure_ascii=False)
            }
        
        # DELETE - Remove todos os palpites
        elif method == 'DELETE':
            clear_all_palpites()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Todos os palpites foram removidos'}, ensure_ascii=False)
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Método não permitido'}, ensure_ascii=False)
            }
    
    except json.JSONDecodeError as e:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'JSON inválido: ' + str(e)}, ensure_ascii=False)
        }
    except Exception as e:
        import traceback
        print(f"Erro: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}, ensure_ascii=False)
        }
