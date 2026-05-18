import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.middleware.logging import RequestLoggingMiddleware
from app.schemas.errors import AppError, app_error_handler

# skip Sentry if not given for cases such as when running unit tests
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=0.2,
        profiles_sample_rate=0.1,
        send_default_pii=False,
    )

app = FastAPI(title="Soccer Tournament Dashboard API")

app.add_exception_handler(AppError, app_error_handler)

app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Soccer Tournament Dashboard API"}
