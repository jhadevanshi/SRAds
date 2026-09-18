-- =====================================================================
-- SRAds Driver Module & Settings Schema Updates
-- Run this script in your PostgreSQL database
-- =====================================================================

-- 1. SETTINGS Table (For configurable earning rates)
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default earning rates (e.g. Rs 4/km, Rs 15/hr)
INSERT INTO settings (key, value) VALUES 
('earning_rate_per_km', '4.00'::jsonb),
('earning_rate_per_hour', '15.00'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. DRIVERS Table
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('Auto', 'BRTS')),
    vehicle_number VARCHAR(50) NOT NULL,
    device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_id) -- One device can only be assigned to one driver
);

-- 3. DRIVER_DAILY_STATS Table
CREATE TABLE IF NOT EXISTS driver_daily_stats (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    distance_km DECIMAL(10, 2) DEFAULT 0 CHECK (distance_km >= 0),
    active_minutes INTEGER DEFAULT 0 CHECK (active_minutes >= 0),
    income DECIMAL(15, 2) DEFAULT 0 CHECK (income >= 0),
    ads_played INTEGER DEFAULT 0 CHECK (ads_played >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(driver_id, date) -- One row per driver per day
);

-- 4. UPDATE DEVICES VEHICLE_TYPE CONSTRAINT
-- First, update any existing devices that have old vehicle types to 'Auto'
UPDATE devices 
SET vehicle_type = 'Auto' 
WHERE vehicle_type NOT IN ('Auto', 'BRTS');

-- Drop the old constraint. PostgreSQL usually names inline checks as tablename_columnname_check
ALTER TABLE devices DROP CONSTRAINT IF EXISTS devices_vehicle_type_check;

-- Add the new strict constraint
ALTER TABLE devices ADD CONSTRAINT devices_vehicle_type_check 
CHECK (vehicle_type IN ('Auto', 'BRTS'));

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_driver_stats_driver_date ON driver_daily_stats(driver_id, date);
CREATE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone);
