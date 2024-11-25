from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json

app = FastAPI()

FAVORITOS_PATH = "favoritos.json"

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
async def lista_imoveis(
    skip: int = 0, 
    limit: int = 100, 
    finalidade: str = None, 
    tipo: str = None, 
    bairro: str = None, 
    area_t_min: float = None, 
    area_t_max: float = None, 
    preco_v_min: float = None, 
    preco_v_max: float = None, 
    preco_l_min: float = None, 
    preco_l_max: float = None
    ):
    """ 
    skip: número da paginação 
    limit: número de itens por página 
    """
    crud = CRUD('+r')
    dados = crud.conexao()

    # Filtros de busca
        
    if finalidade:
        filtro = lambda item: item['finalidade'].upper() == finalidade.upper()  # Comparação exata
        dados = list(filter(filtro, dados))

    if tipo:
        filtro = lambda item: item['tipo'].upper() == tipo.upper()  # Comparação exata
        dados = list(filter(filtro, dados))

    if bairro:
        filtro = lambda item: item['bairro'].upper() == bairro.upper()  # Comparação exata
        dados = list(filter(filtro, dados))

    if area_t_min:
        filtro = lambda item: float(item['area_terreno']) >= float(area_t_min)
        dados = list(filter(filtro, dados))

    if area_t_max:
        filtro = lambda item: float(item['area_terreno']) <= float(area_t_max)
        dados = list(filter(filtro, dados))
        
    if preco_v_min:
        filtro = lambda item: float(item['valor_venda']) >= float(preco_v_min)
        dados = list(filter(filtro, dados))

    if preco_v_max:
        filtro = lambda item: float(item['valor_venda']) <= float(preco_v_max)
        dados = list(filter(filtro, dados))
        
    if preco_l_min:
        filtro = lambda item: float(item['valor_aluguel']) >= float(preco_l_min)
        dados = list(filter(filtro, dados))

    if preco_l_max:
        filtro = lambda item: float(item['valor_aluguel']) <= float(preco_l_max)
        dados = list(filter(filtro, dados))

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

# Inicializa o arquivo favoritos.json se não existir
try:
    with open(FAVORITOS_PATH, "r") as f:
        favoritos = json.load(f)
except FileNotFoundError:
    with open(FAVORITOS_PATH, "w") as f:
        json.dump([], f)

@app.post("/favoritos")
async def add_favorito(imovel: dict):
    with open(FAVORITOS_PATH, "r") as f:
        favoritos = json.load(f)
    # Evita duplicatas
    if not any(fav["id"] == imovel["id"] for fav in favoritos):
        favoritos.append(imovel)
        with open(FAVORITOS_PATH, "w") as f:
            json.dump(favoritos, f)
    return {"message": "Imóvel favoritado com sucesso!"}

@app.get("/favoritos")
async def get_favoritos():
    with open(FAVORITOS_PATH, "r") as f:
        favoritos = json.load(f)
    return favoritos

@app.delete("/favoritos/{id}")
async def delete_favorito(id: int):
    with open(FAVORITOS_PATH, "r") as f:
        favoritos = json.load(f)
    # Encontra o favorito pelo ID
    favorito = next((f for f in favoritos if f["id"] == id), None)
    if not favorito:
        raise HTTPException(status_code=404, detail="Favorito não encontrado")
    # Remove o favorito da lista
    favoritos = [f for f in favoritos if f["id"] != id]
    # Salva as alterações no arquivo JSON
    with open(FAVORITOS_PATH, "w") as f:
        json.dump(favoritos, f, indent=4)
    return {"message": "Favorito removido com sucesso"}


# Inicialização do servidor
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)