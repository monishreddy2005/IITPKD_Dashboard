-- Outreach and Extension Module
-- Open House, NPTEL-CCE, and UBA (Unnat Bharat Abhiyan)

-- 1. Open House – Faculty Coordinator
CREATE TABLE IF NOT EXISTS open_house (
    event_id SERIAL PRIMARY KEY,
    event_year INT NOT NULL,
    event_date DATE NOT NULL,
    theme VARCHAR(300),
    target_audience VARCHAR(200),  -- School/college students, public, educators, etc.
    departments_participated TEXT,  -- Comma-separated or JSON list of departments
    num_departments INT DEFAULT 0,
    total_visitors INT DEFAULT 0,
    key_highlights TEXT,
    photos_url TEXT,  -- URLs to photos (comma-separated or JSON)
    poster_url VARCHAR(500),  -- URL to poster
    brochure_url VARCHAR(500),  -- URL to brochure
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (num_departments >= 0),
    CHECK (total_visitors >= 0),
    UNIQUE(event_year, event_date)  -- Prevent duplicate events on same date in same year
);

-- 2. NPTEL – CCE (Continuing and Community Education)
CREATE TABLE IF NOT EXISTS nptel_local_chapters (
    chapter_id SERIAL PRIMARY KEY,
    chapter_name VARCHAR(200) NOT NULL,
    faculty_coordinator VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    established_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chapter_name)  -- Each chapter name should be unique
);

CREATE TABLE IF NOT EXISTS nptel_courses (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL,
    course_title VARCHAR(250) NOT NULL,
    course_category VARCHAR(100),  -- Engineering, Science, Humanities, etc.
    offering_semester VARCHAR(20),  -- Spring, Fall, Summer, etc.
    offering_year INT NOT NULL,
    local_chapter_id INT REFERENCES nptel_local_chapters(chapter_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_code, offering_year, offering_semester)  -- Same course can be offered multiple times
);

CREATE TABLE IF NOT EXISTS nptel_enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES nptel_courses(course_id),
    student_name VARCHAR(150),
    enrollment_semester VARCHAR(20),
    enrollment_year INT NOT NULL,
    certification_earned BOOLEAN DEFAULT FALSE,
    certification_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. UBA (Unnat Bharat Abhiyan) – Faculty Coordinator
CREATE TABLE IF NOT EXISTS uba_projects (
    project_id SERIAL PRIMARY KEY,
    project_title VARCHAR(250) NOT NULL,
    coordinator_name VARCHAR(150) NOT NULL,
    intervention_description TEXT,
    project_status VARCHAR(50) DEFAULT 'Ongoing',  -- Ongoing, Completed, Planned
    start_date DATE,
    end_date DATE,
    collaboration_partners TEXT,  -- Comma-separated or JSON list
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uba_events (
    event_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES uba_projects(project_id),
    event_title VARCHAR(250) NOT NULL,
    event_type VARCHAR(100),  -- Awareness Camp, Survey, Workshop, etc.
    event_date DATE NOT NULL,
    location VARCHAR(200),
    description TEXT,
    photos_url TEXT,  -- URLs to photos (comma-separated or JSON)
    brochure_url VARCHAR(500),  -- URL to brochure/document
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_open_house_year ON open_house(event_year);
CREATE INDEX idx_open_house_date ON open_house(event_date);
CREATE INDEX idx_nptel_courses_year ON nptel_courses(offering_year);
CREATE INDEX idx_nptel_courses_category ON nptel_courses(course_category);
CREATE INDEX idx_nptel_enrollments_course ON nptel_enrollments(course_id);
CREATE INDEX idx_nptel_enrollments_year ON nptel_enrollments(enrollment_year);
CREATE INDEX idx_nptel_enrollments_certification ON nptel_enrollments(certification_earned);
CREATE INDEX idx_uba_projects_status ON uba_projects(project_status);
CREATE INDEX idx_uba_events_project ON uba_events(project_id);
CREATE INDEX idx_uba_events_date ON uba_events(event_date);

