from fastapi import FastAPI
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.requests import Request

from app.schemas.errors import rate_limit_handler


# get IP address from either forwarded for or through request
def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")

    if forwarded:
        return forwarded.split(",")[0].strip()

    return request.client.host


limiter = Limiter(
    # rate limit based on IP addresses
    key_func=get_client_ip,
    default_limits=["100/minute"],
)


def setup_rate_limiting(app: FastAPI) -> None:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_handler)
    app.add_middleware(SlowAPIMiddleware)
