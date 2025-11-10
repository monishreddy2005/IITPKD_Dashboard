-- STUDENT

CREATE TYPE program_type AS ENUM ('BTech', 'MTech', 'MSc', 'MS', 'PhD');
CREATE TYPE batch_type AS ENUM ('Jan', 'Jul');
CREATE TYPE category_type AS ENUM ('Gen', 'EWS', 'OBC', 'SC', 'ST');
CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Transgender');
CREATE TYPE status_type AS ENUM ('Graduated', 'Ongoing', 'Slowpace');

CREATE TABLE student (
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

CREATE TYPE course_status AS ENUM ('Active', 'Inactive');

CREATE TABLE course (
    coursecode VARCHAR(20) PRIMARY KEY,
    coursename VARCHAR(150) NOT NULL,
    offeredbydept VARCHAR(100) NOT NULL,
    offeredtoprogram program_type NOT NULL,
    credit DECIMAL(3,1) CHECK (credit >= 0),
    coordinator VARCHAR(100),
    cocoordinator VARCHAR(100),
    currentstatus course_status DEFAULT 'Active'
);




CREATE TABLE department (
    deptcode VARCHAR(20) PRIMARY KEY,
    deptname VARCHAR(100) NOT NULL,
    coursesoffered TEXT,
    faculty TEXT,
    courselist TEXT
);


CREATE TYPE alumni_outcome_type AS ENUM ('HigherStudies', 'Corporate', 'Entrepreneurship', 'Other');

CREATE TABLE alumni (
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



CREATE TABLE designation (
    designationid SERIAL PRIMARY KEY,
    designationname VARCHAR(50) UNIQUE NOT NULL,
    designationcadre VARCHAR(50),
    designationcategory VARCHAR(50),
    isactive BOOLEAN DEFAULT TRUE,
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifieddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TYPE emp_gender AS ENUM ('Male', 'Female', 'Other');

CREATE TABLE employee (
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


CREATE TYPE nature_type AS ENUM ('Regular', 'Contract', 'Temporary', 'Visiting', 'Adhoc');
CREATE TYPE lien_type AS ENUM ('Yes', 'No', 'NA');
CREATE TYPE emp_status AS ENUM ('Active', 'Relieved', 'Transferred');

CREATE TABLE employment_history (
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


CREATE TYPE role_status AS ENUM ('Active', 'Relieved');

CREATE TABLE additional_roles (
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


CREATE TABLE externship_info (
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



CREATE TYPE faculty_engagement_type AS ENUM ('Adjunct', 'Honorary', 'Visiting', 'FacultyFellow', 'PoP');

CREATE TABLE faculty_engagement (
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


CREATE TABLE igrs_yearwise (
    grievance_year INT PRIMARY KEY,
    total_grievances_filed INT NOT NULL,
    grievances_resolved INT NOT NULL,
    grievances_pending INT NOT NULL,
    CONSTRAINT igrs_total_non_negative CHECK (total_grievances_filed >= 0),
    CONSTRAINT igrs_resolved_non_negative CHECK (grievances_resolved >= 0),
    CONSTRAINT igrs_pending_non_negative CHECK (grievances_pending >= 0),
    CONSTRAINT igrs_total_equals_sum CHECK (total_grievances_filed = grievances_resolved + grievances_pending)
);


CREATE TABLE icc_yearwise (
    complaints_year INT PRIMARY KEY,
    total_complaints INT NOT NULL,
    complaints_resolved INT NOT NULL,
    complaints_pending INT NOT NULL,
    CONSTRAINT icc_total_non_negative CHECK (total_complaints >= 0),
    CONSTRAINT icc_resolved_non_negative CHECK (complaints_resolved >= 0),
    CONSTRAINT icc_pending_non_negative CHECK (complaints_pending >= 0),
    CONSTRAINT icc_total_equals_sum CHECK (total_complaints = complaints_resolved + complaints_pending)
);


CREATE TABLE ewd_yearwise (
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


--This is new changes In may need to changes in future
