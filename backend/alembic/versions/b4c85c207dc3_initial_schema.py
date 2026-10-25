"""initial_schema

Revision ID: b4c85c207dc3
Revises: 
Create Date: 2026-10-18 22:50:58.451717

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b4c85c207dc3'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

user_role_enum = sa.Enum('BUYER', 'VENDOR', 'DRIVER', 'ADMIN', name='userrole', create_type=False)
order_status_enum = sa.Enum('PENDING', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', name='orderstatus', create_type=False)
trip_status_enum = sa.Enum('UNASSIGNED', 'ASSIGNED', 'ACCEPTED', 'ARRIVED_AT_STORE', 'LOADED', 'IN_TRANSIT', 'ARRIVED_AT_SITE', 'UNLOADED_COMPLETED', name='tripstatus', create_type=False)


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("DO $$ BEGIN CREATE TYPE userrole AS ENUM ('BUYER', 'VENDOR', 'DRIVER', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
        op.execute("DO $$ BEGIN CREATE TYPE orderstatus AS ENUM ('PENDING', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
        op.execute("DO $$ BEGIN CREATE TYPE tripstatus AS ENUM ('UNASSIGNED', 'ASSIGNED', 'ACCEPTED', 'ARRIVED_AT_STORE', 'LOADED', 'IN_TRANSIT', 'ARRIVED_AT_SITE', 'UNLOADED_COMPLETED'); EXCEPTION WHEN duplicate_object THEN null; END $$;")

    op.create_table('categories',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('title', sa.String(length=100), nullable=False),
    sa.Column('subtitle', sa.String(length=200), nullable=False),
    sa.Column('icon_name', sa.String(length=50), nullable=False),
    sa.Column('color_bg', sa.String(length=50), nullable=True),
    sa.Column('item_count', sa.Integer(), nullable=True),
    sa.Column('trending_badge', sa.String(length=50), nullable=True),
    sa.Column('image', sa.String(length=255), nullable=False),
    sa.Column('subcategories', sa.JSON(), nullable=True),
    sa.Column('featured_brands', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('categories', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_categories_id'), ['id'], unique=False)

    op.create_table('commodity_rates',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('material_name', sa.String(length=100), nullable=False),
    sa.Column('unit', sa.String(length=50), nullable=False),
    sa.Column('wholesale_rate', sa.Float(), nullable=False),
    sa.Column('prev_rate', sa.Float(), nullable=False),
    sa.Column('trend', sa.String(length=20), nullable=True),
    sa.Column('change_percent', sa.Float(), nullable=True),
    sa.Column('last_updated', sa.String(length=50), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('commodity_rates', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_commodity_rates_id'), ['id'], unique=False)

    op.create_table('deals',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('material', sa.String(length=150), nullable=False),
    sa.Column('brand', sa.String(length=100), nullable=False),
    sa.Column('image', sa.String(length=255), nullable=False),
    sa.Column('original_rate', sa.Float(), nullable=False),
    sa.Column('deal_rate', sa.Float(), nullable=False),
    sa.Column('unit', sa.String(length=50), nullable=False),
    sa.Column('discount_pct', sa.Integer(), nullable=True),
    sa.Column('min_order', sa.String(length=100), nullable=True),
    sa.Column('badge', sa.String(length=50), nullable=True),
    sa.Column('badge_color', sa.String(length=50), nullable=True),
    sa.Column('expires_in_seconds', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('deals', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_deals_id'), ['id'], unique=False)

    op.create_table('merchants',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('name', sa.String(length=150), nullable=False),
    sa.Column('owner_name', sa.String(length=100), nullable=False),
    sa.Column('phone', sa.String(length=20), nullable=False),
    sa.Column('email', sa.String(length=100), nullable=True),
    sa.Column('address', sa.String(length=255), nullable=False),
    sa.Column('pincode', sa.String(length=10), nullable=False),
    sa.Column('verified', sa.Boolean(), nullable=True),
    sa.Column('rating', sa.Float(), nullable=True),
    sa.Column('reviews_count', sa.Integer(), nullable=True),
    sa.Column('distance_km', sa.Float(), nullable=True),
    sa.Column('delivery_eta_minutes', sa.Integer(), nullable=True),
    sa.Column('min_order_value', sa.Integer(), nullable=True),
    sa.Column('main_category', sa.String(length=100), nullable=True),
    sa.Column('brands', sa.JSON(), nullable=True),
    sa.Column('is_online', sa.Boolean(), nullable=True),
    sa.Column('avatar_url', sa.String(length=255), nullable=True),
    sa.Column('gstin', sa.String(length=50), nullable=True),
    sa.Column('bank_account', sa.String(length=50), nullable=True),
    sa.Column('wallet_balance', sa.Float(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('merchants', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_merchants_id'), ['id'], unique=False)

    op.create_table('users',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('email', sa.String(length=100), nullable=False),
    sa.Column('phone', sa.String(length=20), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('hashed_password', sa.String(length=255), nullable=False),
    sa.Column('role', user_role_enum, nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('is_verified', sa.Boolean(), nullable=True),
    sa.Column('saved_addresses', sa.JSON(), nullable=True),
    sa.Column('merchant_id', sa.String(length=50), nullable=True),
    sa.Column('driver_license', sa.String(length=50), nullable=True),
    sa.Column('vehicle_type', sa.String(length=50), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_users_email'), ['email'], unique=True)
        batch_op.create_index(batch_op.f('ix_users_id'), ['id'], unique=False)
        batch_op.create_index(batch_op.f('ix_users_phone'), ['phone'], unique=True)

    op.create_table('boq_quotes',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('user_id', sa.String(length=50), nullable=False),
    sa.Column('project_name', sa.String(length=150), nullable=False),
    sa.Column('delivery_pincode', sa.String(length=10), nullable=False),
    sa.Column('site_address', sa.String(length=255), nullable=False),
    sa.Column('file_url', sa.String(length=255), nullable=True),
    sa.Column('raw_materials_text', sa.String(length=1000), nullable=True),
    sa.Column('parsed_items', sa.JSON(), nullable=True),
    sa.Column('estimated_total', sa.Float(), nullable=True),
    sa.Column('status', sa.String(length=50), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('boq_quotes', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_boq_quotes_id'), ['id'], unique=False)
        batch_op.create_index(batch_op.f('ix_boq_quotes_user_id'), ['user_id'], unique=False)

    op.create_table('orders',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('user_id', sa.String(length=50), nullable=False),
    sa.Column('merchant_id', sa.String(length=50), nullable=False),
    sa.Column('items_total', sa.Float(), nullable=False),
    sa.Column('delivery_fee', sa.Float(), nullable=True),
    sa.Column('gst_amount', sa.Float(), nullable=True),
    sa.Column('grand_total', sa.Float(), nullable=False),
    sa.Column('total_weight_kg', sa.Float(), nullable=True),
    sa.Column('vehicle_recommended', sa.String(length=50), nullable=True),
    sa.Column('delivery_address', sa.String(length=255), nullable=False),
    sa.Column('pincode', sa.String(length=10), nullable=False),
    sa.Column('site_constraints', sa.JSON(), nullable=True),
    sa.Column('status', order_status_enum, nullable=True),
    sa.Column('payment_mode', sa.String(length=50), nullable=True),
    sa.Column('invoice_number', sa.String(length=50), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['merchant_id'], ['merchants.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('invoice_number')
    )
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_orders_id'), ['id'], unique=False)
        batch_op.create_index(batch_op.f('ix_orders_merchant_id'), ['merchant_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_orders_user_id'), ['user_id'], unique=False)

    op.create_table('products',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('category', sa.String(length=50), nullable=False),
    sa.Column('brand', sa.String(length=100), nullable=False),
    sa.Column('price', sa.Float(), nullable=False),
    sa.Column('unit', sa.String(length=50), nullable=False),
    sa.Column('moq', sa.Integer(), nullable=True),
    sa.Column('weight_spec', sa.String(length=50), nullable=True),
    sa.Column('image', sa.String(length=255), nullable=False),
    sa.Column('grade', sa.String(length=50), nullable=True),
    sa.Column('gauge', sa.String(length=50), nullable=True),
    sa.Column('weight_kg', sa.Float(), nullable=True),
    sa.Column('stock_qty', sa.Integer(), nullable=True),
    sa.Column('merchant_id', sa.String(length=50), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['category'], ['categories.id'], ),
    sa.ForeignKeyConstraint(['merchant_id'], ['merchants.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_products_brand'), ['brand'], unique=False)
        batch_op.create_index(batch_op.f('ix_products_category'), ['category'], unique=False)
        batch_op.create_index(batch_op.f('ix_products_id'), ['id'], unique=False)
        batch_op.create_index(batch_op.f('ix_products_title'), ['title'], unique=False)

    op.create_table('delivery_trips',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('order_id', sa.String(length=50), nullable=False),
    sa.Column('driver_id', sa.String(length=50), nullable=True),
    sa.Column('vehicle_type', sa.String(length=50), nullable=True),
    sa.Column('vehicle_reg_number', sa.String(length=20), nullable=True),
    sa.Column('pickup_address', sa.String(length=255), nullable=False),
    sa.Column('drop_address', sa.String(length=255), nullable=False),
    sa.Column('distance_km', sa.Float(), nullable=True),
    sa.Column('trip_fare', sa.Float(), nullable=True),
    sa.Column('tip_amount', sa.Float(), nullable=True),
    sa.Column('status', trip_status_enum, nullable=True),
    sa.Column('current_gps', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['driver_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('order_id')
    )
    with op.batch_alter_table('delivery_trips', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_delivery_trips_driver_id'), ['driver_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_delivery_trips_id'), ['id'], unique=False)

    op.create_table('order_items',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('order_id', sa.String(length=50), nullable=False),
    sa.Column('product_id', sa.String(length=50), nullable=False),
    sa.Column('product_title', sa.String(length=200), nullable=False),
    sa.Column('unit_price', sa.Float(), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('unit', sa.String(length=50), nullable=False),
    sa.Column('weight_kg', sa.Float(), nullable=True),
    sa.Column('subtotal', sa.Float(), nullable=False),
    sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('order_items', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_order_items_id'), ['id'], unique=False)
        batch_op.create_index(batch_op.f('ix_order_items_order_id'), ['order_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('order_items', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_order_items_order_id'))
        batch_op.drop_index(batch_op.f('ix_order_items_id'))

    op.drop_table('order_items')
    with op.batch_alter_table('delivery_trips', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_delivery_trips_id'))
        batch_op.drop_index(batch_op.f('ix_delivery_trips_driver_id'))

    op.drop_table('delivery_trips')
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_products_title'))
        batch_op.drop_index(batch_op.f('ix_products_id'))
        batch_op.drop_index(batch_op.f('ix_products_category'))
        batch_op.drop_index(batch_op.f('ix_products_brand'))

    op.drop_table('products')
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_orders_user_id'))
        batch_op.drop_index(batch_op.f('ix_orders_merchant_id'))
        batch_op.drop_index(batch_op.f('ix_orders_id'))

    op.drop_table('orders')
    with op.batch_alter_table('boq_quotes', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_boq_quotes_user_id'))
        batch_op.drop_index(batch_op.f('ix_boq_quotes_id'))

    op.drop_table('boq_quotes')
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_users_phone'))
        batch_op.drop_index(batch_op.f('ix_users_id'))
        batch_op.drop_index(batch_op.f('ix_users_email'))

    op.drop_table('users')
    with op.batch_alter_table('merchants', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_merchants_id'))

    op.drop_table('merchants')
    with op.batch_alter_table('deals', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_deals_id'))

    op.drop_table('deals')
    with op.batch_alter_table('commodity_rates', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_commodity_rates_id'))

    op.drop_table('commodity_rates')
    with op.batch_alter_table('categories', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_categories_id'))

    op.drop_table('categories')
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        trip_status_enum.drop(bind, checkfirst=True)
        order_status_enum.drop(bind, checkfirst=True)
        user_role_enum.drop(bind, checkfirst=True)
