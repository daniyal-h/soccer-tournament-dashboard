"""add_var_and_other_match_event_types

Revision ID: 21017bca6214
Revises: eeef23beb34c
Create Date: 2026-06-02 17:49:52.765172

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "21017bca6214"
down_revision: Union[str, Sequence[str], None] = "eeef23beb34c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE event_type_enum ADD VALUE IF NOT EXISTS 'var'")
    op.execute("ALTER TYPE event_type_enum ADD VALUE IF NOT EXISTS 'other'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
