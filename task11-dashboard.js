let currentUser = null;
let clients = [];
let users = [];
let projects = [];


/* =========================
   INITIAL LOAD
========================= */

async function loadDashboard() {

    try {

        const meResponse =
            await fetch("/task11/api/me", {
                credentials: "include"
            });

        if (!meResponse.ok) {

            window.location.href =
                "/task11/task11-login.html";

            return;
        }

        currentUser =
            await meResponse.json();

        document.getElementById(
            "current-username"
        ).textContent = currentUser.username;

        document.getElementById(
            "current-role"
        ).textContent = currentUser.role;


        if (currentUser.role === "admin") {

            document
                .getElementById("admin-section")
                .classList.remove("hidden");

            await loadClients();
            await loadUsers();
        }


        await loadProjects();

    } catch (error) {

        console.error(error);

        document.getElementById(
            "dashboard-message"
        ).textContent =
            "Unable to load dashboard.";
    }
}


/* =========================
   CLIENTS
========================= */

async function loadClients() {

    const response =
        await fetch("/task11/api/clients", {
            credentials: "include"
        });

    if (!response.ok) {
        return;
    }

    clients = await response.json();

    const select =
        document.getElementById("project-client");

    select.innerHTML =
        `<option value="">No Client</option>`;

    clients.forEach(function (client) {

        const option =
            document.createElement("option");

        option.value = client.id;

        option.textContent =
            client.name +
            (client.company
                ? " - " + client.company
                : "");

        select.appendChild(option);
    });


    const clientList =
        document.getElementById("client-list");

    clientList.innerHTML = "";

    clients.forEach(function (client) {

        const div =
            document.createElement("div");

        div.className = "list-item";

        div.innerHTML = `
            <strong>${client.name}</strong>
            <span>${client.company || ""}</span>
            <span>${client.email || ""}</span>
            <button onclick="editClient(${client.id})">
                Edit
            </button>
            <button onclick="deleteClient(${client.id})">
                Delete
            </button>
        `;

        clientList.appendChild(div);
    });
}

document.getElementById("client-form")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const id =document.getElementById("client-id").value;

        const data = {

            name:
                document.getElementById(
                    "client-name"
                ).value,

            email:
                document.getElementById(
                    "client-email"
                ).value,

            company:
                document.getElementById(
                    "client-company"
                ).value
        };


        const url = id
            ? `/task11/api/clients/${id}`
            : "/task11/api/clients";

        const method = id
            ? "PUT"
            : "POST";


        const response =
            await fetch(url, {

                method,

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify(data)
            });


        const result =
            await response.json();


        if (!response.ok) {

            alert(result.error);

            return;
        }


        resetClientForm();

        await loadClients();
        await loadProjects();
    });


function editClient(id) {

    const client =
        clients.find(function (item) {
            return item.id === id;
        });

    if (!client) {
        return;
    }

    document.getElementById(
        "client-id"
    ).value = client.id;

    document.getElementById(
        "client-name"
    ).value = client.name;

    document.getElementById(
        "client-email"
    ).value = client.email || "";

    document.getElementById(
        "client-company"
    ).value = client.company || "";
}


async function deleteClient(id) {

    if (!confirm("Delete this client?")) {
        return;
    }

    const response =
        await fetch(
            `/task11/api/clients/${id}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );

    const result =
        await response.json();

    if (!response.ok) {

        alert(result.error);

        return;
    }

    await loadClients();
    await loadProjects();
}


function resetClientForm() {

    document.getElementById(
        "client-form"
    ).reset();

    document.getElementById(
        "client-id"
    ).value = "";
}


document
    .getElementById("cancel-client")
    .addEventListener(
        "click",
        resetClientForm
    );


/* =========================
   USERS
========================= */

async function loadUsers() {

    const response =
        await fetch("/task11/api/users", {
            credentials: "include"
        });

    if (!response.ok) {
        return;
    }

    users = await response.json();

    const memberSelect =
        document.getElementById(
            "project-members"
        );

    memberSelect.innerHTML = "";

    users
        .filter(function (user) {
            return user.role === "team_member";
        })
        .forEach(function (user) {

            const option =
                document.createElement("option");

            option.value = user.id;

            option.textContent =
                user.username;

            memberSelect.appendChild(option);
        });


    const usersList =
        document.getElementById(
            "users-list"
        );

    usersList.innerHTML = "";

    users.forEach(function (user) {

        const div =
            document.createElement("div");

        div.className = "list-item";

        div.innerHTML = `
            <strong>${user.username}</strong>
            <span>${user.email}</span>
            <span>${user.role}</span>
        `;

        usersList.appendChild(div);
    });
}


/* =========================
   PROJECTS
========================= */

async function loadProjects() {

    const response =
        await fetch("/task11/api/projects", {
            credentials: "include"
        });

    if (!response.ok) {

        document.getElementById(
            "projects-list"
        ).textContent =
            "Unable to load projects.";

        return;
    }

    projects = await response.json();

    renderProjects();
    updateStatistics();
}


function renderProjects() {

    const container =
        document.getElementById(
            "projects-list"
        );

    container.innerHTML = "";


    if (projects.length === 0) {

        container.textContent =
            "No projects available.";

        return;
    }


    projects.forEach(function (project) {

        const card =
            document.createElement("div");

        card.className = "project-card";


        const title =
            document.createElement("h3");

        title.textContent =
            project.name;


        const description =
            document.createElement("p");

        description.textContent =
            project.description ||
            "No description";


        const client =
            document.createElement("p");

        client.innerHTML =
            `<strong>Client:</strong> ${
                project.client_name || "None"
            }`;


        const status =
            document.createElement("p");

        status.innerHTML =
            `<strong>Status:</strong> ${
                project.status
            }`;


        const progress =
            document.createElement("p");

        progress.innerHTML =
            `<strong>Progress:</strong> ${
                project.progress
            }%`;


        const members =
            document.createElement("p");

        members.innerHTML =
            `<strong>Assigned Members:</strong> ${
                project.assigned_members ||
                "None"
            }`;


        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(client);
        card.appendChild(status);
        card.appendChild(progress);
        card.appendChild(members);


        if (currentUser.role === "admin") {

            const editButton =
                document.createElement("button");

            editButton.textContent =
                "Edit";

            editButton.onclick =
                function () {
                    editProject(project.id);
                };


            const deleteButton =
                document.createElement("button");

            deleteButton.textContent =
                "Delete";

            deleteButton.onclick =
                function () {
                    deleteProject(project.id);
                };


            card.appendChild(editButton);
            card.appendChild(deleteButton);

        } else {

            const updateTitle =
                document.createElement("h4");

            updateTitle.textContent =
                "Update My Project";

            card.appendChild(updateTitle);


            const statusSelect =
                document.createElement("select");

            [
                "Not Started",
                "In Progress",
                "Completed",
                "On Hold"
            ].forEach(function (status) {

                const option =
                    document.createElement("option");

                option.value = status;
                option.textContent = status;

                if (status === project.status) {
                    option.selected = true;
                }

                statusSelect.appendChild(option);
            });


            const progressInput =
                document.createElement("input");

            progressInput.type = "number";
            progressInput.min = 0;
            progressInput.max = 100;
            progressInput.value =
                project.progress;


            const updateButton =
                document.createElement("button");

            updateButton.textContent =
                "Update Status & Progress";


            updateButton.onclick =
                async function () {

                    const response =
                        await fetch(
                            `/task11/api/projects/${project.id}/progress`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                credentials: "include",

                                body: JSON.stringify({
                                    status:
                                        statusSelect.value,

                                    progress:
                                        Number(
                                            progressInput.value
                                        )
                                })
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        alert(result.error);

                        return;
                    }


                    await loadProjects();
                };


            card.appendChild(statusSelect);
            card.appendChild(progressInput);
            card.appendChild(updateButton);
        }


        container.appendChild(card);
    });
}


/* =========================
   CREATE / EDIT PROJECT
========================= */

document
    .getElementById("project-form")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const projectId =
                document.getElementById(
                    "project-id"
                ).value;


            const memberSelect =
                document.getElementById(
                    "project-members"
                );


            const memberIds =
                Array.from(
                    memberSelect.selectedOptions
                ).map(function (option) {
                    return Number(option.value);
                });


            const data = {

                name:
                    document.getElementById(
                        "project-name"
                    ).value,

                description:
                    document.getElementById(
                        "project-description"
                    ).value,

                status:
                    document.getElementById(
                        "project-status"
                    ).value,

                progress:
                    Number(
                        document.getElementById(
                            "project-progress"
                        ).value
                    ),

                client_id:
                    document.getElementById(
                        "project-client"
                    ).value || null,

                member_ids:
                    memberIds
            };


            const url = projectId
                ? `/task11/api/projects/${projectId}`
                : "/task11/api/projects";


            const method = projectId
                ? "PUT"
                : "POST";


            const response =
                await fetch(url, {

                    method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify(data)
                });


            const result =
                await response.json();


            if (!response.ok) {

                alert(result.error);

                return;
            }


            resetProjectForm();

            await loadProjects();
        }
    );


function editProject(id) {

    const project =
        projects.find(function (item) {
            return item.id === id;
        });

    if (!project) {
        return;
    }


    document.getElementById(
        "project-id"
    ).value = project.id;


    document.getElementById(
        "project-name"
    ).value = project.name;


    document.getElementById(
        "project-description"
    ).value =
        project.description || "";


    document.getElementById(
        "project-status"
    ).value = project.status;


    document.getElementById(
        "project-progress"
    ).value = project.progress;


    document.getElementById(
        "project-client"
    ).value =
        project.client_id || "";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


async function deleteProject(id) {

    if (!confirm("Delete this project?")) {
        return;
    }


    const response =
        await fetch(
            `/task11/api/projects/${id}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );


    const results =
        await response.json();


    if (!response.ok) {

        alert(result.error);

        return;
    }


    await loadProjects();
}


function resetProjectForm() {

    document.getElementById(
        "project-form"
    ).reset();

    document.getElementById(
        "project-id"
    ).value = "";
}


/* =========================
   STATISTICS
========================= */

function updateStatistics() {

    document.getElementById(
        "total-projects"
    ).textContent =
        projects.length;


    document.getElementById(
        "in-progress-projects"
    ).textContent =
        projects.filter(function (project) {
            return project.status === "In Progress";
        }).length;


    document.getElementById(
        "completed-projects"
    ).textContent =
        projects.filter(function (project) {
            return project.status === "Completed";
        }).length;
}


/* =========================
   LOGOUT
========================= */

document
    .getElementById("logout-button")
    .addEventListener(
        "click",
        async function () {

            await fetch(
                "/task11/api/logout",
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            window.location.href =
                "/task11/task11-login.html";
        }
    );


/* =========================
   START
========================= */

loadDashboard();