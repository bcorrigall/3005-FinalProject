-- verify member
SELECT * 
FROM members
WHERE name = 'John Smith' AND password = `0000`;

-- register member
INSERT INTO member (name, password) VALUES 
('Thomas Grimwald', '1234');
ON CONFLICT DO NOTHING
RETURNING m_id INTO lastInsertedMId;

INSERT INTO Loyalty (m_id) VALUES 
(${lastInsertedMId})
ON CONFLICT DO NOTHING;

INSERT INTO Payments (m_id) VALUES 
(${lastInsertedMId})
ON CONFLICT DO NOTHING;

-- get all members in a class and the class details 
SELECT * 
FROM Classes 
JOIN MemberClasses ON Classes.c_id = MemberClasses.c_id 
JOIN Members ON MemberClasses.m_id = Members.m_id 
WHERE Classes.c_id = 1;

-- get all trainers with which a member has a session
SELECT * 
FROM Sessions 
JOIN Trainers ON Sessions.t_id = Trainers.t_id 
WHERE Sessions.m_id = 1;

-- delete goal
DELETE FROM Goals 
WHERE g_id = 1;

-- toggle a payment to paid or unpaid (true or false)
UPDATE Payments
SET processed = CASE WHEN processed = TRUE THEN FALSE ELSE TRUE END
WHERE m_id = 1;

-- we have a lot more queries in the queries.js file, go check it out!