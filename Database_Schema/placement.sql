CREATE TABLE placement_summary (
    placement_year INT NOT NULL,
    program program_type NOT NULL,
    gender gender_type NOT NULL,
    registered INT NOT NULL,
    placed INT NOT NULL,
    PRIMARY KEY (placement_year, program, gender),
    CHECK (registered >= 0),
    CHECK (placed >= 0),
    CHECK (placed <= registered)
);


CREATE TABLE placement_companies (
    company_id SERIAL PRIMARY KEY,
    placement_year INT NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    sector VARCHAR(100),
    offers INT NOT NULL DEFAULT 0,
    hires INT NOT NULL DEFAULT 0,
    is_top_recruiter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT placement_company_non_negative CHECK (offers >= 0 AND hires >= 0)
);


CREATE TABLE placement_packages (
    placement_year INT NOT NULL,
    program program_type NOT NULL,
    highest_package DECIMAL(10, 2),
    lowest_package DECIMAL(10, 2),
    average_package DECIMAL(10, 2),
    PRIMARY KEY (placement_year, program),
    CHECK (
        (highest_package IS NULL OR highest_package >= 0)
        AND (lowest_package IS NULL OR lowest_package >= 0)
        AND (average_package IS NULL OR average_package >= 0)
        AND (
            highest_package IS NULL
            OR lowest_package IS NULL
            OR highest_package >= lowest_package
        )
        AND (
            average_package IS NULL
            OR lowest_package IS NULL
            OR highest_package IS NULL
            OR (average_package BETWEEN lowest_package AND highest_package)
        )
    )
);
