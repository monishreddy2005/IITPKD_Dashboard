-- ======================
-- ENUM: user_status
-- ======================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'user_status'
    ) THEN
        CREATE TYPE user_status AS ENUM (
            'pending_verification',
            'active',
            'deactivated'
        );
    END IF;
END $$;

-- ======================
-- ROLES TABLE
-- ======================

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- ======================
-- DEFAULT ROLES (IDEMPOTENT)
-- ======================

INSERT INTO roles (name)
VALUES
    ('officials'),
    ('administration'),
    ('admin'),
    ('academic')
ON CONFLICT (name) DO NOTHING;

-- ======================
-- USERS TABLE
-- ======================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    status user_status NOT NULL DEFAULT 'pending_verification',
    role_id INT,
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE SET NULL
);
