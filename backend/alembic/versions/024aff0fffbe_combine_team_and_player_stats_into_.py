"""combine_team_and_player_stats_into_player_data_job_name

Revision ID: 024aff0fffbe
Revises: 03091417374b
Create Date: 2026-06-18 20:07:35.710057

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "024aff0fffbe"
down_revision: Union[str, Sequence[str], None] = "03091417374b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE job_name_enum ADD VALUE IF NOT EXISTS 'player_data_refresh'")


def downgrade() -> None:
    pass
