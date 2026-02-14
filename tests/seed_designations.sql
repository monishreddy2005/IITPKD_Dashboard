-- Seed data for designation table
-- Using manually specified IDs to match test data dependencies
-- designationid, designationname, designationcadre, designationcategory, isactive

INSERT INTO designation (designationid, designationname, designationcadre, designationcategory, isactive)
VALUES
(1, 'Professor', 'Faculty', 'Teaching', TRUE),
(2, 'Associate Professor', 'Faculty', 'Teaching', TRUE),
(3, 'Assistant Professor', 'Faculty', 'Teaching', TRUE),
(4, 'Lecturer', 'Faculty', 'Teaching', TRUE),
(5, 'Research Associate', 'Research', 'Research', TRUE),
(6, 'Postdoctoral Fellow', 'Research', 'Research', TRUE),
(7, 'Registrar', 'Admin', 'Non-Teaching', TRUE),
(8, 'Deputy Registrar', 'Admin', 'Non-Teaching', TRUE),
(9, 'Assistant Registrar', 'Admin', 'Non-Teaching', TRUE),
(10, 'Technical Officer', 'Technical', 'Non-Teaching', TRUE),
(11, 'Lab Assistant', 'Technical', 'Non-Teaching', TRUE)
ON CONFLICT (designationid) DO NOTHING;
