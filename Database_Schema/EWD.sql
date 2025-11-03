CREATE TABLE ewd_yearwise (
    ewd_year INT PRIMARY KEY, 
    

    annual_electricity_consumption INT NOT NULL, 
    
    per_capita_electricity_consumption DECIMAL(10, 2) NOT NULL, 
    per_capita_water_consumption DECIMAL(10, 2) NOT NULL, 
    per_capita_recycled_water DECIMAL(10, 2) NOT NULL, 
    
    green_coverage DECIMAL(5, 2) NOT NULL,  -- Fixed typo

    CONSTRAINT check_non_negativity CHECK (
        annual_electricity_consumption >= 0 
        AND per_capita_electricity_consumption >= 0 
        AND per_capita_water_consumption >= 0
        AND per_capita_recycled_water >= 0
        AND green_coverage >= 0
    )
);