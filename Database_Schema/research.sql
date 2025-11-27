CREATE TYPE research_project_type AS ENUM ('Funded', 'Consultancy');
CREATE TYPE project_status_type AS ENUM ('Ongoing', 'Completed');
CREATE TYPE patent_status_type AS ENUM ('Filed', 'Granted', 'Published');
CREATE TYPE publication_category AS ENUM ('Journal', 'Conference', 'Book Chapter', 'Monograph');


CREATE TABLE research_projects (
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


CREATE TABLE research_mous (
    mou_id SERIAL PRIMARY KEY,
    partner_name VARCHAR(200) NOT NULL,
    collaboration_nature TEXT,
    date_signed DATE NOT NULL,
    validity_end DATE,
    remarks TEXT
);


CREATE TABLE research_patents (
    patent_id SERIAL PRIMARY KEY,
    patent_title VARCHAR(250) NOT NULL,
    inventors TEXT,
    patent_status patent_status_type NOT NULL,
    filing_date DATE,
    grant_date DATE,
    remarks TEXT
);


CREATE TABLE research_publications (
    publication_id SERIAL PRIMARY KEY,
    publication_title VARCHAR(250) NOT NULL,
    journal_name VARCHAR(200),
    department VARCHAR(100),
    faculty_name VARCHAR(150),
    publication_year INT NOT NULL,
    publication_type publication_category NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);