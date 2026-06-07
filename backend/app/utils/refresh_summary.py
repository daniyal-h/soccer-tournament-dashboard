from dataclasses import asdict, dataclass, field


@dataclass
class RefreshFailure:
    tournament_id: int
    external_api_id: int
    season: str
    reason: str


@dataclass
class RefreshSummary:
    resource_name: str
    tournaments_checked: int = 0
    tournaments_refreshed: int = 0
    tournaments_skipped: int = 0
    rows_processed: int = 0
    failures: list[RefreshFailure] = field(default_factory=list)

    def has_failures(self) -> bool:
        return bool(self.failures)

    def mark_refreshed(self, rows_count: int) -> None:
        self.tournaments_refreshed += 1
        self.rows_processed += rows_count

    def mark_skipped(self) -> None:
        self.tournaments_skipped += 1

    def add_failure(
        self,
        *,
        tournament_id: int,
        external_api_id: int,
        season: str | None,
        reason: str,
    ) -> None:
        self.failures.append(
            RefreshFailure(
                tournament_id=tournament_id,
                external_api_id=external_api_id,
                season=season,
                reason=reason,
            )
        )

    def to_dict(self) -> dict:
        message = f"{self.resource_name} refresh completed"

        if self.failures:
            message = f"{self.resource_name} refresh completed with failures"

        return {
            "message": message,
            **asdict(self),
        }
