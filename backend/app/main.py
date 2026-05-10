from fastapi import FastAPI

from app.api.v1.api import api_router
from app.middleware.logging import RequestLoggingMiddleware
from app.schemas.errors import AppError, app_error_handler

app = FastAPI(title="Soccer Tournament Dashboard API")

app.add_exception_handler(AppError, app_error_handler)

app.add_middleware(RequestLoggingMiddleware)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Soccer Tournament Dashboard API"}
