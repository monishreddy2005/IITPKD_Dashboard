CREATE TABLE IF NOT EXISTS icc_yearwise (
    complaints_year INT PRIMARY KEY,
    total_complaints INT NOT NULL CHECK (total_complaints >= 0),
    complaints_resolved INT NOT NULL CHECK (complaints_resolved >= 0),
    complaints_pending INT NOT NULL CHECK (complaints_pending >= 0),
    CHECK (total_complaints = complaints_resolved + complaints_pending)
);
