from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    VERSION: str = "0.1.0"
    DATABASE_URL: str
    ENVIRONMENT: str = "staging"

    class Config:
        env_file = ".env"

    class Settings(BaseSettings):
        VERSION: str = "0.1.0"
        DATABASE_URL: str
        ENVIRONMENT: str = "staging"
        SENTRY_DSN: str = ""


settings = Settings()
