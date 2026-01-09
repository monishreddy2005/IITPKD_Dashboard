-- Fix for uba_events upload issue
-- The created_at column needs a default value so it can be omitted from CSV uploads

DO $$
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'uba_events') THEN
        -- Check if column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'uba_events' AND column_name = 'created_at') THEN
            -- Alter the column to have a default value
            ALTER TABLE uba_events ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;
END $$;
