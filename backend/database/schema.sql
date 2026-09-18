-- =====================================================================
-- SRAds Database Schema
-- GPS-based Digital Advertisement Platform
-- PostgreSQL 13+ | MVP scale (10-20 devices)
-- =====================================================================
-- NOTE ON CORRECTIONS FROM PREVIOUS VERSION:
-- 1) Fixed a fatal ordering bug: devices.last_ad_id referenced ads(id)
--    but the ads table was created AFTER devices, which would fail on
--    execution. Tables are now created in correct dependency order:
--    users -> advertisers -> media -> ads -> devices -> ...
-- 2) Added advertisers.latitude/longitude (present in original spec,
--    missing from previous schema).
-- 3) Added a handful of missing indexes (campaign_ads, ads status,
--    notifications) and small sanity CHECK constraints (battery_level,
--    lat/long ranges) without changing any table/column names.
-- 4) All table names, column names, and relationships are preserved
--    exactly as in your existing schema for backend compatibility.
-- =====================================================================

-- Drop tables if they exist (for clean setup) - reverse dependency order
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS playback_logs CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS driver_daily_stats CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS device_status_history CASCADE;
DROP TABLE IF EXISTS device_location_history CASCADE;
DROP TABLE IF EXISTS campaign_devices CASCADE;
DROP TABLE IF EXISTS campaign_ads CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS device_registration CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS ads CASCADE;
DROP TABLE IF EXISTS media CASCADE;

DROP TABLE IF EXISTS advertisers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================================
-- 1. USERS Table
-- =====================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Super Admin', 'Operator')),
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 2. ADVERTISERS Table
-- =====================================================================
CREATE TABLE advertisers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    gst VARCHAR(50),
    address TEXT,
    area VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    business_type VARCHAR(100) DEFAULT 'General',
    latitude DECIMAL(10, 8) CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(11, 8) CHECK (longitude BETWEEN -180 AND 180),
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    password_hash VARCHAR(255),
    wallet_balance DECIMAL(15, 2) DEFAULT 0 CHECK (wallet_balance >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 4. MEDIA Table
-- =====================================================================
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video')),
    duration INTEGER DEFAULT 15 CHECK (duration > 0), -- in seconds
    resolution VARCHAR(50),
    size BIGINT CHECK (size >= 0), -- in bytes
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    advertiser_id INTEGER REFERENCES advertisers(id) ON DELETE CASCADE,
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 5. ADS Table
-- =====================================================================
CREATE TABLE ads (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    advertiser_id INTEGER REFERENCES advertisers(id) ON DELETE CASCADE,
    media_id INTEGER REFERENCES media(id) ON DELETE CASCADE,
    category VARCHAR(100),
    ad_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL' CHECK (ad_type IN ('GENERAL', 'CAMPAIGN')),
    play_duration INTEGER NOT NULL DEFAULT 15 CHECK (play_duration > 0), -- in seconds
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Deleted')),
    approval_status VARCHAR(50) DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected', 'Budget Exhausted')),
    budget DECIMAL(15, 2) DEFAULT 0 CHECK (budget >= 0),
    remaining_budget DECIMAL(15, 2) DEFAULT 0 CHECK (remaining_budget >= 0),
    cost_per_play DECIMAL(15, 2) DEFAULT 1 CHECK (cost_per_play >= 0),
    total_plays INTEGER DEFAULT 0 CHECK (total_plays >= 0),
    total_spend DECIMAL(15, 2) DEFAULT 0 CHECK (total_spend >= 0),
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 5B. WALLET_TRANSACTIONS Table
-- =====================================================================
CREATE TABLE wallet_transactions (
    id SERIAL PRIMARY KEY,
    advertiser_id INTEGER REFERENCES advertisers(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Credit', 'Debit')),
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 6. DEVICES Table
-- (current_campaign intentionally omitted - campaign is resolved
--  dynamically at runtime from GPS + active campaigns, never stored)
-- =====================================================================
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    adsd_id VARCHAR(100) UNIQUE NOT NULL,
    serial_number VARCHAR(100),
    device_name VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('Auto', 'BRTS')),
    vehicle_number VARCHAR(50),
    installation_date DATE,

    status VARCHAR(50) NOT NULL DEFAULT 'Offline' CHECK (status IN ('Online', 'Offline', 'Disabled')),
    last_seen TIMESTAMP,
    heartbeat_at TIMESTAMP,
    last_ad_id INTEGER REFERENCES ads(id) ON DELETE SET NULL,
    latitude DECIMAL(10, 8) CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(11, 8) CHECK (longitude BETWEEN -180 AND 180),
    gps_status VARCHAR(50) DEFAULT 'Unknown' CHECK (gps_status IN ('Active', 'Inactive', 'Unknown')),
    internet_status VARCHAR(50) DEFAULT 'Unknown' CHECK (internet_status IN ('Connected', 'Disconnected', 'Unknown')),
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    total_distance_km DECIMAL(15, 2) DEFAULT 0 CHECK (total_distance_km >= 0),
    today_distance_km DECIMAL(10, 2) DEFAULT 0 CHECK (today_distance_km >= 0),
    last_distance_update DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 7. DEVICE_REGISTRATION Table
-- =====================================================================
CREATE TABLE device_registration (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,

    activation_key VARCHAR(100) UNIQUE NOT NULL,
    activation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_by VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    area VARCHAR(255),
    installation_status VARCHAR(50) DEFAULT 'Pending' CHECK (installation_status IN ('Installed Successfully', 'Pending', 'Failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 8. CAMPAIGNS Table
-- (area owns the location for campaign matching; ads never store area)
-- =====================================================================
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    advertiser_id INTEGER REFERENCES advertisers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 10),
    budget DECIMAL(15, 2) CHECK (budget >= 0),
    area VARCHAR(255), -- Geographic area for this campaign
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Stopped', 'Completed')),
    approval_status VARCHAR(50) DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    daily_budget DECIMAL(15, 2) CHECK (daily_budget >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_campaign_dates CHECK (end_date >= start_date)
);

-- =====================================================================
-- 9. CAMPAIGN_ADS Table (Many-to-Many)
-- =====================================================================
CREATE TABLE campaign_ads (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    ad_id INTEGER REFERENCES ads(id) ON DELETE CASCADE,
    play_order INTEGER NOT NULL CHECK (play_order >= 0),
    duration INTEGER NOT NULL CHECK (duration > 0), -- override duration if needed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, ad_id)
);

-- =====================================================================
-- 10. CAMPAIGN_DEVICES Table (Many-to-Many)
-- Reporting / future use ONLY - NOT used for ad selection at runtime
-- =====================================================================
CREATE TABLE campaign_devices (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, device_id)
);

-- =====================================================================
-- 11. DEVICE_LOCATION_HISTORY Table
-- =====================================================================
CREATE TABLE device_location_history (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(11, 8) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    speed DECIMAL(10, 2) CHECK (speed >= 0),
    distance_from_previous DECIMAL(10, 4) DEFAULT 0,
    is_gps_jump BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 12. DEVICE_STATUS_HISTORY Table
-- =====================================================================
CREATE TABLE device_status_history (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    internet VARCHAR(50) CHECK (internet IN ('Connected', 'Disconnected', 'Unknown')),
    gps VARCHAR(50) CHECK (gps IN ('Active', 'Inactive', 'Unknown')),
    status VARCHAR(50) CHECK (status IN ('Online', 'Offline', 'Disabled')),
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 13. PLAYBACK_LOGS Table
-- =====================================================================
CREATE TABLE playback_logs (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    ad_id INTEGER REFERENCES ads(id) ON DELETE SET NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER NOT NULL CHECK (duration > 0)
);

-- =====================================================================
-- 14. NOTIFICATIONS Table
-- =====================================================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Info', 'Warning', 'Error', 'Success')),
    status VARCHAR(50) DEFAULT 'Unread' CHECK (status IN ('Read', 'Unread')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 15. ADMIN_LOGS Table
-- =====================================================================
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 16. DRIVERS Table
-- =====================================================================
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('Auto', 'BRTS')),
    vehicle_number VARCHAR(50) NOT NULL,
    device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_id)
);

-- =====================================================================
-- 17. DRIVER_DAILY_STATS Table
-- =====================================================================
CREATE TABLE driver_daily_stats (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    distance_km DECIMAL(10, 2) DEFAULT 0 CHECK (distance_km >= 0),
    active_minutes INTEGER DEFAULT 0 CHECK (active_minutes >= 0),
    income DECIMAL(15, 2) DEFAULT 0 CHECK (income >= 0),
    ads_played INTEGER DEFAULT 0 CHECK (ads_played >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(driver_id, date)
);

-- =====================================================================
-- 18. SETTINGS Table
-- =====================================================================
CREATE TABLE settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- INDEXES
-- =====================================================================
CREATE INDEX idx_devices_adsd_id ON devices(adsd_id);
CREATE INDEX idx_devices_status ON devices(status);


CREATE INDEX idx_advertisers_status ON advertisers(status);

CREATE INDEX idx_ads_advertiser_id ON ads(advertiser_id);
CREATE INDEX idx_ads_media_id ON ads(media_id);
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_ad_type ON ads(ad_type);

CREATE INDEX idx_campaigns_advertiser_id ON campaigns(advertiser_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_area ON campaigns(area);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

CREATE INDEX idx_campaign_ads_campaign_id ON campaign_ads(campaign_id);
CREATE INDEX idx_campaign_ads_ad_id ON campaign_ads(ad_id);

CREATE INDEX idx_device_location_history_device_id ON device_location_history(device_id);
CREATE INDEX idx_device_location_history_recorded_at ON device_location_history(recorded_at);

CREATE INDEX idx_device_status_history_device_id ON device_status_history(device_id);
CREATE INDEX idx_device_status_history_recorded_at ON device_status_history(recorded_at);

CREATE INDEX idx_playback_logs_device_id ON playback_logs(device_id);
CREATE INDEX idx_playback_logs_played_at ON playback_logs(played_at);
CREATE INDEX idx_playback_logs_campaign_id ON playback_logs(campaign_id);

CREATE INDEX idx_notifications_status ON notifications(status);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);

-- =====================================================================
-- DEFAULT SUPER ADMIN USER
-- =====================================================================
INSERT INTO users (name, email, password_hash, role, status)
VALUES ('Super Admin', 'admin@srads.com', '$2a$10$mHlPTS53dI3yJRKNajea1uqJsuPOIP4ZUxQimKIC2ujRKH.z2JFqq', 'Super Admin', 'Active');

-- =====================================================================
-- DEFAULT SETTINGS
-- =====================================================================
INSERT INTO settings (key, value) VALUES 
('earning_rate_per_km', '4.00'::jsonb),
('earning_rate_per_hour', '15.00'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- =====================================================================
-- 19. AD_DAILY_STATS Table
-- =====================================================================
CREATE TABLE ad_daily_stats (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER REFERENCES ads(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    distance_km DECIMAL(15, 4) DEFAULT 0 CHECK (distance_km >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ad_id, date)
);

-- =====================================================================
-- 20. DRIVER_PAYMENT_METHODS Table
-- =====================================================================
CREATE TABLE driver_payment_methods (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    account_holder VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    ifsc VARCHAR(50) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    branch VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'Pending Verification' CHECK (status IN ('Verified', 'Pending Verification', 'Rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);