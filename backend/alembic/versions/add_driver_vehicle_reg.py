"""add_driver_vehicle_reg

Drivers record their own vehicle registration number instead of the trip
carrying a fixed placeholder.

Revision ID: add_driver_vehicle_reg
Revises: add_dispatch
Create Date: 2026-10-29 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'add_driver_vehicle_reg'
down_revision: Union[str, Sequence[str], None] = 'add_dispatch'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('vehicle_reg_number', sa.String(length=20), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('vehicle_reg_number')
