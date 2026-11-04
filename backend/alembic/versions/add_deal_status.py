"""add_deal_status

Vendor-proposed deals must be approved by an admin before buyers can see them.
Existing deals are platform-curated, so they default to 'approved'.

Revision ID: add_deal_status
Revises: add_audit_log
Create Date: 2026-10-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'add_deal_status'
down_revision: Union[str, Sequence[str], None] = 'add_audit_log'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('deals') as batch_op:
        batch_op.add_column(
            sa.Column('status', sa.String(length=20), nullable=False, server_default='approved')
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('deals') as batch_op:
        batch_op.drop_column('status')
