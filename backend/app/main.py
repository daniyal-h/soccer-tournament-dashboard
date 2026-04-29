from fastapi import FastAPI

from app.api.v1.api import api_router

app = FastAPI(title='Soccer Tournament Dashboard API')

app.include_router(api_router, prefix='/api/v1')

@app.get('/')
async def root() -> dict[str, str]:
    return {'message': 'Soccer Tournament Dashboard API'}