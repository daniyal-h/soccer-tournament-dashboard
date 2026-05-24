import pytest

from app.core import auth
from app.schemas.errors import UnauthorizedError


def test_verify_admin_token_accepts_valid_bearer_token(mocker):
    mocker.patch.object(auth.settings, "ADMIN_TOKEN", "secret-token")

    result = auth.verify_admin_token("Bearer secret-token")

    assert result is None


def test_verify_admin_token_rejects_invalid_token(mocker):
    mocker.patch.object(auth.settings, "ADMIN_TOKEN", "secret-token")

    with pytest.raises(UnauthorizedError, match="^Invalid or missing admin token$"):
        auth.verify_admin_token("Bearer wrong-token")


def test_verify_admin_token_rejects_missing_bearer_prefix(mocker):
    mocker.patch.object(auth.settings, "ADMIN_TOKEN", "secret-token")

    with pytest.raises(UnauthorizedError, match="^Invalid or missing admin token$"):
        auth.verify_admin_token("secret-token")
