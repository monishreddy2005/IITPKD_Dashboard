-- ======================
-- CORE ENUM TYPES (PG18 SAFE)
-- ======================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'program_type') THEN
        CREATE TYPE program_type AS ENUM ('BTech','MTech','MSc','MS','PhD');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_type') THEN
        CREATE TYPE batch_type AS ENUM ('Jan','Jul');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_type') THEN
        CREATE TYPE category_type AS ENUM ('Gen','EWS','OBC','SC','ST');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('Male','Female','Transgender');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_type') THEN
        CREATE TYPE status_type AS ENUM ('Graduated','Ongoing','Slowpace');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
        CREATE TYPE course_status AS ENUM ('Active','Inactive');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'emp_gender') THEN
        CREATE TYPE emp_gender AS ENUM ('Male','Female','Other','Transgender');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nature_type') THEN
        CREATE TYPE nature_type AS ENUM ('Regular','Contract','Temporary','Visiting','Adhoc');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lien_type') THEN
        CREATE TYPE lien_type AS ENUM ('Yes','No','NA');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'emp_status') THEN
        CREATE TYPE emp_status AS ENUM ('Active','Relieved','Transferred');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_status') THEN
        CREATE TYPE role_status AS ENUM ('Active','Relieved');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'academic_program_type') THEN
        CREATE TYPE academic_program_type AS ENUM ('UG','PG','Certificate','Interdisciplinary');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'research_project_type') THEN
        CREATE TYPE research_project_type AS ENUM ('Funded','Consultancy');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status_type') THEN
        CREATE TYPE project_status_type AS ENUM ('Ongoing','Completed');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patent_status_type') THEN
        CREATE TYPE patent_status_type AS ENUM ('Filed','Granted','Published');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publication_category') THEN
        CREATE TYPE publication_category AS ENUM ('Journal','Conference','Book Chapter','Monograph');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alumni_outcome_type') THEN
        CREATE TYPE alumni_outcome_type AS ENUM ('HigherStudies','Corporate','Entrepreneurship','Other');
    END IF;
END $$;

-- ======================
-- CORE TABLES
-- ======================

CREATE TABLE IF NOT EXISTS designation (
    designationid SERIAL PRIMARY KEY,
    designationname VARCHAR(50) UNIQUE NOT NULL,
    isactive BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS employee (
    employeeid SERIAL PRIMARY KEY,
    empname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    gender emp_gender NOT NULL,
    currentdesignationid INT REFERENCES designation(designationid)
);

CREATE TABLE IF NOT EXISTS employment_history (
    historyid SERIAL PRIMARY KEY,
    employeeid INT REFERENCES employee(employeeid),
    designationid INT REFERENCES designation(designationid),
    designation VARCHAR(100),
    dateofjoining DATE,
    dateofrelieving DATE,
    appointmentmode VARCHAR(100),
    natureofappointment nature_type,
    isonlien lien_type,
    lienstartdate DATE,
    lienenddate DATE,
    lienduration VARCHAR(50),
    status emp_status,
    remarks TEXT,
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifieddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nirf_ranking (
    ranking_id SERIAL PRIMARY KEY,
    year INT UNIQUE NOT NULL,
    tlr_score DECIMAL(5, 2),
    rpc_score DECIMAL(5, 2),
    go_score DECIMAL(5, 2),
    oi_score DECIMAL(5, 2),
    pr_score DECIMAL(5, 2)
);

-- ======================
-- FACULTY ENGAGEMENT TABLE
-- ======================

CREATE TABLE IF NOT EXISTS faculty_engagement (
    engagement_code VARCHAR(50) PRIMARY KEY,

    faculty_name VARCHAR(100) NOT NULL,

    engagement_type VARCHAR(50) NOT NULL
        CHECK (engagement_type IN ('Adjunct','Honorary','Visiting','FacultyFellow','PoP')),

    department VARCHAR(100),

    startdate DATE,

    enddate DATE,

    duration_months INT
        CHECK (duration_months >= 0),

    year INT
        CHECK (year >= 2000),

    remarks TEXT,

    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifieddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
