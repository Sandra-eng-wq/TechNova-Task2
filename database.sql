CREATE TABLE inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL
);
CREATE TABLE services (
 id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
);
INSERT INTO services (title, description)
VALUES
(
    'Web Development',
    'We build modern and responsive websites for businesses.'
),
(
    'Software Solutions',
    'We develop digital solutions designed to meet business needs.'
),
(
    'Digital Consulting',
    'We help businesses use technology to improve their digital presence.'
);
CREATE TABLE users(
    id serial PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL
);
CREATE TABLE service_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);