from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'e6382cf823eb'
down_revision: Union[str, Sequence[str], None] = '6d0909261dbb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('merchants', sa.Column('pan_number', sa.String(length=50), nullable=True))
    op.add_column('merchants', sa.Column('trade_license', sa.String(length=100), nullable=True))
    op.add_column('merchants', sa.Column('proof_documents', sa.JSON(), nullable=True))
    op.add_column('users', sa.Column('proof_documents', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'proof_documents')
    op.drop_column('merchants', 'proof_documents')
    op.drop_column('merchants', 'trade_license')
    op.drop_column('merchants', 'pan_number')
