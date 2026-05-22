from fastapi import Header

from app.core.config import settings
from app.schemas.errors import UnauthorizedError


def verify_admin_token(authorization: str = Header(...)):
    expected = f"Bearer {settings.ADMIN_TOKEN}"
    if authorization != expected:
        raise UnauthorizedError("Invalid or missing admin token")
