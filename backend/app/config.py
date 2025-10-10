from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Application
    app_name: str = "Trámites MVP Panamá"
    debug: bool = True
    
    # Database
    database_host: str = "sqlserver"
    database_port: int = 1433
    database_name: str = "tramites_db"
    database_user: str = "sa"
    database_password: str = "YourStrong@Passw0rd"
    
    # Redis
    redis_host: str = "redis"
    redis_port: int = 6379
    redis_db: int = 0
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
