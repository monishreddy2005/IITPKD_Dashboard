CREATE TABLE IF NOT EXISTS placement_summary (
    placement_year INT,
    program program_type,
    gender gender_type,
    registered INT CHECK (registered >= 0),
    placed INT CHECK (placed >= 0),
    PRIMARY KEY (placement_year, program, gender)
);
