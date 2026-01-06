CREATE TABLE IF NOT EXISTS icc_yearwise (
    complaints_year INT PRIMARY KEY, 
    total_complaints INT NOT NULL, 
    complaints_resolved INT NOT NULL,  
    complaints_pending INT NOT NULL, 

    CONSTRAINT check_total_non_negative CHECK (total_complaints >= 0),
    CONSTRAINT check_resolved_non_negative CHECK (complaints_resolved >= 0), 
    CONSTRAINT check_pending_non_negative CHECK (complaints_pending >= 0), 

    CONSTRAINT check_total_equals_sum CHECK (total_complaints = complaints_pending + complaints_resolved) -- Fixed typo and removed comma
);