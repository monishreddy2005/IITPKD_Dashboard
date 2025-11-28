-- Migration: Add 'Transgender' to emp_gender enum
-- This migration adds 'Transgender' as a valid value to the emp_gender enum type
-- Run this if your database already exists and you need to update the enum

-- Note: ALTER TYPE ... ADD VALUE can only be executed in a transaction
-- and the new value cannot be used in the same transaction
DO $$
BEGIN
    -- Check if 'Transgender' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'Transgender' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'emp_gender')
    ) THEN
        -- Add 'Transgender' to the enum
        ALTER TYPE emp_gender ADD VALUE 'Transgender';
    END IF;
END $$;

