import uuid
import time

import sentry_sdk
import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import settings

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    environment=settings.ENVIRONMENT,  # "staging" | "production"
    traces_sample_rate=0.2,  # 20% of requests for performance tracing
    profiles_sample_rate=0.1,
    send_default_pii=False,  # never log user data
)

logger = structlog.get_logger()


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # skip logging for health endpoint
        if request.url.path in ("/api/v1/health", "/api/v1/health/"):
            return await call_next(request)

        request_id = str(uuid.uuid4())
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        logger.info(
            "request",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
            request_id=request_id,
        )

        response.headers["X-Request-ID"] = request_id
        return response
