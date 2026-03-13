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

CREATE TABLE industry_events (
    project_id INT PRIMARY KEY,
    event_name VARCHAR(200) NOT NULL,
    date_of_event DATE,
    event_type VARCHAR(100),
    target_audience VARCHAR(150),
    hosted_by VARCHAR(150),
    funding_by VARCHAR(100),
    amount NUMERIC(12,2),
    year INT
);

-- ======================
-- TABLE: icsr_csr
-- ======================
CREATE TABLE icsr_csr (
    csr_id INT PRIMARY KEY,
    csr_organisation VARCHAR(200) NOT NULL,
    year INT,
    type_of_company VARCHAR(100),
    type_of_support VARCHAR(100),
    amount_given NUMERIC(15,2)
);