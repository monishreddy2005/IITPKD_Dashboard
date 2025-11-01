CREATE TABLE igrs_yearwise (
    grievance_year INT PRIMARY KEY,
    total_grievances_filed INT NOT NULL,
    grievances_resolved INT NOT NULL,
    grievances_pending INT NOT NULL,

   --contraints to Ensure counts are never negative
    CONSTRAINT check_total_non_negative CHECK (total_grievances_filed >= 0),
    CONSTRAINT check_resolved_non_negative CHECK (grievances_resolved >= 0),
    CONSTRAINT check_pending_non_negative CHECK (grievances_pending >= 0),

    -- Another constraint Ensure the parts add up to the whole
    CONSTRAINT check_total_equals_sum CHECK (total_grievances_filed = grievances_resolved + grievances_pending)
);
