-- Members table
INSERT INTO Members (name, password) VALUES
    ('John Smith', 0000),
    ('Jane Smith', '1111'),
    ('Bob Johnson', '2222'),
	('member', 'member');

-- Goals table
INSERT INTO Goals (m_id, description) VALUES
    (1, 'Lose 10 pounds by the end of the month'),
	(1, 'Obtain a black belt'),
    (2, 'Run 5 miles without stopping'),
    (3, 'Gain muscle mass in arms and chest');

-- Health table
INSERT INTO Health (m_id, height, weight, date) VALUES
    (1, 175.5, 160.2, '2023-01-15'),
	(1,175.5, 158, '2023-01-20'),
    (2, 162.3, 130.8, '2023-02-01'),
    (3, 180.0, 185.5, '2023-03-10');

-- Exercises table
INSERT INTO Exercises (m_id, date, body_group, description, start_time, end_time) VALUES
    (1, '2023-01-20', 'Cardio', 'Running on the treadmill', '08:00:00', '09:30:00'),
	(1, '2023-01-22', 'Flexibility', 'Yoga session', '10:00:00', '11:00:00'),
    (1, '2023-01-25', 'Strength', 'Deadlifts', '15:00:00', '16:00:00'),
    (1, '2023-02-10', 'Cardio', 'Swimming', '12:00:00', '13:00:00'),
    (1, '2023-02-17', 'Cardio', 'Rowing machine', '09:00:00', '10:00:00'),
    (1, '2023-03-20', 'Strength', 'Squats', '17:00:00', '18:00:00'),
    (1, '2023-03-22', 'Balance', 'Pilates', '08:00:00', '09:00:00'),
    (2, '2023-02-05', 'Strength', 'Weightlifting - Bench press', '10:00:00', '11:30:00'),
    (3, '2023-03-15', 'Cardio', 'Cycling', '16:00:00', '17:00:00');

-- Trainers table
INSERT INTO Trainers (name, password) VALUES
    ('Trainer A', 'trainerpass1'),
    ('Trainer B', 'trainerpass2'),
    ('Trainer C', 'trainerpass3'),
	('trainer', 'trainer');

-- Sessions table
INSERT INTO Sessions (m_id, t_id, date, start_time, end_time) VALUES
	(1, 1, '2023-01-25', '09:00:00', '10:00:00'),
    (2, 2, '2023-02-10', '11:00:00', '12:00:00'),
    (3, 3, '2023-03-20', '17:00:00', '18:00:00');

-- Admins table
INSERT INTO Admins (name, password) VALUES
    ('Admin X', '0000'),
    ('Admin Y', '1111'),
    ('Admin Z', '2222'),
	('admin', 'admin');

-- Complaints table
INSERT INTO Complaints (m_id, description) VALUES
	(1, 'The treadmill stops unexpectedly during the workout'),
    (1, 'Loud noise from the construction work is disturbing the exercise environment'),
    (1, 'The water cooler on the second floor has been out of service for a week'),
    (1, 'Equipment malfunction in the cardio area'),
    (2, 'Unsatisfactory cleanliness in the changing room'),
    (3, 'Issues with the ventilation system in the gym');

-- Payments table
INSERT INTO Payments (m_id, date, processed) VALUES
    (1, '2023-01-05', FALSE),
    (2, '2023-02-15', FALSE),
    (3, '2023-03-25', TRUE);

-- Loyalty table
INSERT INTO Loyalty (m_id, points) VALUES
    (1, 50),
    (2, 30),
    (3, 75);

-- Rooms table
INSERT INTO Rooms (size, name) VALUES
    (50, 'Cardio Room'),
    (30, 'Weightlifting Room'),
    (50, 'Yoga Studio'),
	(25, 'Spinning Studio'),
    (40, 'Aerobics Hall'),
    (30, 'Pilates Room'),
    (10, 'Boxing Ring'),
    (35, 'Dance Studio'),
    (35, 'Crossfit Arena');

-- Equipment table
INSERT INTO Equipment (r_id, e_name, target_date, last_fixed) VALUES
    (1, 'Treadmill', '2023-01-10', '2023-02-01'),
    (2, 'Bench Press', '2023-02-05', '2023-03-15'),
    (3, 'Yoga Mats', '2023-03-20', '2023-04-05');

-- Bookings table
INSERT INTO Bookings (r_id, date, start_time, end_time) VALUES
    (1, '2023-01-15', '08:00:00', '09:00:00'),
    (2, '2023-02-20', '10:00:00', '11:00:00'),
    (3, '2023-03-25', '16:00:00', '17:00:00');

-- Classes table
INSERT INTO Classes (b_id, name, description) VALUES
    (1, 'Morning Cardio Blast', 'Cardiovascular Health and Endurence'),
    (2, 'Powerlifting Basics', 'Muscle Hyperthrophy'),
    (3, 'Yoga for Beginners', 'Stretch and find your spririt');

-- MemberClasses table
INSERT INTO MemberClasses (m_id, c_id, registration_date) VALUES
    (1, 1, '2023-01-10'),
    (2, 2, '2023-02-18'),
    (3, 3, '2023-03-22'); 