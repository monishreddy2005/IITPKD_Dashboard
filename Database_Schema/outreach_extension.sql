CREATE TABLE IF NOT EXISTS open_house (
    event_id SERIAL PRIMARY KEY,
    event_year INT NOT NULL,
    event_date DATE NOT NULL
);
