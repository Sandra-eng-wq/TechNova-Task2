async function loadAdminData() {
    try {
        const response = await fetch("/task9/api/admin-data", {
            credentials: "include"
        });

        const result = await response.json();

        if (!response.ok) {
            document.getElementById("users-body").innerHTML =
                `<tr><td colspan="3">${result.error}</td></tr>`;
            return;
        }

        const tbody = document.getElementById("users-body");

        tbody.innerHTML = "";

        result.forEach(function (user) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
            `;

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error(error);

        document.getElementById("users-body").innerHTML =
            `<tr><td colspan="3">Unable to load users.</td></tr>`;
    }
}
async function loadAdminProfile() {
    try {
        const response = await fetch("/task9/api/me", {
            credentials: "include"
        });

        const user = await response.json();

        if (!response.ok) {
            return;
        }

        document.getElementById("username").textContent = user.username;
        document.getElementById("email").textContent = user.email;
        document.getElementById("role").textContent = user.role;

    } catch (error) {
        console.error(error);
    }
}
loadAdminData();
loadAdminProfile();
document.getElementById("logout-button").addEventListener("click", async function () {
    try {
        const response = await fetch("/task9/api/logout", {
            method: "POST",
            credentials: "include"
        });

        if (response.ok) {
            window.location.href = "/task9/task9-login.html";
        }

    } catch (error) {
        console.error(error);
    }
});