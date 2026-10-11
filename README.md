TechNova — Full-Stack Web Application

1. Project Overview

TechNova is a full-stack web application developed as part of the VOLTIX Full-Stack Internship Program 2026.

The project combines a responsive company website with backend APIs, database integration, authentication, service management, customer requests, file uploads, and project management features.

2. Main Features

* Task 1: Responsive company landing page.
* Task 2: Contact form with input validation and database storage.
* Task 3: Admin panel for managing company services.
* Task 4: User registration and login.
* Task 5: Customer dashboard and profile management.
* Task 6: Service management with updates reflected on the public website.
* Task 7: Customer service requests and status management.
* Task 8: Search and filter functionality for service requests.
* Task 9: Role-Based Access Control (RBAC) for administrators and employees.
* Task 10: File upload functionality.
* Task 11: Client project management platform with database integration.
* Task 12: Integration and organization of the previous tasks into a full-stack project.

3. Technologies Used

Frontend

* HTML5
* CSS3
* JavaScript

Backend

* Node.js
* Express.js

Database

* PostgreSQL
* pg

Additional Tools and Libraries

* bcrypt
* express-session
* CORS
* dotenv
* Multer
* Visual Studio Code
* npm

 4. Project Structure

The project is organized into the following files and modules.

Main Application — Tasks 1–8

Frontend

* index.html — Main website page.
* style.css — Main website styling.
* script.js — Main frontend functionality.

Admin and Services

* admin.html — Admin page.
* admin.js — Admin functionality.

Authentication

* register.html — User registration page.
* register.js — Registration functionality.
* register.css — Registration page styling.
* login.html — User login page.
* login.js — Login functionality.
* auth.css — Authentication styling.

Customer Dashboard

* dashboard.html — Customer dashboard.
* dashboard.js — Dashboard functionality.
* dashboard.css — Dashboard styling.

Customer Requests and Search

* request.html — Customer request page.
* request.js — Request functionality.
* company-request.html — Company request management page.
* company-request.js — Request management functionality.
* company-request.css — Request management styling.
* company-search.html — Request search page.
* company-search.js — Search and filtering functionality.
* company-search.css — Search page styling.

Backend and Database

* server.js — Main backend server.
* database.sql — Database setup.

Task 9 — Role-Based Access Control

* task9-server.js — Backend server.
* task9-admin.html and task9-admin.js — Admin interface and functionality.
* task9-employee.html and task9-employee.js — Employee interface and functionality.
* task9-login.html and task9-login.js — Login interface and functionality.
* task9-register.html and task9-register.js — Registration interface and functionality.
* task9.css — Styling.
* task9-database.sql — Database setup.

Task 10 — File Upload

* task10-server.js — Backend server.
* task10-dashboard.html and task10-dashboard.js — Dashboard interface and functionality.
* task10-login.html and task10-login.js — Login interface and functionality.
* task10-register.html and task10-register.js — Registration interface and functionality.
* task10.css — Styling.
* task10-database.sql — Database setup.

Task 11 — Client Project Management Platform

* task11-server.js — Backend server.
* task11-dashboard.html — Dashboard page.
* task11-login.html and task11-login.js — Login interface and functionality.
* task11-register.html and task11-register.js — Registration interface and functionality.
* task11.css — Styling.
* database.sql — Database setup, if used by this module.

Project Configuration

* package.json — Project metadata and dependencies.
* package-lock.json — Dependency version information, if present.
* .gitignore — Specifies files and folders excluded from Git.
* README.md — Project documentation.

5. Requirements

Before running the application, make sure you have:

* Node.js and npm installed.
* PostgreSQL installed and running.
* A configured PostgreSQL database.
* The project dependencies installed.

6. Setup and Installation

1. Open the project folder in Visual Studio Code.
2. Open the terminal in the project folder.
3. Install the dependencies:

npm install

4. Create a .env file in the project root and configure the database connection and session secret according to the server code.
    Example:

DB_USER=your_postgres_username
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_postgres_password
DB_PORT=5432
SESSION_SECRET=your_random_session_secret

5. Make sure the database and required tables are configured using the provided SQL files.

Replace the example values with your actual local configuration. Do not publish database passwords or other secrets.

7. How to Run the Application

Run each server in a separate terminal when using its corresponding module.

Main Application — Port 3000

Start the main server:

node server.js

Open:

http://localhost:3000

Task 9 — Role-Based Access Control — Port 3001

Start the Task 9 server:

node task9-server.js

Registration page:

http://localhost:3001/task9/task9-register.html

Login page:

http://localhost:3001/task9/task9-login.html

Task 11 — Client Project Management Platform — Port 3002

Start the Task 11 server:

node task11-server.js

Open the application:

http://localhost:3002

Task 10 — File Upload — Port 3003

Start the Task 10 server:

node task10-server.js

Open:

http://localhost:3003/task10-register.html

Keep each server running in its own terminal while using the corresponding module.

8. Database Integration

PostgreSQL is used to store and manage application data, including contact inquiries, services, user accounts, service requests, and module-specific project data.

Make sure the database configuration in .env matches the database settings expected by each server.

9. Submission Checklist

* Include the project source files and required SQL files.
* Include this README.md file.
* Ensure the required dependencies are listed in package.json.
* Exclude node_modules from the submission ZIP.
* Exclude .env and all real passwords or credentials.
* Use the ZIP filename required by the internship instructions.

10. Conclusion

TechNova demonstrates the development of a full-stack web application using frontend technologies, Node.js, Express.js, and PostgreSQL. The project includes authentication, role-based access control, CRUD operations, search and filtering, file uploads, and project management features.