-- Migration: add area column to advertisers table
-- Run this once against your existing database.

ALTER TABLE advertisers
  ADD COLUMN IF NOT EXISTS area VARCHAR(255);
