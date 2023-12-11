-- Create Members table
CREATE TABLE Members (
    m_id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create Goals table
CREATE TABLE Goals (
    g_id SERIAL PRIMARY KEY,
    m_id INTEGER REFERENCES Members(m_id),
    description TEXT NOT NULL
);

-- Create Health table
CREATE TABLE Health (
    h_id SERIAL PRIMARY KEY,
    m_id INTEGER REFERENCES Members(m_id),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    date DATE
);

-- Create Exercises table
CREATE TABLE Exercises (
    e_id SERIAL PRIMARY KEY,
    m_id INTEGER REFERENCES Members(m_id),
    date DATE,
    body_group VARCHAR(255),
    description TEXT,
    start_time TIME,
    end_time TIME
);

-- Create Trainers table
CREATE TABLE Trainers (
    t_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create Sessions table
CREATE TABLE Sessions (
    s_id SERIAL PRIMARY KEY,
    m_id INTEGER REFERENCES Members(m_id),
    t_id INTEGER REFERENCES Trainers(t_id),
    date DATE,
    start_time TIME,
    end_time TIME
);

-- Create Admins table
CREATE TABLE Admins (
    a_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create Complaints table
CREATE TABLE Complaints (
	c_id SERIAL PRIMARY KEY,
    m_id INTEGER REFERENCES Members(m_id),
    description TEXT
);

-- Create Payments table
CREATE TABLE Payments (
	p_id SERIAL PRIMARY KEY,
    m_id INTEGER REFERENCES Members(m_id),
    date DATE,
    processed BOOLEAN DEFAULT true,
	cost integer DEFAULT 50
);

-- Create Loyalty table
CREATE TABLE Loyalty (
    m_id INTEGER REFERENCES Members(m_id),
    points INTEGER,
    PRIMARY KEY (m_id)
);

-- Create Rooms table
CREATE TABLE Rooms (
    r_id SERIAL PRIMARY KEY,
    size INTEGER,
    name VARCHAR(255) NOT NULL
);

-- Create Equipment table
CREATE TABLE Equipment (
    e_id SERIAL PRIMARY KEY,
    r_id INTEGER REFERENCES Rooms(r_id),
    e_name VARCHAR(255),
    target_date DATE,
    last_fixed DATE
);


-- Create Bookings table
CREATE TABLE Bookings (
    b_id SERIAL PRIMARY KEY,
    r_id INTEGER REFERENCES Rooms(r_id),
    date DATE,
    start_time TIME,
    end_time TIME
);

-- Create Classes table
CREATE TABLE Classes (
    c_id SERIAL PRIMARY KEY,
    b_id INTEGER REFERENCES Bookings(b_id),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

-- Create MemberClasses table
CREATE TABLE MemberClasses (
    m_id INTEGER REFERENCES Members(m_id),
    c_id INTEGER REFERENCES Classes(c_id),
    registration_date DATE,
    PRIMARY KEY (m_id, c_id)
);