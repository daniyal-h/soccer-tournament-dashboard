from app.models.match import StageType

KNOCKOUT_STAGES = {
    StageType.ROUND_OF_32,
    StageType.ROUND_OF_16,
    StageType.QUARTER_FINAL,
    StageType.SEMI_FINAL,
    StageType.THIRD_PLACE,
    StageType.FINAL,
}

STAGE_SORT_ORDER = {
    StageType.FINAL: 1,
    # third place and semi final have equal weight as not all tournaments have 3rd place matches
    StageType.SEMI_FINAL: 2,
    StageType.THIRD_PLACE: 2,
    StageType.QUARTER_FINAL: 3,
    StageType.ROUND_OF_16: 4,
    StageType.ROUND_OF_32: 5,
    StageType.GROUP: 6,
}
