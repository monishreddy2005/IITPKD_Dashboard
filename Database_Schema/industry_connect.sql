-- Industry Connect Module
-- ICSR Section and Industry-Academia Conclave Coordinator

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

-- ICSR Section: Industry Interaction Events
CREATE TABLE industry_events (
    event_id SERIAL PRIMARY KEY,
    event_title VARCHAR(250) NOT NULL,
    event_type event_type NOT NULL,
    industry_partner VARCHAR(200),
    event_date DATE NOT NULL,
    duration_hours DECIMAL(4, 2),
    department VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_title, event_date)  -- Prevent duplicate events on same date
);

-- Industry-Academia Conclave
CREATE TABLE industry_conclave (
    conclave_id SERIAL PRIMARY KEY,
    year INT NOT NULL UNIQUE,  -- One conclave per year
    theme VARCHAR(300) NOT NULL,
    focus_area TEXT,
    number_of_companies INT NOT NULL DEFAULT 0,
    sessions_held TEXT,  -- JSON or comma-separated list of sessions
    key_speakers TEXT,  -- JSON or comma-separated list of speakers
    event_photos_url TEXT,  -- URLs to photos (comma-separated or JSON)
    brochure_url VARCHAR(500),  -- URL to brochure/document
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (number_of_companies >= 0)
);

-- Indexes for better query performance
CREATE INDEX idx_industry_events_date ON industry_events(event_date);
CREATE INDEX idx_industry_events_type ON industry_events(event_type);
CREATE INDEX idx_industry_events_department ON industry_events(department);
CREATE INDEX idx_industry_events_year ON industry_events(EXTRACT(YEAR FROM event_date));
CREATE INDEX idx_industry_conclave_year ON industry_conclave(year);

