--
-- PostgreSQL database dump
--

\restrict uuGgCTg1EmKKnUwZpAIpdym3ifjgzyaZhpsoiLPn2sVl1ksH6yTSy0Jg04GP0YC

-- Dumped from database version 18.3 (Ubuntu 18.3-1.pgdg24.04+1)
-- Dumped by pg_dump version 18.3 (Ubuntu 18.3-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: academic_program_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.academic_program_type AS ENUM (
    'UG',
    'PG',
    'Certificate',
    'Interdisciplinary'
);


ALTER TYPE public.academic_program_type OWNER TO postgres;

--
-- Name: alumni_outcome_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.alumni_outcome_type AS ENUM (
    'HigherStudies',
    'Corporate',
    'Entrepreneurship',
    'Other'
);


ALTER TYPE public.alumni_outcome_type OWNER TO postgres;

--
-- Name: batch_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.batch_type AS ENUM (
    'Jan',
    'Jul'
);


ALTER TYPE public.batch_type OWNER TO postgres;

--
-- Name: category_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.category_type AS ENUM (
    'Gen',
    'EWS',
    'OBC',
    'SC',
    'ST'
);


ALTER TYPE public.category_type OWNER TO postgres;

--
-- Name: course_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.course_status AS ENUM (
    'Active',
    'Inactive'
);


ALTER TYPE public.course_status OWNER TO postgres;

--
-- Name: emp_gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.emp_gender AS ENUM (
    'Male',
    'Female',
    'Other',
    'Transgender'
);


ALTER TYPE public.emp_gender OWNER TO postgres;

--
-- Name: emp_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.emp_status AS ENUM (
    'Active',
    'Relieved',
    'Transferred'
);


ALTER TYPE public.emp_status OWNER TO postgres;

--
-- Name: event_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.event_type AS ENUM (
    'Workshop',
    'Seminar',
    'Industrial Talk',
    'Networking Event',
    'Industry Visit',
    'Panel Discussion',
    'Conference',
    'Training Program',
    'Hackathon',
    'Other'
);


ALTER TYPE public.event_type OWNER TO postgres;

--
-- Name: faculty_engagement_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.faculty_engagement_type AS ENUM (
    'Adjunct',
    'Honorary',
    'Visiting',
    'FacultyFellow',
    'PoP'
);


ALTER TYPE public.faculty_engagement_type OWNER TO postgres;

--
-- Name: gender_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gender_type AS ENUM (
    'Male',
    'Female',
    'Transgender'
);


ALTER TYPE public.gender_type OWNER TO postgres;

--
-- Name: innovation_project_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.innovation_project_type AS ENUM (
    'Funded',
    'Mentored'
);


ALTER TYPE public.innovation_project_type OWNER TO postgres;

--
-- Name: lien_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.lien_type AS ENUM (
    'Yes',
    'No',
    'NA'
);


ALTER TYPE public.lien_type OWNER TO postgres;

--
-- Name: nature_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nature_type AS ENUM (
    'Regular',
    'Contract',
    'Temporary',
    'Visiting',
    'Adhoc',
    'Probation'
);


ALTER TYPE public.nature_type OWNER TO postgres;

--
-- Name: patent_status_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.patent_status_type AS ENUM (
    'Filed',
    'Granted',
    'Published'
);


ALTER TYPE public.patent_status_type OWNER TO postgres;

--
-- Name: program_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.program_type AS ENUM (
    'BTech',
    'MTech',
    'MSc',
    'MS',
    'PhD'
);


ALTER TYPE public.program_type OWNER TO postgres;

--
-- Name: project_status_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.project_status_type AS ENUM (
    'Ongoing',
    'Completed'
);


ALTER TYPE public.project_status_type OWNER TO postgres;

--
-- Name: publication_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.publication_category AS ENUM (
    'Journal',
    'Conference',
    'Book Chapter',
    'Monograph'
);


ALTER TYPE public.publication_category OWNER TO postgres;

--
-- Name: research_patent_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.research_patent_status AS ENUM (
    'Filed',
    'Granted',
    'Published'
);


ALTER TYPE public.research_patent_status OWNER TO postgres;

--
-- Name: research_project_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.research_project_status AS ENUM (
    'Ongoing',
    'Completed'
);


ALTER TYPE public.research_project_status OWNER TO postgres;

--
-- Name: research_project_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.research_project_type AS ENUM (
    'Funded',
    'Consultancy'
);


ALTER TYPE public.research_project_type OWNER TO postgres;

--
-- Name: role_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role_status AS ENUM (
    'Active',
    'Relieved'
);


ALTER TYPE public.role_status OWNER TO postgres;

--
-- Name: startup_status_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.startup_status_type AS ENUM (
    'Active',
    'Graduated',
    'Inactive'
);


ALTER TYPE public.startup_status_type OWNER TO postgres;

--
-- Name: status_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_type AS ENUM (
    'Graduated',
    'Ongoing',
    'Slowpace'
);


ALTER TYPE public.status_type OWNER TO postgres;

--
-- Name: user_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status AS ENUM (
    'pending_verification',
    'active',
    'deactivated'
);


ALTER TYPE public.user_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: academic_program_launch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academic_program_launch (
    program_code character varying(50) NOT NULL,
    program_name character varying(150) NOT NULL,
    program_type public.academic_program_type NOT NULL,
    department character varying(100),
    launch_year integer NOT NULL,
    oelp_students integer DEFAULT 0,
    CONSTRAINT academic_program_launch_oelp_students_check CHECK ((oelp_students >= 0))
);


ALTER TABLE public.academic_program_launch OWNER TO postgres;

--
-- Name: additional_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.additional_roles (
    roleid integer NOT NULL,
    historyid integer,
    employeeid character varying(20),
    roletype character varying(100) NOT NULL,
    department character varying(200),
    startdate date NOT NULL,
    enddate date,
    status public.role_status DEFAULT 'Active'::public.role_status,
    remarks text,
    createddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    modifieddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.additional_roles OWNER TO postgres;

--
-- Name: additional_roles_roleid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.additional_roles_roleid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.additional_roles_roleid_seq OWNER TO postgres;

--
-- Name: additional_roles_roleid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.additional_roles_roleid_seq OWNED BY public.additional_roles.roleid;


--
-- Name: alumni; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alumni (
    rollno character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    alumniidno character varying(30),
    currentdesignation character varying(100),
    jobcountry character varying(100),
    jobplace character varying(100),
    yearofgraduation integer,
    department character varying(100),
    program character varying(20),
    category character varying(20),
    gender character varying(20),
    homestate character varying(100),
    jobstate character varying(100),
    outcome public.alumni_outcome_type,
    employer_or_institution character varying(150),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.alumni OWNER TO postgres;

--
-- Name: course; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course (
    coursecode character varying(20) NOT NULL,
    coursename character varying(150) NOT NULL,
    offeredbydept character varying(100) NOT NULL,
    offeredtoprogram public.program_type NOT NULL,
    credit numeric(3,1),
    coordinator character varying(100),
    cocoordinator character varying(100),
    currentstatus public.course_status DEFAULT 'Active'::public.course_status,
    CONSTRAINT course_credit_check CHECK ((credit >= (0)::numeric))
);


ALTER TABLE public.course OWNER TO postgres;

--
-- Name: department; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.department (
    deptcode character varying(20) NOT NULL,
    deptname character varying(100) NOT NULL,
    coursesoffered text,
    faculty text,
    courselist text
);


ALTER TABLE public.department OWNER TO postgres;

--
-- Name: designation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.designation (
    designationid integer NOT NULL,
    designationname character varying(50) NOT NULL,
    designationcadre character varying(50),
    designationcategory character varying(50),
    isactive boolean DEFAULT true,
    createddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    modifieddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.designation OWNER TO postgres;

--
-- Name: designation_designationid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.designation_designationid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.designation_designationid_seq OWNER TO postgres;

--
-- Name: designation_designationid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.designation_designationid_seq OWNED BY public.designation.designationid;


--
-- Name: employee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee (
    employeeid character varying(20) NOT NULL,
    empname character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    phonenumber character varying(15),
    bloodgroup character varying(5),
    dateofbirth date,
    gender public.emp_gender NOT NULL,
    department character varying(100),
    currentdesignationid integer,
    isactive boolean DEFAULT true,
    category character varying(10),
    pwd_exs boolean,
    state character varying(20),
    createddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    modifieddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee OWNER TO postgres;

--
-- Name: employee_employeeid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_employeeid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_employeeid_seq OWNER TO postgres;

--
-- Name: employee_employeeid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_employeeid_seq OWNED BY public.employee.employeeid;


--
-- Name: employment_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employment_history (
    historyid integer NOT NULL,
    employeeid character varying(20),
    designationid integer,
    designation character varying(50) NOT NULL,
    dateofjoining date NOT NULL,
    dateofrelieving date,
    appointmentmode character varying(100),
    natureofappointment public.nature_type NOT NULL,
    isonlien public.lien_type DEFAULT 'NA'::public.lien_type,
    lienstartdate date,
    lienenddate date,
    lienduration character varying(50),
    status public.emp_status DEFAULT 'Active'::public.emp_status,
    remarks text,
    createddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    modifieddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT employment_history_check CHECK (((dateofrelieving IS NULL) OR (dateofrelieving >= dateofjoining))),
    CONSTRAINT employment_history_check1 CHECK (((lienenddate IS NULL) OR (lienenddate >= lienstartdate)))
);


ALTER TABLE public.employment_history OWNER TO postgres;

--
-- Name: employment_history_historyid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employment_history_historyid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employment_history_historyid_seq OWNER TO postgres;

--
-- Name: employment_history_historyid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employment_history_historyid_seq OWNED BY public.employment_history.historyid;


--
-- Name: ewd_yearwise; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ewd_yearwise (
    ewd_year integer NOT NULL,
    annual_electricity_consumption integer NOT NULL,
    per_capita_electricity_consumption numeric(10,2) NOT NULL,
    per_capita_water_consumption numeric(10,2) NOT NULL,
    per_capita_recycled_water numeric(10,2) NOT NULL,
    green_coverage numeric(5,2) NOT NULL,
    CONSTRAINT check_non_negativity CHECK (((annual_electricity_consumption >= 0) AND (per_capita_electricity_consumption >= (0)::numeric) AND (per_capita_water_consumption >= (0)::numeric) AND (per_capita_recycled_water >= (0)::numeric) AND (green_coverage >= (0)::numeric)))
);


ALTER TABLE public.ewd_yearwise OWNER TO postgres;

--
-- Name: externship_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.externship_info (
    externid integer NOT NULL,
    employeeid character varying(20),
    empname character varying(50) NOT NULL,
    department character varying(50) NOT NULL,
    industry_name character varying(50) NOT NULL,
    startdate date NOT NULL,
    enddate date NOT NULL,
    duration integer GENERATED ALWAYS AS ((enddate - startdate)) STORED,
    type character varying(50) NOT NULL,
    remarks text,
    createddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    modifieddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.externship_info OWNER TO postgres;

--
-- Name: externship_info_externid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.externship_info_externid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.externship_info_externid_seq OWNER TO postgres;

--
-- Name: externship_info_externid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.externship_info_externid_seq OWNED BY public.externship_info.externid;


--
-- Name: faculty_engagement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculty_engagement (
    engagement_code character varying(40) NOT NULL,
    faculty_name character varying(150),
    engagement_type public.faculty_engagement_type NOT NULL,
    department character varying(100) NOT NULL,
    startdate date,
    enddate date,
    duration_months integer,
    year integer NOT NULL,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.faculty_engagement OWNER TO postgres;

--
-- Name: icc_yearwise; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.icc_yearwise (
    complaints_year integer NOT NULL,
    total_complaints integer NOT NULL,
    complaints_resolved integer NOT NULL,
    complaints_pending integer NOT NULL,
    CONSTRAINT check_pending_non_negative CHECK ((complaints_pending >= 0)),
    CONSTRAINT check_resolved_non_negative CHECK ((complaints_resolved >= 0)),
    CONSTRAINT check_total_equals_sum CHECK ((total_complaints = (complaints_pending + complaints_resolved))),
    CONSTRAINT check_total_non_negative CHECK ((total_complaints >= 0))
);


ALTER TABLE public.icc_yearwise OWNER TO postgres;

--
-- Name: icsr_consultancy_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.icsr_consultancy_projects (
    project_id integer CONSTRAINT icsr_sponsered_projects_project_id_not_null NOT NULL,
    project_title character varying(300),
    principal_investigator character varying(150) CONSTRAINT icsr_sponsered_projects_principal_investigator_not_null NOT NULL,
    department character varying(150) CONSTRAINT icsr_sponsered_projects_department_not_null NOT NULL,
    funding_agency character varying(150),
    client_organization character varying(150),
    amount_sanctioned numeric(15,2),
    start_date date,
    end_date date,
    status character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.icsr_consultancy_projects OWNER TO postgres;

--
-- Name: icsr_csr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.icsr_csr (
    csr_id integer NOT NULL,
    csr_organisation character varying(200) NOT NULL,
    year integer,
    type_of_company character varying(100),
    type_of_support character varying(100),
    amount_given numeric(15,2)
);


ALTER TABLE public.icsr_csr OWNER TO postgres;

--
-- Name: icsr_sponsered_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.icsr_sponsered_projects (
    project_id integer CONSTRAINT icsr_sponsered_projects_project_id_not_null1 NOT NULL,
    project_title character varying(300),
    principal_investigator character varying(150),
    principal_investigator_department character varying(150),
    co_principal_investigator1 character varying(150),
    co_principal_investigator1_department character varying(150),
    co_principal_investigator2 character varying(150),
    co_principal_investigator2_department character varying(150),
    funding_agency character varying(150),
    client_organization character varying(150),
    amount_sanctioned numeric(15,2),
    start_date date,
    end_date date,
    status character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.icsr_sponsered_projects OWNER TO postgres;

--
-- Name: igrs_yearwise; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.igrs_yearwise (
    grievance_year integer NOT NULL,
    total_grievances_filed integer NOT NULL,
    grievances_resolved integer NOT NULL,
    grievances_pending integer NOT NULL,
    CONSTRAINT check_pending_non_negative CHECK ((grievances_pending >= 0)),
    CONSTRAINT check_resolved_non_negative CHECK ((grievances_resolved >= 0)),
    CONSTRAINT check_total_equals_sum CHECK ((total_grievances_filed = (grievances_resolved + grievances_pending))),
    CONSTRAINT check_total_non_negative CHECK ((total_grievances_filed >= 0))
);


ALTER TABLE public.igrs_yearwise OWNER TO postgres;

--
-- Name: industry_conclave; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.industry_conclave (
    conclave_id integer NOT NULL,
    year integer NOT NULL,
    theme character varying(300) NOT NULL,
    focus_area text,
    number_of_companies integer DEFAULT 0 NOT NULL,
    sessions_held text,
    key_speakers text,
    event_photos_url text,
    brochure_url character varying(500),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT industry_conclave_number_of_companies_check CHECK ((number_of_companies >= 0))
);


ALTER TABLE public.industry_conclave OWNER TO postgres;

--
-- Name: industry_conclave_conclave_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.industry_conclave_conclave_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.industry_conclave_conclave_id_seq OWNER TO postgres;

--
-- Name: industry_conclave_conclave_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.industry_conclave_conclave_id_seq OWNED BY public.industry_conclave.conclave_id;


--
-- Name: industry_courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.industry_courses (
    course_id integer NOT NULL,
    course_title character varying(200) NOT NULL,
    department character varying(100) NOT NULL,
    industry_partner character varying(150),
    year_offered integer NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public.industry_courses OWNER TO postgres;

--
-- Name: industry_courses_course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.industry_courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.industry_courses_course_id_seq OWNER TO postgres;

--
-- Name: industry_courses_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.industry_courses_course_id_seq OWNED BY public.industry_courses.course_id;


--
-- Name: industry_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.industry_events (
    project_id integer NOT NULL,
    event_name character varying(200) NOT NULL,
    date_of_event date,
    event_type character varying(100),
    target_audience character varying(150),
    hosted_by character varying(150),
    funding_by character varying(100),
    amount numeric(12,2),
    year integer
);


ALTER TABLE public.industry_events OWNER TO postgres;

--
-- Name: innovation_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.innovation_projects (
    project_id integer NOT NULL,
    project_title character varying(250) NOT NULL,
    project_type public.innovation_project_type NOT NULL,
    sector character varying(100),
    year_started integer NOT NULL,
    status character varying(50) DEFAULT 'Ongoing'::character varying,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.innovation_projects OWNER TO postgres;

--
-- Name: innovation_projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.innovation_projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.innovation_projects_project_id_seq OWNER TO postgres;

--
-- Name: innovation_projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.innovation_projects_project_id_seq OWNED BY public.innovation_projects.project_id;


--
-- Name: iptif_facilities_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iptif_facilities_table (
    facility_id integer NOT NULL,
    facility_name character varying(200) NOT NULL,
    facility_type character varying(100),
    revenue_made numeric(12,2),
    availability_status character varying(50),
    financial_year integer
);


ALTER TABLE public.iptif_facilities_table OWNER TO postgres;

--
-- Name: iptif_program_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iptif_program_table (
    id integer NOT NULL,
    program_name character varying(255) NOT NULL,
    type character varying(100),
    association character varying(255),
    start_end date,
    date date,
    targetted_audi character varying(150),
    no_of_attendees integer,
    remarks text
);


ALTER TABLE public.iptif_program_table OWNER TO postgres;

--
-- Name: iptif_projects_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iptif_projects_table (
    project_id integer NOT NULL,
    project_name character varying(255) NOT NULL,
    scheme character varying(150),
    status character varying(50),
    start_date date
);


ALTER TABLE public.iptif_projects_table OWNER TO postgres;

--
-- Name: iptif_startup_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iptif_startup_table (
    id integer NOT NULL,
    startup_name character varying(200) NOT NULL,
    domain character varying(150),
    startup_origin character varying(100),
    incubated_date date,
    status character varying(50),
    revenue numeric(15,2),
    number_of_jobs integer,
    remarks text
);


ALTER TABLE public.iptif_startup_table OWNER TO postgres;

--
-- Name: nirf_ranking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nirf_ranking (
    ranking_id integer NOT NULL,
    year integer NOT NULL,
    tlr_score numeric(5,2),
    rpc_score numeric(5,2),
    go_score numeric(5,2),
    oi_score numeric(5,2),
    pr_score numeric(5,2)
);


ALTER TABLE public.nirf_ranking OWNER TO postgres;

--
-- Name: nirf_ranking_ranking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nirf_ranking_ranking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nirf_ranking_ranking_id_seq OWNER TO postgres;

--
-- Name: nirf_ranking_ranking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nirf_ranking_ranking_id_seq OWNED BY public.nirf_ranking.ranking_id;


--
-- Name: nptel_courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nptel_courses (
    course_id integer NOT NULL,
    course_code character varying(50) NOT NULL,
    course_title character varying(250) NOT NULL,
    course_category character varying(100),
    offering_semester character varying(20),
    offering_year integer NOT NULL,
    local_chapter_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.nptel_courses OWNER TO postgres;

--
-- Name: nptel_courses_course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nptel_courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nptel_courses_course_id_seq OWNER TO postgres;

--
-- Name: nptel_courses_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nptel_courses_course_id_seq OWNED BY public.nptel_courses.course_id;


--
-- Name: nptel_enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nptel_enrollments (
    enrollment_id integer NOT NULL,
    course_id integer NOT NULL,
    student_name character varying(150),
    enrollment_semester character varying(20),
    enrollment_year integer NOT NULL,
    certification_earned boolean DEFAULT false,
    certification_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.nptel_enrollments OWNER TO postgres;

--
-- Name: nptel_enrollments_enrollment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nptel_enrollments_enrollment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nptel_enrollments_enrollment_id_seq OWNER TO postgres;

--
-- Name: nptel_enrollments_enrollment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nptel_enrollments_enrollment_id_seq OWNED BY public.nptel_enrollments.enrollment_id;


--
-- Name: nptel_local_chapters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nptel_local_chapters (
    chapter_id integer NOT NULL,
    chapter_name character varying(200) NOT NULL,
    faculty_coordinator character varying(150) NOT NULL,
    is_active boolean DEFAULT true,
    established_year integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.nptel_local_chapters OWNER TO postgres;

--
-- Name: nptel_local_chapters_chapter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nptel_local_chapters_chapter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nptel_local_chapters_chapter_id_seq OWNER TO postgres;

--
-- Name: nptel_local_chapters_chapter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nptel_local_chapters_chapter_id_seq OWNED BY public.nptel_local_chapters.chapter_id;


--
-- Name: open_house; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.open_house (
    event_id integer NOT NULL,
    event_year integer NOT NULL,
    event_date date NOT NULL,
    theme character varying(300),
    target_audience character varying(200),
    departments_participated text,
    num_departments integer DEFAULT 0,
    total_visitors integer DEFAULT 0,
    key_highlights text,
    photos_url text,
    poster_url character varying(500),
    brochure_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT open_house_num_departments_check CHECK ((num_departments >= 0)),
    CONSTRAINT open_house_total_visitors_check CHECK ((total_visitors >= 0))
);


ALTER TABLE public.open_house OWNER TO postgres;

--
-- Name: open_house_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.open_house_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.open_house_event_id_seq OWNER TO postgres;

--
-- Name: open_house_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.open_house_event_id_seq OWNED BY public.open_house.event_id;


--
-- Name: outreach_program_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.outreach_program_table (
    id integer NOT NULL,
    program_name character varying(255) NOT NULL,
    type character varying(100),
    association character varying(255),
    start_end date,
    date date,
    targetted_audi character varying(150),
    no_of_attendees integer,
    remarks text
);


ALTER TABLE public.outreach_program_table OWNER TO postgres;

--
-- Name: placement_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.placement_companies (
    company_id integer NOT NULL,
    placement_year integer NOT NULL,
    company_name character varying(150) NOT NULL,
    sector character varying(100),
    offers integer DEFAULT 0 NOT NULL,
    hires integer DEFAULT 0 NOT NULL,
    is_top_recruiter boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT placement_company_non_negative CHECK (((offers >= 0) AND (hires >= 0)))
);


ALTER TABLE public.placement_companies OWNER TO postgres;

--
-- Name: placement_companies_company_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.placement_companies_company_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.placement_companies_company_id_seq OWNER TO postgres;

--
-- Name: placement_companies_company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.placement_companies_company_id_seq OWNED BY public.placement_companies.company_id;


--
-- Name: placement_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.placement_packages (
    placement_year integer NOT NULL,
    program public.program_type NOT NULL,
    highest_package numeric(10,2),
    lowest_package numeric(10,2),
    average_package numeric(10,2),
    CONSTRAINT placement_packages_check CHECK ((((highest_package IS NULL) OR (highest_package >= (0)::numeric)) AND ((lowest_package IS NULL) OR (lowest_package >= (0)::numeric)) AND ((average_package IS NULL) OR (average_package >= (0)::numeric)) AND ((highest_package IS NULL) OR (lowest_package IS NULL) OR (highest_package >= lowest_package)) AND ((average_package IS NULL) OR (lowest_package IS NULL) OR (highest_package IS NULL) OR ((average_package >= lowest_package) AND (average_package <= highest_package)))))
);


ALTER TABLE public.placement_packages OWNER TO postgres;

--
-- Name: placement_summary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.placement_summary (
    placement_year integer NOT NULL,
    program public.program_type NOT NULL,
    gender public.gender_type NOT NULL,
    registered integer NOT NULL,
    placed integer NOT NULL,
    CONSTRAINT placement_summary_check CHECK ((placed <= registered)),
    CONSTRAINT placement_summary_placed_check CHECK ((placed >= 0)),
    CONSTRAINT placement_summary_registered_check CHECK ((registered >= 0))
);


ALTER TABLE public.placement_summary OWNER TO postgres;

--
-- Name: research_mous; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.research_mous (
    mou_id integer NOT NULL,
    partner_name character varying(200) NOT NULL,
    collaboration_nature text,
    date_signed date NOT NULL,
    validity_end date,
    remarks text
);


ALTER TABLE public.research_mous OWNER TO postgres;

--
-- Name: research_mous_mou_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.research_mous_mou_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.research_mous_mou_id_seq OWNER TO postgres;

--
-- Name: research_mous_mou_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.research_mous_mou_id_seq OWNED BY public.research_mous.mou_id;


--
-- Name: research_patents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.research_patents (
    patent_id integer NOT NULL,
    patent_title character varying(250) NOT NULL,
    patent_status public.patent_status_type NOT NULL,
    filing_date date,
    grant_date date,
    remarks text,
    inventor1 character varying(50),
    inventor1_category character varying(50),
    inventor2 character varying(50),
    inventor2_category character varying(50),
    inventor3 character varying(50),
    inventor3_category character varying(50),
    inventor4 character varying(50),
    inventor4_category character varying(50)
);


ALTER TABLE public.research_patents OWNER TO postgres;

--
-- Name: research_patents_patent_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.research_patents_patent_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.research_patents_patent_id_seq OWNER TO postgres;

--
-- Name: research_patents_patent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.research_patents_patent_id_seq OWNED BY public.research_patents.patent_id;


--
-- Name: research_publications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.research_publications (
    publication_id integer NOT NULL,
    publication_title character varying(250) NOT NULL,
    journal_name character varying(200),
    department character varying(100),
    faculty_name character varying(150),
    publication_year integer NOT NULL,
    publication_type public.publication_category NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.research_publications OWNER TO postgres;

--
-- Name: research_publications_publication_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.research_publications_publication_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.research_publications_publication_id_seq OWNER TO postgres;

--
-- Name: research_publications_publication_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.research_publications_publication_id_seq OWNED BY public.research_publications.publication_id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: startups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.startups (
    startup_id integer NOT NULL,
    startup_name character varying(200) NOT NULL,
    founder_name character varying(200) NOT NULL,
    innovation_focus_area text,
    year_of_incubation integer NOT NULL,
    status public.startup_status_type DEFAULT 'Active'::public.startup_status_type NOT NULL,
    sector character varying(100),
    is_from_iitpkd boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.startups OWNER TO postgres;

--
-- Name: startups_startup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.startups_startup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.startups_startup_id_seq OWNER TO postgres;

--
-- Name: startups_startup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.startups_startup_id_seq OWNED BY public.startups.startup_id;


--
-- Name: student_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_table (
    roll_no_admission integer,
    roll_no_current integer,
    name_of_student character varying(100),
    programme_admission character varying(50),
    programme_current character varying(50),
    admission_year integer,
    admission_cycle character varying(20),
    admission_batch integer,
    date_of_joining date,
    date_of_validity date,
    department_admission character varying(50),
    department_current character varying(50),
    stream_admission character varying(50),
    stream_current character varying(50),
    current_semester integer,
    gender character varying(20),
    original_category character varying(10),
    admission_category character varying(10),
    hosteller_day_scholar character varying(20),
    date_of_birth date,
    residential_address character varying(300),
    nationality character varying(50),
    state character varying(50),
    pwd_status character varying(5),
    disability_type character varying(100),
    blood_group character varying(10),
    apaar_id character varying(20),
    qualifying_exam character varying(20),
    qualifying_exam_score integer,
    student_contact_no bigint,
    institute_email character varying(50),
    personal_email character varying(50),
    parent_name character varying(50),
    parent_contact_no bigint,
    parent_email character varying(50),
    faculty_advisor character varying(50),
    institute_scholarship character varying(50),
    nsp_scholarship_recipient character varying(50),
    preparatory character varying(50),
    branch_change character varying(10),
    branch_change_remarks character varying(200),
    slowpaced character varying(10),
    upgraded character varying(10),
    date_of_upgradation date,
    idc_current character varying(10),
    number_of_total_idcs integer,
    idc_history character varying(200),
    break_type character varying(50),
    break_from_date date,
    break_to_date date,
    break_history character varying(200),
    student_status character varying(20),
    student_status_date date,
    student_status_remarks character varying(200),
    fellowship_status_admission character varying(50),
    fellowship_status_current character varying(50),
    dc_chairperson character varying(50),
    dc_members character varying(100),
    thesis_submission_date date,
    viva_voice_date date
);


ALTER TABLE public.student_table OWNER TO postgres;

--
-- Name: techin_program_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.techin_program_table (
    id integer NOT NULL,
    program_name character varying(255) NOT NULL,
    type character varying(100),
    association character varying(255),
    start_end date,
    event_date date,
    targetted_audience character varying(150),
    no_of_attendess integer,
    remarks text
);


ALTER TABLE public.techin_program_table OWNER TO postgres;

--
-- Name: techin_skill_development_program; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.techin_skill_development_program (
    id integer NOT NULL,
    program_name character varying(255) NOT NULL,
    category character varying(200),
    association character varying(255),
    start_end date,
    event_date date,
    targetted_audience character varying(150),
    no_of_attendess integer,
    remarks text
);


ALTER TABLE public.techin_skill_development_program OWNER TO postgres;

--
-- Name: techin_startup_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.techin_startup_table (
    id integer NOT NULL,
    startup_name character varying(200) NOT NULL,
    domain character varying(150),
    startup_origin character varying(100),
    incubated_date date,
    status character varying(50),
    revenue numeric(15,2),
    number_of_jobs integer,
    remarks text
);


ALTER TABLE public.techin_startup_table OWNER TO postgres;

--
-- Name: uba_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.uba_events (
    event_id integer NOT NULL,
    project_id integer,
    event_title character varying(250) NOT NULL,
    event_type character varying(100),
    event_date date NOT NULL,
    location character varying(200),
    description text,
    photos_url text,
    brochure_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.uba_events OWNER TO postgres;

--
-- Name: uba_events_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.uba_events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.uba_events_event_id_seq OWNER TO postgres;

--
-- Name: uba_events_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.uba_events_event_id_seq OWNED BY public.uba_events.event_id;


--
-- Name: uba_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.uba_projects (
    project_id integer NOT NULL,
    project_title character varying(250) NOT NULL,
    coordinator_name character varying(150) NOT NULL,
    intervention_description text,
    project_status character varying(50) DEFAULT 'Ongoing'::character varying,
    start_date date,
    end_date date,
    collaboration_partners text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.uba_projects OWNER TO postgres;

--
-- Name: uba_projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.uba_projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.uba_projects_project_id_seq OWNER TO postgres;

--
-- Name: uba_projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.uba_projects_project_id_seq OWNED BY public.uba_projects.project_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(50),
    password_hash character varying(128) NOT NULL,
    display_name character varying(100),
    status public.user_status DEFAULT 'pending_verification'::public.user_status NOT NULL,
    last_login_at timestamp with time zone,
    failed_login_attempts smallint DEFAULT 0 NOT NULL,
    role_id integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: additional_roles roleid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.additional_roles ALTER COLUMN roleid SET DEFAULT nextval('public.additional_roles_roleid_seq'::regclass);


--
-- Name: designation designationid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designation ALTER COLUMN designationid SET DEFAULT nextval('public.designation_designationid_seq'::regclass);


--
-- Name: employment_history historyid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employment_history ALTER COLUMN historyid SET DEFAULT nextval('public.employment_history_historyid_seq'::regclass);


--
-- Name: externship_info externid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.externship_info ALTER COLUMN externid SET DEFAULT nextval('public.externship_info_externid_seq'::regclass);


--
-- Name: industry_conclave conclave_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industry_conclave ALTER COLUMN conclave_id SET DEFAULT nextval('public.industry_conclave_conclave_id_seq'::regclass);


--
-- Name: industry_courses course_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industry_courses ALTER COLUMN course_id SET DEFAULT nextval('public.industry_courses_course_id_seq'::regclass);


--
-- Name: innovation_projects project_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.innovation_projects ALTER COLUMN project_id SET DEFAULT nextval('public.innovation_projects_project_id_seq'::regclass);


--
-- Name: nirf_ranking ranking_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nirf_ranking ALTER COLUMN ranking_id SET DEFAULT nextval('public.nirf_ranking_ranking_id_seq'::regclass);


--
-- Name: nptel_courses course_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nptel_courses ALTER COLUMN course_id SET DEFAULT nextval('public.nptel_courses_course_id_seq'::regclass);


--
-- Name: nptel_enrollments enrollment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nptel_enrollments ALTER COLUMN enrollment_id SET DEFAULT nextval('public.nptel_enrollments_enrollment_id_seq'::regclass);


--
-- Name: nptel_local_chapters chapter_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nptel_local_chapters ALTER COLUMN chapter_id SET DEFAULT nextval('public.nptel_local_chapters_chapter_id_seq'::regclass);


--
-- Name: open_house event_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.open_house ALTER COLUMN event_id SET DEFAULT nextval('public.open_house_event_id_seq'::regclass);


--
-- Name: placement_companies company_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placement_companies ALTER COLUMN company_id SET DEFAULT nextval('public.placement_companies_company_id_seq'::regclass);


--
-- Name: research_mous mou_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.research_mous ALTER COLUMN mou_id SET DEFAULT nextval('public.research_mous_mou_id_seq'::regclass);


--
-- Name: research_patents patent_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.research_patents ALTER COLUMN patent_id SET DEFAULT nextval('public.research_patents_patent_id_seq'::regclass);


--
-- Name: research_publications publication_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.research_publications ALTER COLUMN publication_id SET DEFAULT nextval('public.research_publications_publication_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: startups startup_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.startups ALTER COLUMN startup_id SET DEFAULT nextval('public.startups_startup_id_seq'::regclass);


--
-- Name: uba_events event_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uba_events ALTER COLUMN event_id SET DEFAULT nextval('public.uba_events_event_id_seq'::regclass);


--
-- Name: uba_projects project_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uba_projects ALTER COLUMN project_id SET DEFAULT nextval('public.uba_projects_project_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: academic_program_launch academic_program_launch_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_program_launch
    ADD CONSTRAINT academic_program_launch_pkey PRIMARY KEY (program_code);


--
-- Name: additional_roles additional_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.additional_roles
    ADD CONSTRAINT additional_roles_pkey PRIMARY KEY (roleid);


--
-- Name: alumni alumni_alumniidno_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumni
    ADD CONSTRAINT alumni_alumniidno_key UNIQUE (alumniidno);


--
-- Name: alumni alumni_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumni
    ADD CONSTRAINT alumni_pkey PRIMARY KEY (rollno);


--
-- Name: course course_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT course_pkey PRIMARY KEY (coursecode);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (deptcode);


--
-- Name: designation designation_designationname_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designation
    ADD CONSTRAINT designation_designationname_key UNIQUE (designationname);


--
-- Name: designation designation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designation
    ADD CONSTRAINT designation_pkey PRIMARY KEY (designationid);


--
-- Name: employee employee_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_email_key UNIQUE (email);


--
-- Name: employee employee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_pkey PRIMARY KEY (employeeid);


--
-- Name: employment_history employment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employment_history
    ADD CONSTRAINT employment_history_pkey PRIMARY KEY (historyid);


--
-- Name: employment_history employment_history_unique_record; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employment_history
    ADD CONSTRAINT employment_history_unique_record UNIQUE (employeeid, designationid, dateofjoining);


--
-- Name: ewd_yearwise ewd_yearwise_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewd_yearwise
    ADD CONSTRAINT ewd_yearwise_pkey PRIMARY KEY (ewd_year);


--
-- Name: externship_info externship_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.externship_info
    ADD CONSTRAINT externship_info_pkey PRIMARY KEY (externid);


--
-- Name: faculty_engagement faculty_engagement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty_engagement
    ADD CONSTRAINT faculty_engagement_pkey PRIMARY KEY (engagement_code);


--
-- Name: icc_yearwise icc_yearwise_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.icc_yearwise
    ADD CONSTRAINT icc_yearwise_pkey PRIMARY KEY (complaints_year);


--
-- Name: icsr_consultancy_projects icsr_consultancy_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.icsr_consultancy_projects
    ADD CONSTRAINT icsr_consultancy_projects_pkey PRIMARY KEY (project_id);


--
-- Name: icsr_csr icsr_csr_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.icsr_csr
    ADD CONSTRAINT icsr_csr_pkey PRIMARY KEY (csr_id);


--
-- Name: icsr_sponsered_projects icsr_sponsered_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.icsr_sponsered_projects
    ADD CONSTRAINT icsr_sponsered_projects_pkey PRIMARY KEY (project_id);


--
-- Name: igrs_yearwise igrs_yearwise_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.igrs_yearwise
    ADD CONSTRAINT igrs_yearwise_pkey PRIMARY KEY (grievance_year);


--
-- Name: industry_conclave industry_conclave_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industry_conclave
    ADD CONSTRAINT industry_conclave_pkey PRIMARY KEY (conclave_id);


--
-- Name: industry_conclave industry_conclave_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industry_conclave
    ADD CONSTRAINT industry_conclave_year_key UNIQUE (year);


--
-- Name: industry_courses industry_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industry_courses
    ADD CONSTRAINT industry_courses_pkey PRIMARY KEY (course_id);


--
-- Name: industry_events industry_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industry_events
    ADD CONSTRAINT industry_events_pkey PRIMARY KEY (project_id);


--
-- Name: innovation_projects innovation_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.innovation_projects
    ADD CONSTRAINT innovation_projects_pkey PRIMARY KEY (project_id);


--
-- Name: innovation_projects innovation_projects_project_title_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.innovation_projects
    ADD CONSTRAINT innovation_projects_project_title_key UNIQUE (project_title);


--
-- Name: iptif_facilities_table iptif_facilities_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iptif_facilities_table
    ADD CONSTRAINT iptif_facilities_table_pkey PRIMARY KEY (facility_id);


--
-- Name: iptif_program_table iptif_program_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iptif_program_table
    ADD CONSTRAINT iptif_program_table_pkey PRIMARY KEY (id);


--
-- Name: iptif_projects_table iptif_projects_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iptif_projects_table
    ADD CONSTRAINT iptif_projects_table_pkey PRIMARY KEY (project_id);


--
-- Name: iptif_startup_table iptif_startup_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iptif_startup_table
    ADD CONSTRAINT iptif_startup_table_pkey PRIMARY KEY (id);


--
-- Name: nirf_ranking nirf_ranking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nirf_ranking
    ADD CONSTRAINT nirf_ranking_pkey PRIMARY KEY (ranking_id);


--
-- Name: nirf_ranking nirf_ranking_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nirf_ranking
    ADD CONSTRAINT nirf_ranking_year_key UNIQUE (year);


--
-- Name: nptel_courses nptel_courses_course_code_offering_year_offering_semester_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nptel_courses
    ADD CONSTRAINT nptel_courses_course_code_offering_year_offering_semester_key UNIQUE (course_code, offering_year, offering_semester);


--
-- Name: nptel_courses nptel_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nptel_courses
    ADD CONSTRAINT nptel_courses_pkey PRIMARY KEY (course_id);


--
-- Name: nptel_enrollments nptel_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nptel_enrollments
    ADD CONSTRAINT nptel_enrollments_pkey PRIMARY KEY (enrollment_id);


--
-- Name: nptel_local_chapters nptel_local_chapters_chapter_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nptel_local_chapters
    ADD CONSTRAINT nptel_local_chapters_chapter_name_key UNIQUE (chapter_name);


--
-- Name: nptel_local_chapters nptel_local_chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nptel_local_chapters
    ADD CONSTRAINT nptel_local_chapters_pkey PRIMARY KEY (chapter_id);


--
-- Name: open_house open_house_event_year_event_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.open_house
    ADD CONSTRAINT open_house_event_year_event_date_key UNIQUE (event_year, event_date);


--
-- Name: open_house open_house_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.open_house
    ADD CONSTRAINT open_house_pkey PRIMARY KEY (event_id);


--
-- Name: outreach_program_table outreach_program_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outreach_program_table
    ADD CONSTRAINT outreach_program_table_pkey PRIMARY KEY (id);


--
-- Name: placement_companies placement_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placement_companies
    ADD CONSTRAINT placement_companies_pkey PRIMARY KEY (company_id);


--
-- Name: placement_packages placement_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placement_packages
    ADD CONSTRAINT placement_packages_pkey PRIMARY KEY (placement_year, program);


--
-- Name: placement_summary placement_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placement_summary
    ADD CONSTRAINT placement_summary_pkey PRIMARY KEY (placement_year, program, gender);


--
-- Name: research_mous research_mous_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.research_mous
    ADD CONSTRAINT research_mous_pkey PRIMARY KEY (mou_id);


--
-- Name: research_patents research_patents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.research_patents
    ADD CONSTRAINT research_patents_pkey PRIMARY KEY (patent_id);


--
-- Name: research_publications research_publications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.research_publications
    ADD CONSTRAINT research_publications_pkey PRIMARY KEY (publication_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: startups startups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.startups
    ADD CONSTRAINT startups_pkey PRIMARY KEY (startup_id);


--
-- Name: startups startups_startup_name_year_of_incubation_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.startups
    ADD CONSTRAINT startups_startup_name_year_of_incubation_key UNIQUE (startup_name, year_of_incubation);


--
-- Name: techin_program_table techin_program_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.techin_program_table
    ADD CONSTRAINT techin_program_table_pkey PRIMARY KEY (id);


--
-- Name: techin_skill_development_program techin_skill_development_program_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.techin_skill_development_program
    ADD CONSTRAINT techin_skill_development_program_pkey PRIMARY KEY (id);


--
-- Name: techin_startup_table techin_startup_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.techin_startup_table
    ADD CONSTRAINT techin_startup_table_pkey PRIMARY KEY (id);


--
-- Name: uba_events uba_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uba_events
    ADD CONSTRAINT uba_events_pkey PRIMARY KEY (event_id);


--
-- Name: uba_projects uba_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uba_projects
    ADD CONSTRAINT uba_projects_pkey PRIMARY KEY (project_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_industry_conclave_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_industry_conclave_year ON public.industry_conclave USING btree (year);


--
-- Name: idx_innovation_projects_sector; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_innovation_projects_sector ON public.innovation_projects USING btree (sector);


--
-- Name: idx_innovation_projects_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_innovation_projects_year ON public.innovation_projects USING btree (year_started);


--
-- Name: idx_nptel_courses_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nptel_courses_category ON public.nptel_courses USING btree (course_category);


--
-- Name: idx_nptel_courses_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nptel_courses_year ON public.nptel_courses USING btree (offering_year);


--
-- Name: idx_nptel_enrollments_certification; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nptel_enrollments_certification ON public.nptel_enrollments USING btree (certification_earned);


--
-- Name: idx_nptel_enrollments_course; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nptel_enrollments_course ON public.nptel_enrollments USING btree (course_id);


--
-- Name: idx_nptel_enrollments_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nptel_enrollments_year ON public.nptel_enrollments USING btree (enrollment_year);


--
-- Name: idx_open_house_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_open_house_date ON public.open_house USING btree (event_date);


--
-- Name: idx_open_house_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_open_house_year ON public.open_house USING btree (event_year);


--
-- Name: idx_startups_iitpkd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_startups_iitpkd ON public.startups USING btree (is_from_iitpkd);


--
-- Name: idx_startups_sector; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_startups_sector ON public.startups USING btree (sector);


--
-- Name: idx_startups_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_startups_status ON public.startups USING btree (status);


--
-- Name: idx_startups_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_startups_year ON public.startups USING btree (year_of_incubation);


--
-- Name: idx_uba_events_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_uba_events_date ON public.uba_events USING btree (event_date);


--
-- Name: idx_uba_events_project; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_uba_events_project ON public.uba_events USING btree (project_id);


--
-- Name: idx_uba_projects_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_uba_projects_status ON public.uba_projects USING btree (project_status);


--
-- Name: additional_roles additional_roles_employeeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.additional_roles
    ADD CONSTRAINT additional_roles_employeeid_fkey FOREIGN KEY (employeeid) REFERENCES public.employee(employeeid) ON DELETE CASCADE;


--
-- Name: additional_roles additional_roles_historyid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.additional_roles
    ADD CONSTRAINT additional_roles_historyid_fkey FOREIGN KEY (historyid) REFERENCES public.employment_history(historyid) ON DELETE CASCADE;


--
-- Name: employee employee_currentdesignationid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_currentdesignationid_fkey FOREIGN KEY (currentdesignationid) REFERENCES public.designation(designationid);


--
-- Name: employment_history employment_history_designationid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employment_history
    ADD CONSTRAINT employment_history_designationid_fkey FOREIGN KEY (designationid) REFERENCES public.designation(designationid) ON DELETE SET NULL;


--
-- Name: employment_history employment_history_employeeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employment_history
    ADD CONSTRAINT employment_history_employeeid_fkey FOREIGN KEY (employeeid) REFERENCES public.employee(employeeid) ON DELETE CASCADE;


--
-- Name: externship_info externship_info_employeeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.externship_info
    ADD CONSTRAINT externship_info_employeeid_fkey FOREIGN KEY (employeeid) REFERENCES public.employee(employeeid) ON DELETE CASCADE;


--
-- Name: users fk_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET DEFAULT;


--
-- Name: nptel_courses nptel_courses_local_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nptel_courses
    ADD CONSTRAINT nptel_courses_local_chapter_id_fkey FOREIGN KEY (local_chapter_id) REFERENCES public.nptel_local_chapters(chapter_id);


--
-- Name: nptel_enrollments nptel_enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nptel_enrollments
    ADD CONSTRAINT nptel_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.nptel_courses(course_id);


--
-- Name: uba_events uba_events_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uba_events
    ADD CONSTRAINT uba_events_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.uba_projects(project_id);


--
-- PostgreSQL database dump complete
--

\unrestrict uuGgCTg1EmKKnUwZpAIpdym3ifjgzyaZhpsoiLPn2sVl1ksH6yTSy0Jg04GP0YC

