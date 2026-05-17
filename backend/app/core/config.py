from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    VERSION: str = "0.1.0"
    DATABASE_URL: str
    ENVIRONMENT: str = "development"
    SENTRY_DSN: str = ""
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env",
        case_sensitive=True,


settings = Settings()
