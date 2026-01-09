CREATE TABLE IF NOT EXISTS open_house (
    event_id SERIAL PRIMARY KEY,
    event_year INT NOT NULL,
    event_date DATE NOT NULL,
    theme VARCHAR(300),
    target_audience VARCHAR(200),
    departments_participated TEXT,
    num_departments INT DEFAULT 0 CHECK (num_departments >= 0),
    total_visitors INT DEFAULT 0 CHECK (total_visitors >= 0),
    key_highlights TEXT,
    photos_url TEXT,
    poster_url VARCHAR(500),
    brochure_url VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_year, event_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_open_house_date ON open_house(event_date);
CREATE INDEX IF NOT EXISTS idx_open_house_year ON open_house(event_year);
