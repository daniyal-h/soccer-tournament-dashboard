"""add_job_name_enum_for_refresh_jobs

Revision ID: 591b26dcd8f0
Revises: 11de22611646
Create Date: 2026-06-06 16:44:15.979308

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "591b26dcd8f0"
down_revision: Union[str, Sequence[str], None] = "11de22611646"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    job_name_enum = sa.Enum(
        "standings_refresh",
        "matches_refresh",
        "match_events_refresh",
        "player_stats_refresh",
        name="job_name_enum",
    )

    job_name_enum.create(op.get_bind(), checkfirst=True)

    op.alter_column(
        "refresh_jobs",
        "job_name",
        existing_type=sa.String(length=100),
        type_=job_name_enum,
        existing_nullable=False,
        postgresql_using="job_name::job_name_enum",
    )


def downgrade() -> None:
    op.alter_column(
        "refresh_jobs",
        "job_name",
        existing_type=sa.Enum(
            "standings_refresh",
            "matches_refresh",
            "match_events_refresh",
            "player_stats_refresh",
            name="job_name_enum",
        ),
        type_=sa.String(length=100),
        existing_nullable=False,
    )

    sa.Enum(name="job_name_enum").drop(op.get_bind(), checkfirst=True)
