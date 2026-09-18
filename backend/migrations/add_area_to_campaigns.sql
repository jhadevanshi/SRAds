-- Add area column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS area VARCHAR(255);
