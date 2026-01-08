CREATE TABLE IF NOT EXISTS igrs_yearwise (
    grievance_year INT PRIMARY KEY,
    total_grievances_filed INT NOT NULL CHECK (total_grievances_filed >= 0),
    grievances_resolved INT NOT NULL CHECK (grievances_resolved >= 0),
    grievances_pending INT NOT NULL CHECK (grievances_pending >= 0),
    CHECK (total_grievances_filed = grievances_resolved + grievances_pending)
);
