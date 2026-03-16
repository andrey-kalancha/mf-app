from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MF API"
    app_version: str = "0.2.0"
    api_prefix: str = "/api/v1"

    database_url: str = "postgresql+psycopg://mf:mf@db:5432/mf"
    redis_url: str = "redis://redis:6379/0"
    jwt_secret: str = "dev-secret-change-me"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()