-- Innovation and Entrepreneurship Module
-- TECHIN (Technology Innovation Foundation of IIT Palakkad) & IPTIF (IIT Palakkad Technology IHub Foundation)

CREATE TYPE startup_status_type AS ENUM ('Active', 'Graduated', 'Inactive');
CREATE TYPE innovation_project_type AS ENUM ('Funded', 'Mentored');

-- Main startups/incubatees table
CREATE TABLE startups (
    startup_id SERIAL PRIMARY KEY,
    startup_name VARCHAR(200) NOT NULL,
    founder_name VARCHAR(200) NOT NULL,
    innovation_focus_area TEXT,
    year_of_incubation INT NOT NULL,
    status startup_status_type NOT NULL DEFAULT 'Active',
    sector VARCHAR(100),
    is_from_iitpkd BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(startup_name, year_of_incubation)  -- Prevent duplicate startups in same year
);

-- Innovation projects table (non-startup projects)
CREATE TABLE innovation_projects (
    project_id SERIAL PRIMARY KEY,
    project_title VARCHAR(250) NOT NULL,
    project_type innovation_project_type NOT NULL,
    sector VARCHAR(100),
    year_started INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Ongoing',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_startups_year ON startups(year_of_incubation);
CREATE INDEX idx_startups_status ON startups(status);
CREATE INDEX idx_startups_iitpkd ON startups(is_from_iitpkd);
CREATE INDEX idx_startups_sector ON startups(sector);
CREATE INDEX idx_innovation_projects_year ON innovation_projects(year_started);
CREATE INDEX idx_innovation_projects_sector ON innovation_projects(sector);

