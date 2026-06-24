from pydantic import BaseModel, Field

from app.schemas.common import MatchSummary


# use Field to prevent mutable defaults
class BracketResponse(BaseModel):
    round_of_32: list[MatchSummary] = Field(default_factory=list)
    round_of_16: list[MatchSummary] = Field(default_factory=list)
    quarter_final: list[MatchSummary] = Field(default_factory=list)
    semi_final: list[MatchSummary] = Field(default_factory=list)
    third_place: list[MatchSummary] = Field(default_factory=list)
    final: list[MatchSummary] = Field(default_factory=list)
