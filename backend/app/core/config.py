import os
import urllib.parse
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bioplast Chile - Sistema de Operaciones y Trazabilidad"
    API_V1_STR: str = "/api"
    
    # AWS RDS PostgreSQL
    DB_HOST: str = os.getenv("DB_HOST", "ls-b12cc9081f17b594187264e8c7fe42119a9bb93f.cgt2s428cp85.us-east-1.rds.amazonaws.com")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_USER: str = os.getenv("DB_USER", "dbmasteruser")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "aDxD*,r.lNk`5lY8eN+^ABk3T+*97W`N")
    DB_NAME: str = os.getenv("DB_NAME", "postgres")
    DB_SCHEMA: str = os.getenv("DB_SCHEMA", "bdbioplastchile")
    
    # JWT & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "bioplast_chile_super_secure_traceability_key_2026_x99!#")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Public domain for QR
    PUBLIC_DOMAIN: str = os.getenv("PUBLIC_DOMAIN", "https://appbpch.raevsi.cl")

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        encoded_user = urllib.parse.quote_plus(self.DB_USER)
        encoded_password = urllib.parse.quote_plus(self.DB_PASSWORD)
        return (
            f"postgresql+psycopg2://{encoded_user}:{encoded_password}@"
            f"{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?options=-csearch_path%3D{self.DB_SCHEMA},bioplastchile,public"
        )

    class Config:
        extra = "allow"

settings = Settings()
