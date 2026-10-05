const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const session = require("express-session");
require("dotenv").config();

const app = express();

app.use(express.json());

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


/* =========================
   AUTHENTICATION
========================= */

app.post("/task11/api/register", async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({
            error: "Please fill in all fields."
        });
    }

    if (role !== "admin" && role !== "team_member") {
        return res.status(400).json({
            error: "Invalid role."
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO task11_users
            (username, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role`,
            [username, email, hashedPassword, role]
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
            error: "Unable to register user."
        });
    }
});


app.post("/task11/api/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "Please fill in all fields."
        });
    }

    try {
        const result = await pool.query(
            `SELECT *
             FROM task11_users
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

        req.session.task11UserId = user.id;
        req.session.task11Role = user.role;

        res.json({
            message: "Login successful.",
            role: user.role
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Unable to login."
        });
    }
});


app.post("/task11/api/logout", (req, res) => {
    req.session.destroy(function (error) {
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


/* =========================
   AUTHORIZATION
========================= */

function requireLogin(req, res, next) {
    if (!req.session.task11UserId) {
        return res.status(401).json({
            error: "You must be logged in."
        });
    }

    next();
}


function requireAdmin(req, res, next) {
    if (!req.session.task11UserId) {
        return res.status(401).json({
            error: "You must be logged in."
        });
    }

    if (req.session.task11Role !== "admin") {
        return res.status(403).json({
            error: "Access denied. Administrator permission required."
        });
    }

    next();
}


/* =========================
   CURRENT USER
========================= */

app.get("/task11/api/me", requireLogin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, username, email, role
             FROM task11_users
             WHERE id = $1`,
            [req.session.task11UserId]
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
            error: "Unable to load user."
        });
    }
});


/* =========================
   USERS
========================= */

app.get("/task11/api/users", requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, username, email, role
             FROM task11_users
             ORDER BY id ASC`
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Unable to load users."
        });
    }
});


/* =========================
   CLIENTS
========================= */

app.get("/task11/api/clients", requireLogin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, company
             FROM task11_client
             ORDER BY id DESC`
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Unable to load clients."
        });
    }
});


app.post("/task11/api/clients", requireAdmin, async (req, res) => {
    const { name, email, company } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "Client name is required."
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO task11_client
            (name, email, company)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, company`,
            [name, email || null, company || null]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Unable to create client."
        });
    }
});


app.put("/task11/api/clients/:id", requireAdmin, async (req, res) => {
    const { name, email, company } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "Client name is required."
        });
    }

    try {
        const result = await pool.query(
            `UPDATE task11_client
             SET name = $1,
                 email = $2,
                 company = $3
             WHERE id = $4
             RETURNING id, name, email, company`,
            [
                name,
                email || null,
                company || null,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Client not found."
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Unable to update client."
        });
    }
});


app.delete("/task11/api/clients/:id", requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM task11_client
             WHERE id = $1
             RETURNING id`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Client not found."
            });
        }

        res.json({
            message: "Client deleted."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Unable to delete client."
        });
    }
});


/* =========================
   PROJECTS
========================= */

app.get("/task11/api/projects", requireLogin, async (req, res) => {
    try {
        let result;

        if (req.session.task11Role === "admin") {

            result = await pool.query(
                `SELECT
                    p.id,
                    p.name,
                    p.description,
                    p.status,
                    p.progress,
                    p.client_id,
                    c.name AS client_name,
                    COALESCE(
                        STRING_AGG(
                            u.username,
                            ', '
                            ORDER BY u.username
                        ),
                        ''
                    ) AS assigned_members
                 FROM task11_project p
                 LEFT JOIN task11_client c
                    ON p.client_id = c.id
                 LEFT JOIN task11_project_members pm
                    ON p.id = pm.project_id
                 LEFT JOIN task11_users u
                    ON pm.user_id = u.id
                 GROUP BY
                    p.id,
                    c.name
                 ORDER BY p.id DESC`
            );

        } else {

            result = await pool.query(
                `SELECT
                    p.id,
                    p.name,
                    p.description,
                    p.status,
                    p.progress,
                    p.client_id,
                    c.name AS client_name,
                    COALESCE(
                        STRING_AGG(
                            u.username,
                            ', '
                            ORDER BY u.username
                        ),
                        ''
                    ) AS assigned_members
                 FROM task11_project p
                 LEFT JOIN task11_client c
                    ON p.client_id = c.id
                 INNER JOIN task11_project_members my_pm
                    ON p.id = my_pm.project_id
                    AND my_pm.user_id = $1
                 LEFT JOIN task11_project_members pm
                    ON p.id = pm.project_id
                 LEFT JOIN task11_users u
                    ON pm.user_id = u.id
                 GROUP BY
                    p.id,
                    c.name
                 ORDER BY p.id DESC`,
                [req.session.task11UserId]
            );
        }

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Unable to load projects."
        });
    }
});


app.post("/task11/api/projects", requireAdmin, async (req, res) => {
    const {
        name,
        description,
        status,
        progress,
        client_id,
        member_ids
    } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "Project name is required."
        });
    }

    const allowedStatuses = [
        "Not Started",
        "In Progress",
        "Completed",
        "On Hold"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid project status."
        });
    }

    if (
        !Number.isInteger(Number(progress)) ||
        Number(progress) < 0 ||
        Number(progress) > 100
    ) {
        return res.status(400).json({
            error: "Progress must be between 0 and 100."
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const projectResult = await client.query(
            `INSERT INTO task11_project
            (
                name,
                description,
                status,
                progress,
                client_id
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                name,
                description || null,
                status,
                Number(progress),
                client_id || null
            ]
        );

        const projectId = projectResult.rows[0].id;

        if (Array.isArray(member_ids)) {
            for (const memberId of member_ids) {

                await client.query(
                    `INSERT INTO task11_project_members
                    (project_id, user_id)
                    SELECT $1, id
                    FROM task11_users
                    WHERE id = $2
                    AND role = 'team_member'
                    ON CONFLICT DO NOTHING`,
                    [projectId, memberId]
                );
            }
        }

        await client.query("COMMIT");

        res.status(201).json(projectResult.rows[0]);

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            error: "Unable to create project."
        });

    } finally {
        client.release();
    }
});


app.put("/task11/api/projects/:id", requireAdmin, async (req, res) => {
    const {
        name,
        description,
        status,
        progress,
        client_id,
        member_ids
    } = req.body;

    const allowedStatuses = [
        "Not Started",
        "In Progress",
        "Completed",
        "On Hold"
    ];

    if (!name) {
        return res.status(400).json({
            error: "Project name is required."
        });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid project status."
        });
    }

    if (
        !Number.isInteger(Number(progress)) ||
        Number(progress) < 0 ||
        Number(progress) > 100
    ) {
        return res.status(400).json({
            error: "Progress must be between 0 and 100."
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const projectResult = await client.query(
            `UPDATE task11_project
             SET name = $1,
                 description = $2,
                 status = $3,
                 progress = $4,
                 client_id = $5,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING *`,
            [
                name,
                description || null,
                status,
                Number(progress),
                client_id || null,
                req.params.id
            ]
        );

        if (projectResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "Project not found."
            });
        }

        await client.query(
            `DELETE FROM task11_project_members
             WHERE project_id = $1`,
            [req.params.id]
        );

        if (Array.isArray(member_ids)) {

            for (const memberId of member_ids) {

                await client.query(
                    `INSERT INTO task11_project_members
                    (project_id, user_id)
                    SELECT $1, id
                    FROM task11_users
                    WHERE id = $2
                    AND role = 'team_member'
                    ON CONFLICT DO NOTHING`,
                    [req.params.id, memberId]
                );
            }
        }

        await client.query("COMMIT");

        res.json(projectResult.rows[0]);

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            error: "Unable to update project."
        });

    } finally {
        client.release();
    }
});


app.delete("/task11/api/projects/:id", requireAdmin, async (req, res) => {
    try {

        const result = await pool.query(
            `DELETE FROM task11_project
             WHERE id = $1
             RETURNING id`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Project not found."
            });
        }

        res.json({
            message: "Project deleted."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Unable to delete project."
        });
    }
});


/* =========================
   TEAM MEMBER PROGRESS
========================= */

app.put(
    "/task11/api/projects/:id/progress",
    requireLogin,
    async (req, res) => {

        const { status, progress } = req.body;

        if (req.session.task11Role !== "team_member") {
            return res.status(403).json({
                error: "Only assigned team members can use this action."
            });
        }

        const allowedStatuses = [
            "Not Started",
            "In Progress",
            "Completed",
            "On Hold"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid status."
            });
        }

        if (
            !Number.isInteger(Number(progress)) ||
            Number(progress) < 0 ||
            Number(progress) > 100
        ) {
            return res.status(400).json({
                error: "Progress must be between 0 and 100."
            });
        }

        try {

            const result = await pool.query(
                `UPDATE task11_project p
                 SET status = $1,
                     progress = $2,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE p.id = $3
                 AND EXISTS (
                    SELECT 1
                    FROM task11_project_members pm
                    WHERE pm.project_id = p.id
                    AND pm.user_id = $4
                 )
                 RETURNING *`,
                [
                    status,
                    Number(progress),
                    req.params.id,
                    req.session.task11UserId
                ]
            );

            if (result.rows.length === 0) {
                return res.status(403).json({
                    error: "You are not assigned to this project."
                });
            }

            res.json(result.rows[0]);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Unable to update project progress."
            });
        }
    }
);


/* =========================
   DASHBOARD PROTECTION
========================= */

app.get(
    "/task11/task11-dashboard.html",
    requireLogin,
    (req, res) => {
        res.sendFile(
            __dirname + "/task11-dashboard.html"
        );
    }
);


/* =========================
   STATIC FILES
========================= */

app.use(
    "/task11",
    express.static(__dirname)
);


/* =========================
   SERVER
========================= */

app.listen(3002, () => {
    console.log(
        "Task 11 server is running on http://localhost:3002"
    );
});