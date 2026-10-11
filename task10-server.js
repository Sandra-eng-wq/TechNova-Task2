const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

require("dotenv").config();

const app = express();

const PORT = 3003;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


/* =========================
   DATABASE
========================= */

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});


/* =========================
   UPLOAD FOLDER
========================= */

const uploadFolder = path.join(
    __dirname,
    "task10-uploads"
);

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, {
        recursive: true
    });
}


/* =========================
   ALLOWED FILE TYPES
========================= */

const allowedMimeTypes = [
    "application/pdf",

    "image/jpeg",
    "image/png",
    "image/gif",

    "text/plain",

    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];


const allowedExtensions = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".txt",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx"
];


/* =========================
   MULTER
========================= */

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },

    filename: function (req, file, cb) {

        const extension =
            path.extname(file.originalname)
                .toLowerCase();

        const uniqueName =
            crypto.randomUUID() + extension;

        cb(null, uniqueName);
    }
});


const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const extension =
            path.extname(file.originalname)
                .toLowerCase();

        if (
            allowedMimeTypes.includes(file.mimetype) &&
            allowedExtensions.includes(extension)
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Invalid file type. Allowed files: PDF, images, TXT, Word and Excel files."
                )
            );
        }
    }
});


/* =========================
   AUTHENTICATION
========================= */

function requireLogin(req, res, next) {

    if (!req.session.task10UserId) {

        return res.status(401).json({
            error: "You must be logged in."
        });
    }

    next();
}


/* =========================
   REGISTER
========================= */

app.post(
    "/task10/api/register",
    async (req, res) => {

        const {
            username,
            email,
            password
        } = req.body;

        if (
            !username ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                error: "Please fill in all fields."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must contain at least 6 characters."
            });
        }

        try {

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const result=
                await pool.query(
                    `INSERT INTO task10_users
                    (username, email, password)
                    VALUES ($1, $2, $3)
                    RETURNING id, username, email`,
                    [
                        username,
                        email,
                        hashedPassword
                    ]
                );

            res.status(201).json({
                message: "Registration successful.",
                user: result.rows[0]
            });

        } catch (error) {

            console.error(error);

            if (error.code === "23505") {

                return res.status(400).json({
                    error: "Username or email already exists."
                });
            }

            res.status(500).json({
                error: "Unable to register."
            });
        }
    }
);


/* =========================
   LOGIN
========================= */

app.post(
    "/task10/api/login",
    async (req, res) => {

        const {
            username,
            password
        } = req.body;

        if (
            !username ||
            !password
        ) {
            return res.status(400).json({
                error: "Please fill in all fields."
            });
        }

        try {

            const result =
                await pool.query(
                    `SELECT *
                     FROM task10_users
                     WHERE username = $1`,
                    [username]
                );

            if (result.rows.length === 0) {

                return res.status(401).json({
                    error: "Invalid username or password."
                });
            }

            const user =
                result.rows[0];

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

            req.session.task10UserId =
                user.id;

            req.session.task10Username =
                user.username;

            res.json({
                message: "Login successful."
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Unable to login."
            });
        }
    }
);


/* =========================
   LOGOUT
========================= */

app.post(
    "/task10/api/logout",
    (req, res) => {

        req.session.destroy(
            function (error) {

                if (error) {

                    return res.status(500).json({
                        error: "Unable to logout."
                    });
                }

                res.json({
                    message: "Logout successful."
                });
            }
        );
    }
);


/* =========================
   CURRENT USER
========================= */

app.get(
    "/task10/api/me",
    requireLogin,
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `SELECT id, username, email
                     FROM task10_users
                     WHERE id = $1`,
                    [
                        req.session.task10UserId
                    ]
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
    }
);


/* =========================
   UPLOAD FILE
========================= */

app.post(
    "/task10/api/files",
    requireLogin,
    function (req, res) {

        upload.single("file")(
            req,
            res,
            async function (error) {

                if (error) {

                    if (
                        error instanceof
                        multer.MulterError
                    ) {

                        if (
                            error.code ===
                            "LIMIT_FILE_SIZE"
                        ) {

                            return res.status(400).json({
                                error: "File is too large. Maximum size is 5 MB."
                            });
                        }

                        return res.status(400).json({
                            error: "File upload failed."
                        });
                    }

                    return res.status(400).json({
                        error: error.message
                    });
                }

                if (!req.file) {

                    return res.status(400).json({
                        error: "Please select a file."
                    });
                }

                try {

                    const result =
                        await pool.query(
                            `INSERT INTO task10_files
                            (
                                user_id,
                                original_name,
                                stored_name,
                                file_path,
                                mime_type,
                                file_size
                            )
                            VALUES
                            ($1, $2, $3, $4, $5, $6)
                            RETURNING *`,
                            [
                                req.session.task10UserId,
                                req.file.originalname,
                                req.file.filename,
                                req.file.path,
                                req.file.mimetype,
                                req.file.size
                            ]
                        );

                    res.status(201).json({
                        message: "File uploaded successfully.",
                        file: result.rows[0]
                    });

                } catch (databaseError) {

                    console.error(
                        databaseError
                    );

                    if (req.file) {

                        fs.unlink(
                            req.file.path,
                            function () {}
                        );
                    }

                    res.status(500).json({
                        error: "Unable to save file information."
                    });
                }
            }
        );
    }
);


/* =========================
   GET MY FILES
========================= */

app.get(
    "/task10/api/files",
    requireLogin,
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `SELECT
                        id,
                        original_name,
                        mime_type,
                        file_size,
                        uploaded_at
                     FROM task10_files
                     WHERE user_id = $1
                     ORDER BY uploaded_at DESC`,
                    [
                        req.session.task10UserId
                    ]
                );

            res.json(result.rows);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Unable to load files."
            });
        }
    }
);


/* =========================
   DOWNLOAD FILE
========================= */

app.get(
    "/task10/api/files/:id/download",
    requireLogin,
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `SELECT *
                     FROM task10_files
                     WHERE id = $1
                     AND user_id = $2`,
                    [
                        req.params.id,
                        req.session.task10UserId
                    ]
                );

            if (result.rows.length === 0) {

                return res.status(404).json({
                    error: "File not found."
                });
            }

            const file =
                result.rows[0];

            if (
                !fs.existsSync(file.file_path)
            ) {

                return res.status(404).json({
                    error: "The physical file could not be found."
                });
            }

            res.download(
                file.file_path,
                file.original_name
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Unable to download file."
            });
        }
    }
);


/* =========================
   DELETE FILE
========================= */

app.delete(
    "/task10/api/files/:id",
    requireLogin,
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `SELECT *
                     FROM task10_files
                     WHERE id = $1
                     AND user_id = $2`,
                    [
                        req.params.id,
                        req.session.task10UserId
                    ]
                );

            if (result.rows.length === 0) {

                return res.status(404).json({
                    error: "File not found."
                });
            }

            const file =
                result.rows[0];

            await pool.query(
                `DELETE FROM task10_files
                 WHERE id = $1
                 AND user_id = $2`,
                [
                    req.params.id,
                    req.session.task10UserId
                ]
            );

            if (
                fs.existsSync(file.file_path)
            ) {

                fs.unlink(
                    file.file_path,
                    function (error) {

                        if (error) {
                            console.error(error);
                        }
                    }
                );
            }

            res.json({
                message: "File deleted successfully."
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Unable to delete file."
            });
        }
    }
);


/* =========================
   DASHBOARD PROTECTION
========================= */

app.get(
    "/task10/task10-dashboard.html",
    requireLogin,
    function (req, res) {

        res.sendFile(
            path.join(
                __dirname,
                "task10-dashboard.html"
            )
        );
    }
);


/* =========================
   STATIC FILES
========================= */

app.use(
    "/task10",
    express.static(__dirname)
);


/* =========================
   SERVER
========================= */

app.listen(
    PORT,
    function () {

        console.log(
            "Task 10 server is running on http://localhost:3003"
        );
    }
);