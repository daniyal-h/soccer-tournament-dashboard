from unittest.mock import patch

import pytest

from app.core.auth import verify_admin_token
from app.schemas.errors import UnauthorizedError


def test_verify_admin_token_passes_with_valid_token():
    with patch("app.core.auth.settings") as mock_settings:
        mock_settings.ADMIN_TOKEN = "secret123"
        # should not raise
        verify_admin_token(authorization="Bearer secret123")


def test_verify_admin_token_raises_with_invalid_token():
    with patch("app.core.auth.settings") as mock_settings:
        mock_settings.ADMIN_TOKEN = "secret123"
        with pytest.raises(UnauthorizedError):
            verify_admin_token(authorization="Bearer wrongtoken")


def test_verify_admin_token_raises_with_missing_bearer_prefix():
    with patch("app.core.auth.settings") as mock_settings:
        mock_settings.ADMIN_TOKEN = "secret123"
        with pytest.raises(UnauthorizedError):
            verify_admin_token(authorization="secret123")
