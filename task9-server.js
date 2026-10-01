const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());


// ==============================
// SESSION
// ==============================

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false
        }
    })
);


// ==============================
// DATABASE
// ==============================

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});


// ==============================
// TASK 9 - REGISTER
// ==============================

app.post("/task9/api/register", async (req, res) => {

    const {
        username,
        email,
        password,
        role
    } = req.body;

    if (!username || !email || !password || !role) {

        return res.status(400).json({
            error: "Please fill in all fields."
        });

    }

    if (role !== "admin" && role !== "employee") {

        return res.status(400).json({
            error: "Invalid role."
        });

    }

    try {

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO task9_users
            (username, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role`,
            [
                username,
                email,
                hashedPassword,
                role
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error(error);

        if (error.code === "23505") {

            return res.status(400).json({
                error: "Username or email already exists."
            });

        }

        res.status(500).json({
            error: "Something went wrong while creating the user."
        });

    }

});


// ==============================
// TASK 9 - LOGIN
// ==============================

app.post("/task9/api/login", async (req, res) => {

    const {
        username,
        password
    } = req.body;

    if (!username || !password) {

        return res.status(400).json({
            error: "Please fill in all fields."
        });

    }

    try {

        const result = await pool.query(
            `SELECT *
            FROM task9_users
            WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {

            return res.status(401).json({
                error: "Invalid username or password."
            });

        }

        const user = result.rows[0];

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {

            return res.status(401).json({
                error: "Invalid username or password."
            });

        }

        req.session.task9UserId = user.id;
        req.session.task9Username = user.username;
        req.session.task9Role = user.role;

        res.json({
            message: "Login successful.",
            role: user.role
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Something went wrong while logging in."
        });

    }

});


// ==============================
// TASK 9 - LOGOUT
// ==============================

app.post("/task9/api/logout", (req, res) => {

    req.session.destroy(function(error) {

        if (error) {

            return res.status(500).json({
                error: "Unable to logout."
            });

        }

        res.json({
            message: "Logout successful."
        });

    });

});


// ==============================
// TASK 9 - REQUIRE LOGIN
// ==============================

function task9RequireLogin(req, res, next) {

    if (!req.session.task9UserId) {

        return res.status(401).json({
            error: "You must be logged in."
        });

    }

    next();

}


// ==============================
// TASK 9 - REQUIRE ADMIN
// ==============================

function task9RequireAdmin(req, res, next) {

    if (!req.session.task9UserId) {

        return res.status(401).json({
            error: "You must be logged in."
        });

    }

    if (req.session.task9Role !== "admin") {

        return res.status(403).json({
            error: "Access denied. Administrator permission required."
        });

    }

    next();

}


// ==============================
// TASK 9 - REQUIRE EMPLOYEE
// ==============================

function task9RequireEmployee(req, res, next) {

    if (!req.session.task9UserId) {

        return res.status(401).json({
            error: "You must be logged in."
        });

    }

    if (req.session.task9Role !== "employee") {

        return res.status(403).json({
            error: "Access denied. Employee permission required."
        });

    }

    next();

}


// ==============================
// TASK 9 - CURRENT USER
// ==============================

app.get(
    "/task9/api/me",
    task9RequireLogin,
    async (req, res) => {

        try {

            const result = await pool.query(
                `SELECT id, username, email, role
                FROM task9_users
                WHERE id = $1`,
                [req.session.task9UserId]
            );

            if (result.rows.length === 0) {

                return res.status(404).json({
                    error: "User not found."
                });

            }

            res.json(result.rows[0]);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Something went wrong."
            });

        }

    }
);


// ==============================
// TASK 9 - ADMIN DATA
// ==============================

app.get(
    "/task9/api/admin-data",
    task9RequireAdmin,
    async (req, res) => {

        try {

            const result = await pool.query(
                `SELECT id, username, email, role
                FROM task9_users
                ORDER BY id ASC`
            );

            res.json(result.rows);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Unable to load user data."
            });

        }

    }
);


// ==============================
// TASK 9 - EMPLOYEE DATA
// ==============================

app.get(
    "/task9/api/employee-data",
    task9RequireEmployee,
    async (req, res) => {

        try {

            const result = await pool.query(
                `SELECT id, username, email, role
                FROM task9_users
                WHERE id = $1`,
                [req.session.task9UserId]
            );

            if (result.rows.length === 0) {

                return res.status(404).json({
                    error: "User not found."
                });

            }

            res.json(result.rows[0]);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Unable to load employee data."
            });

        }

    }
);


// ==============================
// TASK 9 - ADMIN PAGE
// ==============================

app.get(
    "/task9/admin.html",
    task9RequireAdmin,
    (req, res) => {

        res.sendFile(
            __dirname + "/task9-admin.html"
        );

    }
);


// ==============================
// TASK 9 - EMPLOYEE PAGE
// ==============================

app.get(
    "/task9/employee.html",
    task9RequireEmployee,
    (req, res) => {

        res.sendFile(
            __dirname + "/task9-employee.html"
        );

    }
);


// ==============================
// STATIC FILES
// ==============================

app.use(
    "/task9",
    express.static(__dirname)
);


// ==============================
// START SERVER
// ==============================

app.listen(3001, () => {

    console.log(
        "Task 9 server is running on http://localhost:3001"
    );

});