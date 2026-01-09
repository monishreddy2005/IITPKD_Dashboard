-- Migration: Add missing columns to open_house table
-- This migration adds the columns that are expected by the backend code but missing from the schema

-- Add theme column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'open_house' AND column_name = 'theme'
    ) THEN
        ALTER TABLE open_house ADD COLUMN theme VARCHAR(255);
    END IF;
END $$;

-- Add target_audience column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'open_house' AND column_name = 'target_audience'
    ) THEN
        ALTER TABLE open_house ADD COLUMN target_audience VARCHAR(255);
    END IF;
END $$;

-- Add departments_participated column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'open_house' AND column_name = 'departments_participated'
    ) THEN
        ALTER TABLE open_house ADD COLUMN departments_participated TEXT;
    END IF;
END $$;

-- Add num_departments column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'open_house' AND column_name = 'num_departments'
    ) THEN
        ALTER TABLE open_house ADD COLUMN num_departments INT;
    END IF;
END $$;

-- Add total_visitors column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'open_house' AND column_name = 'total_visitors'
    ) THEN
        ALTER TABLE open_house ADD COLUMN total_visitors INT;
    END IF;
END $$;

-- Add key_highlights column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'open_house' AND column_name = 'key_highlights'
    ) THEN
        ALTER TABLE open_house ADD COLUMN key_highlights TEXT;
    END IF;
END $$;

-- Add photos_url column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'open_house' AND column_name = 'photos_url'
    ) THEN
        ALTER TABLE open_house ADD COLUMN photos_url TEXT;
    END IF;
END $$;

-- Add poster_url column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'open_house' AND column_name = 'poster_url'
    ) THEN
        ALTER TABLE open_house ADD COLUMN poster_url TEXT;
    END IF;
END $$;

-- Add brochure_url column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'open_house' AND column_name = 'brochure_url'
    ) THEN
        ALTER TABLE open_house ADD COLUMN brochure_url TEXT;
    END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'open_house_event_year_event_date_key'
    ) THEN
        ALTER TABLE open_house ADD CONSTRAINT open_house_event_year_event_date_key 
        UNIQUE(event_year, event_date);
    END IF;
END $$;

