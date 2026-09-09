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

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
