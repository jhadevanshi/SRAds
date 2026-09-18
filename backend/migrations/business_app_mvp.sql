-- Migration: Add Business App requirements

-- 1. Add password_hash and wallet_balance to advertisers
ALTER TABLE advertisers 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(15, 2) DEFAULT 0 CHECK (wallet_balance >= 0);

-- 2. Add billing fields to ads
ALTER TABLE ads
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
ADD COLUMN IF NOT EXISTS budget DECIMAL(15, 2) DEFAULT 0 CHECK (budget >= 0),
ADD COLUMN IF NOT EXISTS remaining_budget DECIMAL(15, 2) DEFAULT 0 CHECK (remaining_budget >= 0),
ADD COLUMN IF NOT EXISTS cost_per_play DECIMAL(15, 2) DEFAULT 1 CHECK (cost_per_play >= 0),
ADD COLUMN IF NOT EXISTS total_plays INTEGER DEFAULT 0 CHECK (total_plays >= 0),
ADD COLUMN IF NOT EXISTS total_spend DECIMAL(15, 2) DEFAULT 0 CHECK (total_spend >= 0);

-- Update existing ads to be approved so we don't break existing displays
UPDATE ads SET approval_status = 'Approved' WHERE approval_status = 'Pending';

-- 3. Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    advertiser_id INTEGER REFERENCES advertisers(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Credit', 'Debit')),
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
