CREATE TABLE IF NOT EXISTS research_projects (
    project_id SERIAL PRIMARY KEY,
    project_title VARCHAR(250) NOT NULL,
    project_type research_project_type NOT NULL,
    status project_status_type DEFAULT 'Ongoing'
);
