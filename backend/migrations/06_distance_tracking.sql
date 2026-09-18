-- Migration: 06_distance_tracking.sql
-- Description: Adds columns to devices and device_location_history for distance tracking, and creates ad_daily_stats.

ALTER TABLE devices 
    ADD COLUMN IF NOT EXISTS total_distance_km DECIMAL(15, 2) DEFAULT 0 CHECK (total_distance_km >= 0),
    ADD COLUMN IF NOT EXISTS today_distance_km DECIMAL(10, 2) DEFAULT 0 CHECK (today_distance_km >= 0),
    ADD COLUMN IF NOT EXISTS last_distance_update DATE;

ALTER TABLE device_location_history
    ADD COLUMN IF NOT EXISTS distance_from_previous DECIMAL(10, 4) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_gps_jump BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS ad_daily_stats (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER REFERENCES ads(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    distance_km DECIMAL(15, 4) DEFAULT 0 CHECK (distance_km >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ad_id, date)
);
