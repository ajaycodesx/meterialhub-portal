"""add_payment_fields_and_refunded_status

Revision ID: add_payment_fields
Revises: b4c85c207dc3
Create Date: 2026-10-20 22:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'add_payment_fields'
down_revision: Union[str, Sequence[str], None] = 'b4c85c207dc3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("ALTER TYPE orderstatus ADD VALUE 'REFUNDED'")

    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.add_column(sa.Column('payment_order_id', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('payment_id', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True))

    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_orders_payment_order_id'), ['payment_order_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_orders_payment_id'), ['payment_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_orders_payment_id'))
        batch_op.drop_index(batch_op.f('ix_orders_payment_order_id'))

    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_column('paid_at')
        batch_op.drop_column('payment_id')
        batch_op.drop_column('payment_order_id')

