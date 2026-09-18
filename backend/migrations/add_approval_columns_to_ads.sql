-- Migration: add_approval_columns_to_ads.sql
-- Description: Adds tracking columns for the ad approval workflow (approved_by, approved_at, rejection_reason).

ALTER TABLE ads 
  ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
