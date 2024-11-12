from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

app = FastAPI()

# Configuração do CORS
origins = ["http://localhost:8081", "http://127.0.0.1:8081"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definição dos modelos
class ImovelCreate(BaseModel):
    nome: str
    finalidade: tuple | None  # alugar, comprar, permuta
    tipo: str  # Casa, terreno, Sala...
    status: str  # publicado, rascunho, lixo
    imagem: str
    descricao: str
    valor_aluguel: float
    valor_venda: float
    bairro: str
    area_terreno: float
    area_construida: float

class ImovelRead(ImovelCreate):
    id: int

class Usuario(BaseModel):
    nome: str
    idade: int

class UsuarioRead(Usuario):
    id: int

# Classe CRUD para manuseio do arquivo JSON
class CRUD:
    caminho = "imoveis.json"

    def __init__(self, modo):
        self.modo = modo

    def conexao(self, dados=None):
        """ 
        Modo: '+r' para leitura, '+w' para escrita 
        """
        with open(self.caminho, self.modo, encoding='utf8') as file:
            if self.modo == '+w' and dados is not None:
                json.dump(dados, file)
            elif self.modo == '+r':
                return json.load(file)

# Endpoint para listar imóveis com filtros
@app.get('/imoveis')
async def lista_imoveis(skip: int = 0, limit: int = 100, finalidade: str = None, tipo: str = None, bairro: str = None, area_t_min: float = None, area_t_max: float = None, preco_v_min: float = None, preco_v_max: float = None, preco_l_min: float = None, preco_l_max: float = None):
    """ 
    skip: número da paginação 
    limit: número de itens por página 
    """
    crud = CRUD('+r')
    dados = crud.conexao()

    # Filtros de busca
    if finalidade:
        dados = [item for item in dados if finalidade.upper() in item['finalidade']]
    if tipo:
        dados = [item for item in dados if tipo.upper() == item['tipo'].upper()]
    if bairro:
        dados = [item for item in dados if bairro.upper() in item['bairro'].upper()]
    if area_t_min is not None:
        dados = [item for item in dados if float(item['area_terreno']) >= area_t_min]
    if area_t_max is not None:
        dados = [item for item in dados if float(item['area_terreno']) <= area_t_max]
    if preco_v_min is not None:
        dados = [item for item in dados if float(item['valor_venda']) >= preco_v_min]
    if preco_v_max is not None:
        dados = [item for item in dados if float(item['valor_venda']) <= preco_v_max]
    if preco_l_min is not None:
        dados = [item for item in dados if float(item['valor_aluguel']) >= preco_l_min]
    if preco_l_max is not None:
        dados = [item for item in dados if float(item['valor_aluguel']) <= preco_l_max]

    # Paginação
    dados = dados[skip: skip + limit]

    return dados

# Endpoint para obter todos os itens
@app.get("/itens")
async def obter_itens():
    crud = CRUD('+r')
    dados = crud.conexao()
    return dados

# Endpoint para salvar um usuário
@app.post("/usuarios")
async def salvar_item(usuario: Usuario):
    crud = CRUD('+r')
    dados = crud.conexao()

    u = {
        "id": len(dados) + 1,
        "nome": usuario.nome,
        "idade": usuario.idade
    }
    dados.append(u)

    # Salvar novo usuário no arquivo JSON
    crud = CRUD('+w')
    crud.conexao(dados)

    return {"mensagem": "Usuário criado com sucesso!", "id": u["id"]}

# Inicialização do servidor
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)