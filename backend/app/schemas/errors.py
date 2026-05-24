from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

# Base exception


class AppError(Exception):
    status_code: int = 500
    code: str = "INTERNAL_ERROR"

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


# Typed exceptions


class NotFoundError(AppError):
    status_code = 404
    code = "NOT_FOUND"


class UnauthorizedError(AppError):
    status_code = 403
    code = "UNAUTHORIZED"


class BadRequestError(AppError):
    status_code = 400
    code = "BAD_REQUEST"


class ConflictError(AppError):
    status_code = 409
    code = "CONFLICT"


class RateLimitedError(AppError):
    status_code = 429
    code = "RATE_LIMITED"


# Exception handler


def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "status": exc.status_code,
                "code": exc.code,
                "message": exc.message,
            }
        },
    )


def rate_limit_handler(_request: Request, exc: RateLimitExceeded) -> JSONResponse:
    response = JSONResponse(
        status_code=429,
        content={
            "error": {
                "status": 429,
                "code": "RATE_LIMITED",
                "message": "Rate limit exceeded. Please try again later.",
            }
        },
    )

    if getattr(exc, "headers", None):
        response.headers.update(exc.headers)

    return response
