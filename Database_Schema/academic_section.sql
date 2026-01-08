CREATE TABLE IF NOT EXISTS industry_courses (
    course_id SERIAL PRIMARY KEY,
    course_title VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year_offered INT NOT NULL
);

CREATE TABLE IF NOT EXISTS academic_program_launch (
    program_code VARCHAR(50) PRIMARY KEY,
    program_name VARCHAR(150) NOT NULL,
    program_type academic_program_type NOT NULL,
    launch_year INT NOT NULL
);
