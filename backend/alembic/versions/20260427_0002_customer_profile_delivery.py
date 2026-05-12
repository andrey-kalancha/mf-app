"""customer profile and order delivery fields

Revision ID: 20260427_0002
Revises: 20260426_0001
Create Date: 2026-04-27
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260427_0002"
down_revision: Union[str, None] = "20260426_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("phone", sa.String(length=50), nullable=True))
    op.add_column("users", sa.Column("company", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("city", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("delivery_address", sa.String(length=500), nullable=True))
    op.add_column("orders", sa.Column("delivery_address", sa.Text(), nullable=True))
    op.add_column("orders", sa.Column("customer_name", sa.String(length=255), nullable=True))
    op.add_column("orders", sa.Column("customer_phone", sa.String(length=50), nullable=True))
    op.add_column("orders", sa.Column("customer_company", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "customer_company")
    op.drop_column("orders", "customer_phone")
    op.drop_column("orders", "customer_name")
    op.drop_column("orders", "delivery_address")
    op.drop_column("users", "delivery_address")
    op.drop_column("users", "city")
    op.drop_column("users", "company")
    op.drop_column("users", "phone")
