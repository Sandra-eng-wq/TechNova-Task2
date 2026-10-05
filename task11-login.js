document
    .getElementById("login-form")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const username =
            document.getElementById("username").value;

        const password =
            document.getElementById("password").value;

        try {

            const response = await fetch(
                "/task11/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                alert(result.error || "Login failed");
                return;
            }

            window.location.href =
                "/task11/task11-dashboard.html";

        } catch (error) {

            console.error(error);

            alert("Could not connect to the server.");
        }
    });