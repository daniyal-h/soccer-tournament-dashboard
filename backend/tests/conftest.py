import os

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql://test_user:test_password@localhost:5432/test_db",
)
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("SENTRY_DSN", "")
os.environ.setdefault("ALLOWED_ORIGINS", '["http://localhost:5173"]')
os.environ["ADMIN_TOKEN"] = "test_token"

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
