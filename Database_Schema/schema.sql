-- STUDENT

DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE program_type AS ENUM ('BTech', 'MTech', 'MSc', 'MS', 'PhD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE batch_type AS ENUM ('Jan', 'Jul');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE category_type AS ENUM ('Gen', 'EWS', 'OBC', 'SC', 'ST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Transgender');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE status_type AS ENUM ('Graduated', 'Ongoing', 'Slowpace');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS student (
    rollno VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    program program_type NOT NULL,
    yearofadmission INT NOT NULL,
    batch batch_type NOT NULL,
    branch VARCHAR(100),
    department VARCHAR(100),
    pwd BOOLEAN DEFAULT FALSE,
    state VARCHAR(50),
    category category_type,
    gender gender_type,
    status status_type DEFAULT 'Ongoing'
);

-- course table

DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE course_status AS ENUM ('Active', 'Inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS course (
    coursecode VARCHAR(20) PRIMARY KEY,
    coursename VARCHAR(150) NOT NULL,
    offeredbydept VARCHAR(100) NOT NULL,
    offeredtoprogram program_type NOT NULL,
    credit DECIMAL(3,1) CHECK (credit >= 0),
    coordinator VARCHAR(100),
    cocoordinator VARCHAR(100),
    currentstatus course_status DEFAULT 'Active'
);




CREATE TABLE IF NOT EXISTS department (
    deptcode VARCHAR(20) PRIMARY KEY,
    deptname VARCHAR(100) NOT NULL,
    coursesoffered TEXT,
    faculty TEXT,
    courselist TEXT
);


DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE academic_program_type AS ENUM ('UG', 'PG', 'Certificate', 'Interdisciplinary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS industry_courses (
    course_id SERIAL PRIMARY KEY,
    course_title VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    industry_partner VARCHAR(150),
    year_offered INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);


CREATE TABLE IF NOT EXISTS academic_program_launch (
    program_code VARCHAR(50) PRIMARY KEY,
    program_name VARCHAR(150) NOT NULL,
    program_type academic_program_type NOT NULL,
    department VARCHAR(100),
    launch_year INT NOT NULL,
    oelp_students INT DEFAULT 0,
    CHECK (oelp_students >= 0)
);


DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE research_project_type AS ENUM ('Funded', 'Consultancy');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE project_status_type AS ENUM ('Ongoing', 'Completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE patent_status_type AS ENUM ('Filed', 'Granted', 'Published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE publication_category AS ENUM ('Journal', 'Conference', 'Book Chapter', 'Monograph');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


CREATE TABLE IF NOT EXISTS research_projects (
    project_id SERIAL PRIMARY KEY,
    project_title VARCHAR(250) NOT NULL,
    principal_investigator VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    project_type research_project_type NOT NULL,
    funding_agency VARCHAR(150),
    client_organization VARCHAR(150),
    amount_sanctioned DECIMAL(14, 2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status project_status_type DEFAULT 'Ongoing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (amount_sanctioned >= 0)
);


CREATE TABLE IF NOT EXISTS research_mous (
    mou_id SERIAL PRIMARY KEY,
    partner_name VARCHAR(200) NOT NULL,
    collaboration_nature TEXT,
    date_signed DATE NOT NULL,
    validity_end DATE,
    remarks TEXT
);


CREATE TABLE IF NOT EXISTS research_patents (
    patent_id SERIAL PRIMARY KEY,
    patent_title VARCHAR(250) NOT NULL,
    inventors TEXT,
    patent_status patent_status_type NOT NULL,
    filing_date DATE,
    grant_date DATE,
    remarks TEXT
);


CREATE TABLE IF NOT EXISTS research_publications (
    publication_id SERIAL PRIMARY KEY,
    publication_title VARCHAR(250) NOT NULL,
    journal_name VARCHAR(200),
    department VARCHAR(100),
    faculty_name VARCHAR(150),
    publication_year INT NOT NULL,
    publication_type publication_category NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE alumni_outcome_type AS ENUM ('HigherStudies', 'Corporate', 'Entrepreneurship', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS alumni (
    rollno VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    alumniidno VARCHAR(30) UNIQUE,
    currentdesignation VARCHAR(100),
    jobcountry VARCHAR(100),
    jobplace VARCHAR(100),
    yearofgraduation INT,
    department VARCHAR(100),
    program VARCHAR(20),
    category VARCHAR(20),
    gender VARCHAR(20),
    homestate VARCHAR(100),
    jobstate VARCHAR(100),
    outcome alumni_outcome_type,
    employer_or_institution VARCHAR(150),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Employee and related tables



CREATE TABLE IF NOT EXISTS designation (
    designationid SERIAL PRIMARY KEY,
    designationname VARCHAR(50) UNIQUE NOT NULL,
    designationcadre VARCHAR(50),
    designationcategory VARCHAR(50),
    isactive BOOLEAN DEFAULT TRUE,
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifieddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE emp_gender AS ENUM ('Male', 'Female', 'Other', 'Transgender');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS employee (
    employeeid SERIAL PRIMARY KEY,
    empname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phonenumber VARCHAR(15),
    bloodgroup VARCHAR(5),
    dateofbirth DATE,
    gender emp_gender NOT NULL,
    department VARCHAR(100),
    currentdesignationid INT REFERENCES designation(designationid),
    isactive BOOLEAN DEFAULT TRUE,
    category VARCHAR(10),
    pwd_exs BOOLEAN,
    state VARCHAR(20),
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifieddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE nature_type AS ENUM ('Regular', 'Contract', 'Temporary', 'Visiting', 'Adhoc');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE lien_type AS ENUM ('Yes', 'No', 'NA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE emp_status AS ENUM ('Active', 'Relieved', 'Transferred');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS employment_history (
    historyid SERIAL PRIMARY KEY,
    employeeid INT REFERENCES employee(employeeid) ON DELETE CASCADE,
    designationid INT REFERENCES designation(designationid) ON DELETE SET NULL,
    designation VARCHAR(50) NOT NULL,
    dateofjoining DATE NOT NULL,
    dateofrelieving DATE,
    appointmentmode VARCHAR(100),
    natureofappointment nature_type NOT NULL,
    isonlien lien_type DEFAULT 'NA',
    lienstartdate DATE,
    lienenddate DATE,
    lienduration INT,
    status emp_status DEFAULT 'Active',
    remarks TEXT,
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifieddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (dateofrelieving IS NULL OR dateofrelieving >= dateofjoining),
    CHECK (lienenddate IS NULL OR lienenddate >= lienstartdate)
);


DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE role_status AS ENUM ('Active', 'Relieved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS additional_roles (
    roleid SERIAL PRIMARY KEY,
    historyid INT REFERENCES employment_history(historyid) ON DELETE CASCADE,
    employeeid INT REFERENCES employee(employeeid) ON DELETE CASCADE,
    roletype VARCHAR(100) NOT NULL,
    department VARCHAR(200),
    startdate DATE NOT NULL,
    enddate DATE,
    status role_status DEFAULT 'Active',
    remarks TEXT,
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifieddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS externship_info (
    externid SERIAL PRIMARY KEY,
    employeeid INT REFERENCES employee(employeeid) ON DELETE CASCADE,
    empname VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    industry_name VARCHAR(50) NOT NULL,
    startdate DATE NOT NULL,
    enddate DATE NOT NULL,
    duration INT GENERATED ALWAYS AS (enddate - startdate) STORED,
    type VARCHAR(50) NOT NULL,
    remarks TEXT,
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifieddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE faculty_engagement_type AS ENUM ('Adjunct', 'Honorary', 'Visiting', 'FacultyFellow', 'PoP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS faculty_engagement (
    engagement_code VARCHAR(40) PRIMARY KEY,
    faculty_name VARCHAR(150),
    engagement_type faculty_engagement_type NOT NULL,
    department VARCHAR(100) NOT NULL,
    startdate DATE,
    enddate DATE,
    duration_months INT,
    year INT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS igrs_yearwise (
    grievance_year INT PRIMARY KEY,
    total_grievances_filed INT NOT NULL,
    grievances_resolved INT NOT NULL,
    grievances_pending INT NOT NULL,
    CONSTRAINT igrs_total_non_negative CHECK (total_grievances_filed >= 0),
    CONSTRAINT igrs_resolved_non_negative CHECK (grievances_resolved >= 0),
    CONSTRAINT igrs_pending_non_negative CHECK (grievances_pending >= 0),
    CONSTRAINT igrs_total_equals_sum CHECK (total_grievances_filed = grievances_resolved + grievances_pending)
);


CREATE TABLE IF NOT EXISTS icc_yearwise (
    complaints_year INT PRIMARY KEY,
    total_complaints INT NOT NULL,
    complaints_resolved INT NOT NULL,
    complaints_pending INT NOT NULL,
    CONSTRAINT icc_total_non_negative CHECK (total_complaints >= 0),
    CONSTRAINT icc_resolved_non_negative CHECK (complaints_resolved >= 0),
    CONSTRAINT icc_pending_non_negative CHECK (complaints_pending >= 0),
    CONSTRAINT icc_total_equals_sum CHECK (total_complaints = complaints_resolved + complaints_pending)
);


CREATE TABLE IF NOT EXISTS ewd_yearwise (
    ewd_year INT PRIMARY KEY,
    annual_electricity_consumption INT NOT NULL,
    per_capita_electricity_consumption DECIMAL(10, 2) NOT NULL,
    per_capita_water_consumption DECIMAL(10, 2) NOT NULL,
    per_capita_recycled_water DECIMAL(10, 2) NOT NULL,
    green_coverage DECIMAL(5, 2) NOT NULL,
    CONSTRAINT ewd_non_negative CHECK (
        annual_electricity_consumption >= 0
        AND per_capita_electricity_consumption >= 0
        AND per_capita_water_consumption >= 0
        AND per_capita_recycled_water >= 0
        AND green_coverage >= 0
    )
);


CREATE TABLE IF NOT EXISTS placement_summary (
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


CREATE TABLE IF NOT EXISTS placement_companies (
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


CREATE TABLE IF NOT EXISTS placement_packages (
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
 
 
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE research_project_type AS ENUM ('Funded', 'Consultancy');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE research_project_status AS ENUM ('Ongoing', 'Completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE research_patent_status AS ENUM ('Filed', 'Granted', 'Published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    DO $$ BEGIN
    CREATE TYPE publication_category AS ENUM ('Journal', 'Conference', 'Book Chapter', 'Monograph');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


CREATE TABLE IF NOT EXISTS research_projects (
    project_id SERIAL PRIMARY KEY,
    project_title VARCHAR(255) NOT NULL,
    principal_investigator VARCHAR(150) NOT NULL,
    department VARCHAR(150),
    project_type research_project_type NOT NULL,
    funding_agency VARCHAR(200),
    client_organization VARCHAR(200),
    amount_sanctioned DECIMAL(14, 2),
    start_date DATE NOT NULL,
    end_date DATE,
    status research_project_status NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (amount_sanctioned IS NULL OR amount_sanctioned >= 0)
);


CREATE TABLE IF NOT EXISTS research_mous (
    mou_id SERIAL PRIMARY KEY,
    partner_name VARCHAR(200) NOT NULL,
    collaboration_nature VARCHAR(200),
    date_signed DATE NOT NULL,
    validity_end DATE,
    remarks TEXT
);


CREATE TABLE IF NOT EXISTS research_patents (
    patent_id SERIAL PRIMARY KEY,
    patent_title VARCHAR(255) NOT NULL,
    inventors TEXT NOT NULL,
    patent_status research_patent_status NOT NULL,
    filing_date DATE NOT NULL,
    grant_date DATE,
    remarks TEXT
);


CREATE TABLE IF NOT EXISTS research_publications (
    publication_id SERIAL PRIMARY KEY,
    publication_title VARCHAR(255) NOT NULL,
    journal_name VARCHAR(200) NOT NULL,
    department VARCHAR(150),
    faculty_name VARCHAR(150),
    publication_year INT NOT NULL,
    publication_type publication_category NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--This is new changes In may need to changes in future
