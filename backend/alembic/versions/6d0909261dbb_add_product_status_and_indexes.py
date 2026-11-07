from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '6d0909261dbb'
down_revision: Union[str, Sequence[str], None] = 'add_driver_vehicle_reg'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(op.f('ix_deals_status'), 'deals', ['status'], unique=False)
    op.create_index(op.f('ix_dispatch_offers_id'), 'dispatch_offers', ['id'], unique=False)
    op.add_column('products', sa.Column('status', sa.String(length=20), nullable=False, server_default='approved'))
    op.add_column('products', sa.Column('rejection_reason', sa.String(length=500), nullable=True))
    op.create_index(op.f('ix_products_status'), 'products', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_products_status'), table_name='products')
    op.drop_column('products', 'rejection_reason')
    op.drop_column('products', 'status')
    op.drop_index(op.f('ix_dispatch_offers_id'), table_name='dispatch_offers')
    op.drop_index(op.f('ix_deals_status'), table_name='deals')
