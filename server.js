const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();
const bcrypt = require("bcrypt");
const session = require("express-session");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
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

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});


// ====================
// CONTACT - TASK 2
// ====================

app.post("/api/contact", async (req, res) => {

    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            error: "Please fill in all fields."
        });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return res.status(400).json({
            error: "Please enter a valid email address."
        });
    }

    try {

        await pool.query(
            `INSERT INTO inquiries (name, email, subject, message)
             VALUES ($1, $2, $3, $4)`,
            [name, email, subject, message]
        );

        res.status(201).json({
            message: "Your message has been sent successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Something went wrong while saving your message."
        });
    }
});


// ====================
// SERVICES - CREATE
// ====================

app.post("/api/services", async (req, res) => {

    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({
            error: "Title and description are required."
        });
    }

    try {

        const result = await pool.query(
            `INSERT INTO services (title, description)
             VALUES ($1, $2)
             RETURNING *`,
            [title, description]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Something went wrong while adding the service."
        });
    }
});


// ====================
// SERVICES - READ
// ====================

app.get("/api/services", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM services ORDER BY id ASC"
        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Something went wrong while loading services."
        });
    }
});


// ====================
// SERVICES - UPDATE
// ====================

app.put("/api/services/:id", async (req, res) => {

    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({
            error: "Title and description are required."
        });
    }

    try {

        const result = await pool.query(
            `UPDATE services
             SET title = $1, description = $2
             WHERE id = $3
             RETURNING *`,
            [title, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Service not found."
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Something went wrong while updating the service."
        });
    }
});


// ====================
// SERVICES - DELETE
// ====================

app.delete("/api/services/:id", async (req, res) => {

    const { id } = req.params;

    try {

        const result = await pool.query(
            `DELETE FROM services
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Service not found."
            });
        }

        res.json({
            message: "Service deleted successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Something went wrong while deleting the service."
        });
    }
});

app.post("/api/register", async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            error: "Please fill in all fields."
        });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, username, email`,
            [username, email, hashedPassword]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error(error);

        if (error.code === "23505") {
            return res.status(400).json({
                error: "Email already exists."
            });
        }

        res.status(500).json({
            error: "Something went wrong while creating your account."
        });
    }
});
app.post("/api/login", async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "Please fill in all fields."
        });
    }

    try {

        const result = await pool.query(
            `SELECT * FROM users
             WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Invalid username or password."
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid username or password."
            });
        }

        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({
            message: "Login successful."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Something went wrong while logging in."
        });
    }
});
function requireLogin(req, res, next) {

    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in."
        });
    }

    next();
}
app.get("/admin.html", requireLogin, (req, res) => {
    res.sendFile(__dirname + "/admin.html");
});
// ===============================
// Task 5 - Customer Dashboard
// ===============================


// Get current logged-in user
app.get("/api/me", requireLogin, async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT id, username, email
             FROM users
             WHERE id = $1`,
            [req.session.userId]
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
            error: "Something went wrong while getting your account information."
        });

    }

});


// Update current logged-in user
app.put("/api/me", requireLogin, async (req, res) => {

    const { username, email } = req.body;

    if (!username || !email) {

        return res.status(400).json({
            error: "Please fill in all fields."
        });

    }

    try {

        const result = await pool.query(
            `UPDATE users
             SET username = $1, email = $2
             WHERE id = $3
             RETURNING id, username, email`,
            [username, email, req.session.userId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "User not found."
            });

        }

        req.session.username =
            result.rows[0].username;

        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);

        if (error.code === "23505") {

            return res.status(400).json({
                error: "Email already exists."
            });

        }

        res.status(500).json({
            error: "Something went wrong while updating your information."
        });

    }

});


// Protect Dashboard page
app.get("/dashboard.html", requireLogin, (req, res) => {

    res.sendFile(__dirname + "/dashboard.html");

});
app.use(express.static("."));

// ====================
// START SERVER
// ====================

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});

