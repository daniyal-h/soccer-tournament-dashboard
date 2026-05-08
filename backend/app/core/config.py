from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    VERSION: str = "0.1.0"
    DATABASE_URL: str
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
