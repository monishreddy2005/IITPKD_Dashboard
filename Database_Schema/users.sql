-- A 'user_status' enum type
CREATE TYPE user_status AS ENUM (
    'pending_verification', 
    'active', 
    'deactivated' 
);

-- This table holds user roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Insert default roles
INSERT INTO roles (name) VALUES ('officials'), ('administration'), ('admin');

-- The main users table
CREATE TABLE users (
    -- Core Identity
    id SERIAL PRIMARY KEY,
    
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(128) NOT NULL,
    
    -- User Profile
    display_name VARCHAR(100),

    -- Status & Lifecycle
    status user_status NOT NULL DEFAULT 'pending_verification',
    last_login_at TIMESTAMPTZ,
    
    -- Security
    failed_login_attempts SMALLINT NOT NULL DEFAULT 0,
    
    -- Relationships
    role_id INTEGER NOT NULL DEFAULT 1, -- Assumes 'officials' has ID=1
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Foreign Key Constraint
    CONSTRAINT fk_role
        FOREIGN KEY(role_id) 
        REFERENCES roles(id)
        ON DELETE SET DEFAULT
);