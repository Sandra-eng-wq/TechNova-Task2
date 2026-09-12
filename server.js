const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static("."));

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


// ====================
// START SERVER
// ====================

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});