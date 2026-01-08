-- ======================
-- ENUM: event_type
-- ======================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'event_type'
    ) THEN
        CREATE TYPE event_type AS ENUM (
            'Workshop',
            'Seminar',
            'Industrial Talk',
            'Networking Event',
            'Industry Visit',
            'Panel Discussion',
            'Conference',
            'Training Program',
            'Hackathon',
            'Other'
        );
    END IF;
END $$;

-- ======================
-- TABLE: industry_events
-- ======================

CREATE TABLE IF NOT EXISTS industry_events (
    event_id SERIAL PRIMARY KEY,
    event_title VARCHAR(250) NOT NULL,
    event_type event_type NOT NULL,
    event_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_title, event_date)
);
