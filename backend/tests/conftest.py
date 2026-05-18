import os

os.environ['ENVIRONMENT'] = 'test'
os.environ['SENTRY_DSN'] = ''

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)