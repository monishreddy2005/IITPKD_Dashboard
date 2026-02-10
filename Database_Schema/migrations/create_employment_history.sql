CREATE TABLE IF NOT EXISTS employment_history (
    historyid SERIAL PRIMARY KEY,
    employeeid INT REFERENCES employee(employeeid),
    designationid INT REFERENCES designation(designationid),
    designation VARCHAR(100),
    dateofjoining DATE,
    dateofrelieving DATE,
    appointmentmode VARCHAR(100),
    natureofappointment nature_type,
    isonlien lien_type,
    lienstartdate DATE,
    lienenddate DATE,
    lienduration VARCHAR(50),
    status emp_status,
    remarks TEXT,
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifieddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
