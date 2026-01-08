-- ======================
-- ENUM: startup_status_type
-- ======================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'startup_status_type'
    ) THEN
        CREATE TYPE startup_status_type AS ENUM (
            'Active',
            'Graduated',
            'Inactive'
        );
    END IF;
END $$;

-- ======================
-- ENUM: innovation_project_type
-- ======================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'innovation_project_type'
    ) THEN
        CREATE TYPE innovation_project_type AS ENUM (
            'Funded',
            'Mentored'
        );
    END IF;
END $$;

-- ======================
-- TABLE: startups
-- ======================

CREATE TABLE IF NOT EXISTS startups (
    startup_id SERIAL PRIMARY KEY,
    startup_name VARCHAR(200) NOT NULL,
    year_of_incubation INT NOT NULL,
    status startup_status_type DEFAULT 'Active',
    UNIQUE (startup_name, year_of_incubation)
);
