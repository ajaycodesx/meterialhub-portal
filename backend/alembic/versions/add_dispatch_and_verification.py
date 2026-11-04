"""add_dispatch_and_verification

Driver dispatch (offers, live location, capacity), store and trip coordinates,
and admin verification reasons for vendors and drivers.

Revision ID: add_dispatch
Revises: add_deal_status
Create Date: 2026-10-29 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'add_dispatch'
down_revision: Union[str, Sequence[str], None] = 'add_deal_status'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('payload_capacity_tons', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('verification_reason', sa.String(length=500), nullable=True))
        batch_op.add_column(sa.Column('is_online', sa.Boolean(), nullable=False, server_default=sa.false()))
        batch_op.add_column(sa.Column('latitude', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('longitude', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('location_updated_at', sa.DateTime(timezone=True), nullable=True))

    with op.batch_alter_table('merchants') as batch_op:
        batch_op.add_column(sa.Column('latitude', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('longitude', sa.Float(), nullable=True))

    with op.batch_alter_table('delivery_trips') as batch_op:
        batch_op.add_column(sa.Column('pickup_lat', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('pickup_lng', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('drop_lat', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('drop_lng', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('dispatch_status', sa.String(length=20), nullable=False, server_default='searching'))

    op.create_table(
        'dispatch_offers',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('trip_id', sa.String(length=50), sa.ForeignKey('delivery_trips.id'), nullable=False),
        sa.Column('driver_id', sa.String(length=50), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('distance_km', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('responded_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_dispatch_offers_trip_id', 'dispatch_offers', ['trip_id'])
    op.create_index('ix_dispatch_offers_driver_id', 'dispatch_offers', ['driver_id'])
    op.create_index('ix_dispatch_offers_status', 'dispatch_offers', ['status'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_dispatch_offers_status', table_name='dispatch_offers')
    op.drop_index('ix_dispatch_offers_driver_id', table_name='dispatch_offers')
    op.drop_index('ix_dispatch_offers_trip_id', table_name='dispatch_offers')
    op.drop_table('dispatch_offers')
    with op.batch_alter_table('delivery_trips') as batch_op:
        for col in ('dispatch_status', 'drop_lng', 'drop_lat', 'pickup_lng', 'pickup_lat'):
            batch_op.drop_column(col)
    with op.batch_alter_table('merchants') as batch_op:
        batch_op.drop_column('longitude')
        batch_op.drop_column('latitude')
    with op.batch_alter_table('users') as batch_op:
        for col in ('location_updated_at', 'longitude', 'latitude', 'is_online',
                    'verification_reason', 'payload_capacity_tons'):
            batch_op.drop_column(col)
