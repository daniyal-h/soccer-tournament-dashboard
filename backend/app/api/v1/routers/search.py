from fastapi import APIRouter, Query
from enum import Enum
from typing import Annotated


class TypesCategory(str, Enum):
    team = "team"
    player = "player"
    all = "all"


router = APIRouter()


@router.get("/")
async def search(
    q: str, search_type: Annotated[TypesCategory, Query(alias="type")] = TypesCategory.all
) -> dict:
    return {"message": "not yet implemented"}
