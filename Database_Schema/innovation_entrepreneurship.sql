-- ======================
-- ENUM: startup_status_type
-- ======================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'startup_status_type'
    ) THEN
        CREATE TYPE startup_status_type AS ENUM (
            'Active',
            'Graduated',
            'Inactive'
        );
    END IF;
END $$;

-- ======================
-- ENUM: innovation_project_type
-- ======================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'innovation_project_type'
    ) THEN
        CREATE TYPE innovation_project_type AS ENUM (
            'Funded',
            'Mentored'
        );
    END IF;
END $$;

-- ======================
-- TABLE: startups
-- ======================

CREATE TABLE IF NOT EXISTS startups (
    startup_id SERIAL PRIMARY KEY,
    startup_name VARCHAR(200) NOT NULL,
    year_of_incubation INT NOT NULL,
    status startup_status_type DEFAULT 'Active',
    UNIQUE (startup_name, year_of_incubation)
);

-- =============================
-- TABLE: iptif_program_table
-- =============================
CREATE TABLE iptif_program_table (
    id INT PRIMARY KEY,
    program_name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    association VARCHAR(255),
    start_end DATE,
    date DATE,
    targetted_audi VARCHAR(150),
    no_of_attendees INT,
    remarks TEXT
);

-- =============================
-- TABLE: iptif_startup_table
-- ============================
CREATE TABLE iptif_startup_table (
    id INT PRIMARY KEY,
    startup_name VARCHAR(200) NOT NULL,
    domain VARCHAR(150),
    startup_origin VARCHAR(100),
    incubated_date DATE,
    status VARCHAR(50),
    revenue NUMERIC(15,2),
    number_of_jobs INT,
    remarks TEXT
);

-- ===============================
-- TABLE : iptif_projects_table 
-- ===============================
CREATE TABLE iptif_projects_table (
    project_id INT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    scheme VARCHAR(150),
    status VARCHAR(50),
    start_date DATE
);


-- =============================
-- TABLE: iptif_facilities_table
-- =============================
CREATE TABLE iptif_facilities_table (
    facility_id INT PRIMARY KEY,
    facility_name VARCHAR(200) NOT NULL,
    facility_type VARCHAR(100),
    revenue_made NUMERIC(12,2),
    availability_status VARCHAR(50),
    financial_year INT
);


-- ================================
-- TABLE: techin_program_table
-- ================================
CREATE TABLE techin_program_table (
    id INT PRIMARY KEY,
    program_name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    association VARCHAR(255),
    start_end DATE,
    event_date DATE,
    targetted_audience VARCHAR(150),
    no_of_attendess INT,
    remarks TEXT
);

-- ===================================
-- TABLE: techin_skill_development_table
-- ===================================
CREATE TABLE techin_skill_development_program (
    id INT PRIMARY KEY,
    program_name VARCHAR(255) NOT NULL,
    category VARCHAR(200),
    association VARCHAR(255),
    start_end DATE,
    event_date DATE,
    targetted_audience VARCHAR(150),
    no_of_attendess INT,
    remarks TEXT
);

-- =========================================
-- TABLE : techin_startup_table
-- ========================================
CREATE TABLE techin_startup_table (
    id INT PRIMARY KEY,
    startup_name VARCHAR(200) NOT NULL,
    domain VARCHAR(150),
    startup_origin VARCHAR(100),
    incubated_date DATE,
    status VARCHAR(50),
    revenue NUMERIC(15,2),
    number_of_jobs INT,
    remarks TEXT
);
