-- Migration: Add order_type and upgrade tracking fields to orders table
-- Date: 2025-10-13
-- Description: Adds support for PLAN_UPGRADE order types and tracking

-- Step 1: Add order_type enum column
ALTER TABLE orders
ADD COLUMN order_type ENUM('NEW_PURCHASE', 'PLAN_UPGRADE', 'PLAN_RENEWAL', 'PLAN_DOWNGRADE')
DEFAULT 'NEW_PURCHASE' NOT NULL
AFTER order_number;

-- Step 2: Add upgraded_invitation_id column
ALTER TABLE orders
ADD COLUMN upgraded_invitation_id INT NULL
AFTER order_type;

-- Step 3: Add previous_plan_id column
ALTER TABLE orders
ADD COLUMN previous_plan_id INT NULL
AFTER upgraded_invitation_id;

-- Step 4: Add foreign key constraints
ALTER TABLE orders
ADD CONSTRAINT fk_orders_upgraded_invitation
FOREIGN KEY (upgraded_invitation_id) REFERENCES invitations(id)
ON DELETE SET NULL;

ALTER TABLE orders
ADD CONSTRAINT fk_orders_previous_plan
FOREIGN KEY (previous_plan_id) REFERENCES plans(id)
ON DELETE SET NULL;

-- Step 5: Create indexes for faster queries
CREATE INDEX idx_orders_order_type ON orders(order_type);
CREATE INDEX idx_orders_upgraded_invitation ON orders(upgraded_invitation_id);
