import os

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql://test_user:test_password@localhost:5432/test_db",
)
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("SENTRY_DSN", "")
os.environ.setdefault("ALLOWED_ORIGINS", '["http://localhost:5173","http://localhost:3000"]')
os.environ["ADMIN_TOKEN"] = "test_token"

from collections.abc import Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.database import get_db
from app.main import app as fastapi_app


def override_get_db() -> Generator[None, None, None]:
    yield None


@pytest.fixture
def app() -> Generator[FastAPI, None, None]:
    fastapi_app.dependency_overrides[get_db] = override_get_db

    yield fastapi_app

    fastapi_app.dependency_overrides.clear()


@pytest.fixture
def client(app: FastAPI) -> TestClient:
    return TestClient(app)
