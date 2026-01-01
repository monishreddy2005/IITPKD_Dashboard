-- Migration: Add UNIQUE constraint to innovation_projects table
-- This migration adds a composite unique constraint on (project_title, year_started)
-- Run this if your database already exists and you need to update the constraint

-- Note: If the constraint already exists, this will fail with a clear error message.
-- That's okay - you can safely ignore the error if it says the constraint already exists.

ALTER TABLE innovation_projects 
ADD CONSTRAINT innovation_projects_project_title_year_started_key 
UNIQUE (project_title, year_started);

