import os

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql://test_user:test_password@localhost:5432/test_db",
)
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("SENTRY_DSN", "")
os.environ.setdefault("ALLOWED_ORIGINS", '["http://localhost:5173","http://localhost:3000"]')
os.environ["ADMIN_TOKEN"] = "test_token"

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import app as fastapi_app


@pytest.fixture
def app() -> FastAPI:
    return fastapi_app


@pytest.fixture
def client(app: FastAPI) -> TestClient:
    return TestClient(app)
