CREATE TABLE IF NOT EXISTS ewd_yearwise (
    ewd_year INT PRIMARY KEY,
    annual_electricity_consumption INT NOT NULL CHECK (annual_electricity_consumption >= 0),
    per_capita_electricity_consumption DECIMAL(10,2) NOT NULL CHECK (per_capita_electricity_consumption >= 0),
    per_capita_water_consumption DECIMAL(10,2) NOT NULL CHECK (per_capita_water_consumption >= 0),
    per_capita_recycled_water DECIMAL(10,2) NOT NULL CHECK (per_capita_recycled_water >= 0),
    green_coverage DECIMAL(5,2) NOT NULL CHECK (green_coverage >= 0)
);
