"""add_audit_log_table

Revision ID: add_audit_log
Revises: add_payment_fields
Create Date: 2026-10-20 23:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'add_audit_log'
down_revision: Union[str, Sequence[str], None] = 'add_payment_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('audit_logs',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('action', sa.String(length=50), nullable=False),
    sa.Column('actor_id', sa.String(length=50), nullable=False),
    sa.Column('actor_role', sa.String(length=50), nullable=True),
    sa.Column('target_type', sa.String(length=50), nullable=True),
    sa.Column('target_id', sa.String(length=50), nullable=True),
    sa.Column('ip_address', sa.String(length=45), nullable=True),
    sa.Column('user_agent', sa.String(length=255), nullable=True),
    sa.Column('request_id', sa.String(length=50), nullable=True),
    sa.Column('changes', sa.JSON(), nullable=True),
    sa.Column('context', sa.JSON(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=True),
    sa.Column('error_message', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('audit_logs', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_audit_logs_id'), ['id'], unique=False)
        batch_op.create_index(batch_op.f('ix_audit_logs_action'), ['action'], unique=False)
        batch_op.create_index(batch_op.f('ix_audit_logs_actor_id'), ['actor_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_audit_logs_target_type'), ['target_type'], unique=False)
        batch_op.create_index(batch_op.f('ix_audit_logs_target_id'), ['target_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_audit_logs_created_at'), ['created_at'], unique=False)
        batch_op.create_index(batch_op.f('ix_audit_logs_request_id'), ['request_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('audit_logs', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_audit_logs_request_id'))
        batch_op.drop_index(batch_op.f('ix_audit_logs_created_at'))
        batch_op.drop_index(batch_op.f('ix_audit_logs_target_id'))
        batch_op.drop_index(batch_op.f('ix_audit_logs_target_type'))
        batch_op.drop_index(batch_op.f('ix_audit_logs_actor_id'))
        batch_op.drop_index(batch_op.f('ix_audit_logs_action'))
        batch_op.drop_index(batch_op.f('ix_audit_logs_id'))

    op.drop_table('audit_logs')
