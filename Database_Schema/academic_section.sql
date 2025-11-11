CREATE TYPE academic_program_type AS ENUM ('UG', 'PG', 'Certificate', 'Interdisciplinary');


CREATE TABLE industry_courses (
    course_id SERIAL PRIMARY KEY,
    course_title VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    industry_partner VARCHAR(150),
    year_offered INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);


CREATE TABLE academic_program_launch (
    program_code VARCHAR(50) PRIMARY KEY,
    program_name VARCHAR(150) NOT NULL,
    program_type academic_program_type NOT NULL,
    department VARCHAR(100),
    launch_year INT NOT NULL,
    oelp_students INT DEFAULT 0,
    CHECK (oelp_students >= 0)
);