-- Migration: Add approval workflow to campaigns and ads
-- Safe to run multiple times (uses IF NOT EXISTS or exception handling)

-- 1. ADD COLUMNS TO ADS TABLE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'approved_by') THEN
        ALTER TABLE ads ADD COLUMN approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'approved_at') THEN
        ALTER TABLE ads ADD COLUMN approved_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'rejection_reason') THEN
        ALTER TABLE ads ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;

-- 2. ADD COLUMNS TO CAMPAIGNS TABLE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'approval_status') THEN
        -- Default existing campaigns to Approved to prevent breaking Display App
        ALTER TABLE campaigns ADD COLUMN approval_status VARCHAR(50) DEFAULT 'Approved' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected'));
        
        -- After adding, change the default for new rows to 'Pending'
        ALTER TABLE campaigns ALTER COLUMN approval_status SET DEFAULT 'Pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'approved_by') THEN
        ALTER TABLE campaigns ADD COLUMN approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'approved_at') THEN
        ALTER TABLE campaigns ADD COLUMN approved_at TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'rejection_reason') THEN
        ALTER TABLE campaigns ADD COLUMN rejection_reason TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'daily_budget') THEN
        ALTER TABLE campaigns ADD COLUMN daily_budget DECIMAL(15, 2) CHECK (daily_budget >= 0);
    END IF;
END $$;

-- 3. ADD COLUMNS TO MEDIA TABLE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'advertiser_id') THEN
        ALTER TABLE media ADD COLUMN advertiser_id INTEGER REFERENCES advertisers(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE media ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;
