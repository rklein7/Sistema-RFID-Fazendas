from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional, List
import jwt
from passlib.context import CryptContext
import os

# ===============================
# CONFIGURAÇÕES
# ===============================

SECRET_KEY = os.getenv("SECRET_KEY", "sua-chave-secreta-super-segura-mude-isso")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Banco de dados
DATABASE_URL = "sqlite:///./fazenda_rfid.db"
# Para PostgreSQL use: "postgresql://user:password@localhost/dbname"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Segurança
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    nome_completo = Column(String)
    email = Column(String, unique=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    ativo = Column(Integer, default=1)  # SQLite usa Integer para Boolean


class Leitura(Base):
    __tablename__ = "leituras"
    
    id = Column(Integer, primary_key=True, index=True)
    zona = Column(Integer, nullable=False, index=True)
    tipo_animal = Column(String, nullable=False, index=True)
    uid = Column(String, nullable=False)
    count = Column(Integer)
    arduino = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

Base.metadata.create_all(bind=engine)

class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    nome_completo: Optional[str]


class LeituraCreate(BaseModel):
    zona: int
    tipo_animal: str
    uid: str
    count: Optional[int] = 0
    arduino: Optional[str] = None
    timestamp: Optional[str] = None


class LeituraResponse(BaseModel):
    id: int
    zona: int
    tipo_animal: str
    uid: str
    count: int
    arduino: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_leituras: int
    leituras_hoje: int
    por_zona: dict
    por_tipo: dict
    ultimas_leituras: List[LeituraResponse]


class UsuarioCreate(BaseModel):
    username: str
    password: str
    nome_completo: Optional[str] = None
    email: Optional[str] = None

app = FastAPI(
    title="Sistema RFID Fazenda",
    description="API para gerenciamento de leituras RFID de animais",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verificar_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar as credenciais"
        )

@app.post("/api/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == login_data.username).first()
    
    if not usuario or not verify_password(login_data.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos"
        )
    
    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": usuario.username},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": usuario.username,
        "nome_completo": usuario.nome_completo
    }


@app.post("/api/usuarios", status_code=status.HTTP_201_CREATED)
def criar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    
    db_usuario = db.query(Usuario).filter(Usuario.username == usuario.username).first()
    if db_usuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário já existe"
        )
    
    novo_usuario = Usuario(
        username=usuario.username,
        senha_hash=get_password_hash(usuario.password),
        nome_completo=usuario.nome_completo,
        email=usuario.email
    )
    
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    
    return {"message": "Usuário criado com sucesso", "username": novo_usuario.username}


@app.get("/api/me")
def get_current_user(username: str = Depends(verificar_token), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {
        "username": usuario.username,
        "nome_completo": usuario.nome_completo,
        "email": usuario.email,
        "criado_em": usuario.criado_em
    }

@app.post("/api/leituras", response_model=LeituraResponse, status_code=status.HTTP_201_CREATED)
def criar_leitura(leitura: LeituraCreate, db: Session = Depends(get_db)):
    
    timestamp = datetime.utcnow()
    if leitura.timestamp:
        try:
            timestamp = datetime.fromisoformat(leitura.timestamp.replace('Z', '+00:00'))
        except:
            pass
    
    nova_leitura = Leitura(
        zona=leitura.zona,
        tipo_animal=leitura.tipo_animal,
        uid=leitura.uid,
        count=leitura.count,
        arduino=leitura.arduino,
        timestamp=timestamp
    )
    
    db.add(nova_leitura)
    db.commit()
    db.refresh(nova_leitura)
    
    return nova_leitura


@app.get("/api/leituras", response_model=List[LeituraResponse])
def listar_leituras(
    skip: int = 0,
    limit: int = 100,
    zona: Optional[int] = None,
    tipo_animal: Optional[str] = None,
    username: str = Depends(verificar_token),
    db: Session = Depends(get_db)
):
    
    query = db.query(Leitura)
    
    if zona:
        query = query.filter(Leitura.zona == zona)
    
    if tipo_animal:
        query = query.filter(Leitura.tipo_animal == tipo_animal)
    
    leituras = query.order_by(Leitura.timestamp.desc()).offset(skip).limit(limit).all()
    
    return leituras


@app.get("/api/dashboard", response_model=DashboardStats)
def get_dashboard(
    username: str = Depends(verificar_token),
    db: Session = Depends(get_db)
):
    
    total_leituras = db.query(Leitura).count()
    
    hoje = datetime.utcnow().date()
    leituras_hoje = db.query(Leitura).filter(
        func.date(Leitura.timestamp) == hoje
    ).count()
    
    por_zona = {}
    zonas = db.query(Leitura.zona, func.count(Leitura.id)).group_by(Leitura.zona).all()
    for zona, count in zonas:
        por_zona[f"zona_{zona}"] = count
    
    por_tipo = {}
    tipos = db.query(Leitura.tipo_animal, func.count(Leitura.id)).group_by(Leitura.tipo_animal).all()
    for tipo, count in tipos:
        por_tipo[tipo.lower()] = count
    
    ultimas_leituras = db.query(Leitura).order_by(
        Leitura.timestamp.desc()
    ).limit(10).all()
    
    return {
        "total_leituras": total_leituras,
        "leituras_hoje": leituras_hoje,
        "por_zona": por_zona,
        "por_tipo": por_tipo,
        "ultimas_leituras": ultimas_leituras
    }


@app.get("/api/estatisticas/zona/{zona_id}")
def estatisticas_zona(
    zona_id: int,
    username: str = Depends(verificar_token),
    db: Session = Depends(get_db)
):
    
    total = db.query(Leitura).filter(Leitura.zona == zona_id).count()
    
    tipos = db.query(
        Leitura.tipo_animal,
        func.count(Leitura.id)
    ).filter(
        Leitura.zona == zona_id
    ).group_by(Leitura.tipo_animal).all()
    
    por_tipo = {tipo: count for tipo, count in tipos}
    
    ultima = db.query(Leitura).filter(
        Leitura.zona == zona_id
    ).order_by(Leitura.timestamp.desc()).first()
    
    return {
        "zona": zona_id,
        "total_leituras": total,
        "por_tipo": por_tipo,
        "ultima_leitura": ultima.timestamp if ultima else None
    }

@app.get("/api/status")
def status():
    return {
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/")
def root():
    return {
        "message": "Sistema RFID Fazenda API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.on_event("startup")
def startup_event():
    """Cria usuário admin padrão se não existir"""
    db = SessionLocal()
    try:
        admin = db.query(Usuario).filter(Usuario.username == "admin").first()
        if not admin:
            admin = Usuario(
                username="admin",
                senha_hash=get_password_hash("admin123"),
                nome_completo="Administrador",
                email="admin@fazenda.com"
            )
            db.add(admin)
            db.commit()
            print("✅ Usuário admin criado (username: admin, password: admin123)")
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)