from datetime import date

from app.api.v1.repositories import players as players_repo
from app.models.players import Player


def make_player(
    *,
    external_api_id: int = 100,
    display_name: str = "Lionel Messi",
    first_name: str | None = "Lionel",
    last_name: str | None = "Messi",
    date_of_birth: date | None = date(1987, 6, 24),
    photo_url: str | None = "https://example.com/messi.png",
    nationality: str | None = "Argentina",
    height: int | None = 170,
) -> Player:
    return Player(
        external_api_id=external_api_id,
        display_name=display_name,
        first_name=first_name,
        last_name=last_name,
        date_of_birth=date_of_birth,
        photo_url=photo_url,
        nationality=nationality,
        height=height,
    )


def test_get_player_from_external_id_returns_player_when_found(db_session):
    players_repo.upsert_players(
        db_session,
        [
            make_player(
                external_api_id=9001,
                display_name="Kylian Mbappe",
                first_name="Kylian",
                last_name="Mbappe",
                nationality="France",
                height=178,
            )
        ],
    )

    result = players_repo.get_player_from_external_id(db_session, 9001)

    assert result is not None
    assert result.external_api_id == 9001
    assert result.display_name == "Kylian Mbappe"
    assert result.first_name == "Kylian"
    assert result.last_name == "Mbappe"
    assert result.nationality == "France"
    assert result.height == 178


def test_get_player_from_external_id_returns_none_when_missing(db_session):
    result = players_repo.get_player_from_external_id(db_session, 999999)

    assert result is None


def test_upsert_players_inserts_multiple_players(db_session):
    players_repo.upsert_players(
        db_session,
        [
            make_player(external_api_id=1, display_name="Player One"),
            make_player(external_api_id=2, display_name="Player Two"),
        ],
    )

    players = db_session.query(Player).order_by(Player.external_api_id).all()

    assert len(players) == 2
    assert [player.external_api_id for player in players] == [1, 2]
    assert [player.display_name for player in players] == ["Player One", "Player Two"]


def test_upsert_players_updates_existing_player_without_changing_primary_id_or_created_at(
    db_session,
):
    players_repo.upsert_players(
        db_session,
        [
            make_player(
                external_api_id=10,
                display_name="Old Name",
                first_name="Old",
                last_name="Name",
                photo_url="https://example.com/old.png",
                nationality="Oldland",
                height=180,
            )
        ],
    )

    existing = players_repo.get_player_from_external_id(db_session, 10)
    original_id = existing.id
    original_created_at = existing.created_at

    players_repo.upsert_players(
        db_session,
        [
            make_player(
                external_api_id=10,
                display_name="New Name",
                first_name="New",
                last_name="Name",
                date_of_birth=date(2000, 1, 1),
                photo_url="https://example.com/new.png",
                nationality="Newland",
                height=181,
            )
        ],
    )

    updated = players_repo.get_player_from_external_id(db_session, 10)

    assert updated.id == original_id
    assert updated.created_at == original_created_at
    assert updated.display_name == "New Name"
    assert updated.first_name == "New"
    assert updated.last_name == "Name"
    assert updated.date_of_birth == date(2000, 1, 1)
    assert updated.photo_url == "https://example.com/new.png"
    assert updated.nationality == "Newland"
    assert updated.height == 181


def test_upsert_players_does_not_overwrite_nullable_fields_with_none(db_session):
    players_repo.upsert_players(
        db_session,
        [
            make_player(
                external_api_id=20,
                display_name="Strong Data",
                first_name="Strong",
                last_name="Player",
                date_of_birth=date(1995, 5, 5),
                photo_url="https://example.com/strong.png",
                nationality="Canada",
                height=188,
            )
        ],
    )

    players_repo.upsert_players(
        db_session,
        [
            make_player(
                external_api_id=20,
                display_name="Updated Display Name",
                first_name=None,
                last_name=None,
                date_of_birth=None,
                photo_url=None,
                nationality=None,
                height=None,
            )
        ],
    )

    updated = players_repo.get_player_from_external_id(db_session, 20)

    assert updated.display_name == "Updated Display Name"
    assert updated.first_name == "Strong"
    assert updated.last_name == "Player"
    assert updated.date_of_birth == date(1995, 5, 5)
    assert updated.photo_url == "https://example.com/strong.png"
    assert updated.nationality == "Canada"
    assert updated.height == 188


def test_upsert_players_fills_nullable_fields_when_existing_values_are_none(db_session):
    players_repo.upsert_players(
        db_session,
        [
            make_player(
                external_api_id=30,
                display_name="Partial Player",
                first_name=None,
                last_name=None,
                date_of_birth=None,
                photo_url=None,
                nationality=None,
                height=None,
            )
        ],
    )

    players_repo.upsert_players(
        db_session,
        [
            make_player(
                external_api_id=30,
                display_name="Complete Player",
                first_name="Complete",
                last_name="Player",
                date_of_birth=date(1998, 8, 8),
                photo_url="https://example.com/complete.png",
                nationality="France",
                height=177,
            )
        ],
    )

    updated = players_repo.get_player_from_external_id(db_session, 30)

    assert updated.display_name == "Complete Player"
    assert updated.first_name == "Complete"
    assert updated.last_name == "Player"
    assert updated.date_of_birth == date(1998, 8, 8)
    assert updated.photo_url == "https://example.com/complete.png"
    assert updated.nationality == "France"
    assert updated.height == 177


def test_upsert_players_returns_without_commit_or_execute_when_rows_empty(db_session, mocker):
    execute_spy = mocker.spy(db_session, "execute")
    commit_spy = mocker.spy(db_session, "commit")

    players_repo.upsert_players(db_session, [])

    execute_spy.assert_not_called()
    commit_spy.assert_not_called()
    assert db_session.query(Player).count() == 0


def test_upsert_players_handles_insert_and_update_in_separate_calls(db_session):
    players_repo.upsert_players(
        db_session,
        [
            make_player(external_api_id=1, display_name="Original One"),
            make_player(external_api_id=2, display_name="Original Two"),
        ],
    )

    players_repo.upsert_players(
        db_session,
        [
            make_player(external_api_id=2, display_name="Updated Two"),
            make_player(external_api_id=3, display_name="Inserted Three"),
        ],
    )

    players = db_session.query(Player).order_by(Player.external_api_id).all()

    assert [(player.external_api_id, player.display_name) for player in players] == [
        (1, "Original One"),
        (2, "Updated Two"),
        (3, "Inserted Three"),
    ]
