from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

origins = ["http://localhost:8081", "http://127.0.0.1:8081"]
  # Substitua por sua origem permitida

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImovelCreate(BaseModel):
    nome: str
    finalidade: tuple | None # alugar, comprar, permuta
    tipo: str # Casa, terreno, Sala...
    status: str # publicado, rascunho, lixo
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

class CRUD:
    caminho = "imoveis.json" # é possível usar crud.caminho = 'novo.json'
    def __init__(self, modo) -> None:
        self.modo = modo

    def set_nome(self, nome):
        set.nome = nome

    def conexao(self, dados=None):
        """
            modo: '+r' para leitura
            modo: '+w' para escrita
        """
        with open(self.caminho, self.modo, encoding='utf8') as file:
            if self.modo == '+w':
                file.write(dados)
            elif self.modo == '+r':
                return file.read()

class ImovelCRUD(ImovelRead):
    def __init__(self):
        pass


@app.get('/imoveis') # , response_model=list[ImovelRead]
async def lista_imoveis(skip: int = 0, limit: int = 100, finalidade=None, tipo=None, bairro=None, area_t_min=None, area_t_max=None, preco_v_min=None, preco_v_max=None, preco_l_min=None, preco_l_max=None):
    """
        skip: número da paginação (Exemplo você vai consultar a pagina 1 de 10)
        limit: número de itens por página (padrão é 100 mas pode ser alterado para 10-1000)
    """
    import json
    crud = CRUD('+r') # conexao banco
    dados = crud.conexao()
    dados = json.loads(dados)
    if finalidade: # filtra por venda, locacao...
        filtro = lambda item: item['finalidade'] in finalidade.upper()
        dados = list(filter(filtro, dados))
    
    if tipo:
        filtro = lambda item: item['tipo'] in tipo.upper()
        dados = list(filter(filtro, dados))

    if bairro: # bairro
        filtro = lambda item: item['bairro'] in bairro.upper()
        dados = list(filter(filtro, dados))

    if area_t_min: # bairro
        filtro = lambda item: float(item['area_terreno']) >= float(area_t_min)
        dados = list(filter(filtro, dados))

    if area_t_max: # bairro
        filtro = lambda item: float(item['area_terreno']) <= float(area_t_max)
        dados = list(filter(filtro, dados))

    # Desenvolva os demais filtros seguindo o modelo

    return dados

@app.get("/itens")
async def obter_itens():
    crud = CRUD('+r')
    dados = crud.conexao()
    return dados

@app.post("/usuarios")
async def salvar_item(usuario: Usuario):
    u = {
        "id": len(dados)+1
        ,"nome": usuario.nome
        ,"idade": usuario.idade
    }
    dados.append(u)
    return {"mensagem": "Usuário criado com sucesso!", "id": u["id"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)