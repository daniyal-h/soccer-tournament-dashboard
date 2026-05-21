"""fix tournament api id constraint

Revision ID: 5ffa5e05f300
Revises: 97f606db7a1c
Create Date: 2026-05-20 23:43:27.878500

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "5ffa5e05f300"
down_revision: Union[str, Sequence[str], None] = "97f606db7a1c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_tournaments_external_api_id", table_name="tournaments")
    op.create_unique_constraint(
        "uq_tournament_api_id_season", "tournaments", ["external_api_id", "season"]
    )


def downgrade() -> None:
    op.drop_constraint("uq_tournament_api_id_season", "tournaments", type_="unique")
    op.create_index(
        "ix_tournaments_external_api_id", "tournaments", ["external_api_id"], unique=True
    )
