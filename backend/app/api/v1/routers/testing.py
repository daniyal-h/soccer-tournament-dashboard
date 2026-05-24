from fastapi import APIRouter, Request

from app.middleware.rate_limit import limiter

router = APIRouter()


@router.get("/rate-limit")
@limiter.limit("5/minute")
def rate_limit_test(request: Request) -> dict:
    return {"message": "ok"}
