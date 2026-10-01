const form = document.getElementById("login-form");
const message = document.getElementById("message");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/task9/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const result = await response.json();

        if (response.ok) {
            message.textContent = "Login successful.";

            if (result.role === "admin") {
                window.location.href = "/task9/admin.html";
            } else {
                window.location.href = "/task9/employee.html";
            }
        } else {
            message.textContent =
                result.error || "Login failed.";
        }

    } catch (error) {
        console.error(error);
        message.textContent =
            "Unable to connect to the server.";
    }
});