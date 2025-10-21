from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
import urllib

# MS SQL Server connection string
params = urllib.parse.quote_plus(
    f"DRIVER={{ODBC Driver 18 for SQL Server}};"
    f"SERVER={settings.database_host},{settings.database_port};"
    f"DATABASE={settings.database_name};"
    f"UID={settings.database_user};"
    f"PWD={settings.database_password};"
    f"TrustServerCertificate=yes;"
)

SQLALCHEMY_DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=settings.debug,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_database_url() -> str:
    """
    Retorna la URL de conexión a la base de datos para Alembic
    """
    return SQLALCHEMY_DATABASE_URL

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
