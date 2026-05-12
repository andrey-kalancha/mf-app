"""baseline current demo schema

Revision ID: 20260426_0001
Revises:
Create Date: 2026-04-26
"""

from typing import Sequence, Union

revision: str = "20260426_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Baseline migration for the current demo schema.
    # Existing deployments can stamp this revision after create_all/schema_sync.
    pass


def downgrade() -> None:
    pass
