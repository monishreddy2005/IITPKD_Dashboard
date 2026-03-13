-- =================
-- TABLE: students // Not including enum now. Will add later. 
-- ===============

CREATE TABLE student_table (

"roll_no_admission" INT,
"roll_no_current" INT,
"name_of_student" VARCHAR(100),

"programme_admission" VARCHAR(50),
"programme_current" VARCHAR(50),

"admission_year" INT,
"admission_cycle" VARCHAR(20),
"admission_batch" INT,

"date_of_joining" DATE,
"date_of_validity" DATE,

"department_admission" VARCHAR(50),
"department_current" VARCHAR(50),

"stream_admission" VARCHAR(50),
"stream_current" VARCHAR(50),

"current_semester" INT,

"gender" VARCHAR(20),
"original_category" VARCHAR(10),
"admission_category" VARCHAR(10),

"hosteller_day_scholar" VARCHAR(20),

"date_of_birth" DATE,

"residential_address" VARCHAR(300),
"nationality" VARCHAR(50),
"state" VARCHAR(50),

"pwd_status" VARCHAR(5),
"disability_type" VARCHAR(100),

"blood_group" VARCHAR(10),

"apaar_id" VARCHAR(20),

"qualifying_exam" VARCHAR(20),
"qualifying_exam_score" INT,

"student_contact_no" BIGINT,
"institute_email" VARCHAR(50),
"personal_email" VARCHAR(50),

"parent_name" VARCHAR(50),
"parent_contact_no" BIGINT,
"parent_email" VARCHAR(50),

"faculty_advisor" VARCHAR(50),

"institute_scholarship" VARCHAR(50),
"nsp_scholarship_recipient" VARCHAR(50),

"preparatory" VARCHAR(50),

"branch_change" VARCHAR(10),
"branch_change_remarks" VARCHAR(200),

"slowpaced" VARCHAR(10),
"upgraded" VARCHAR(10),

"date_of_upgradation" DATE,

"idc_current" VARCHAR(10),
"number_of_total_idcs" INT,
"idc_history" VARCHAR(200),

"break_type" VARCHAR(50),
"break_from_date" DATE,
"break_to_date" DATE,
"break_history" VARCHAR(200),

"student_status" VARCHAR(20),
"student_status_date" DATE,
"student_status_remarks" VARCHAR(200),

"fellowship_status_admission" VARCHAR(50),
"fellowship_status_current" VARCHAR(50),

"dc_chairperson" VARCHAR(50),
"dc_members" VARCHAR(100),

"thesis_submission_date" DATE,
"viva_voice_date" DATE

);