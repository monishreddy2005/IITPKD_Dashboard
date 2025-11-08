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

-- Alumni Table

CREATE TYPE alumni_outcome_type AS ENUM ('HigherStudies', 'Corporate', 'Entrepreneurship', 'Other');

ALTER TABLE alumni
    ADD COLUMN yearofgraduation INT,
    ADD COLUMN department VARCHAR(100),
    ADD COLUMN program VARCHAR(20),
    ADD COLUMN category VARCHAR(20),
    ADD COLUMN gender VARCHAR(20),
    ADD COLUMN homestate VARCHAR(100),
    ADD COLUMN jobstate VARCHAR(100),
    ADD COLUMN outcome alumni_outcome_type,
    ADD COLUMN employer_or_institution VARCHAR(150),
    ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


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



--This is new chagnes In may need to changes in future
