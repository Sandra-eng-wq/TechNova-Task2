document
    .getElementById("register-form")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const username =
            document.getElementById("username").value;

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        const role =
            document.getElementById("role").value;

        try {

            const response = await fetch(
                "/task11/api/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password,
                        role: role
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                alert(result.error || "Registration failed");
                return;
            }

            alert(result.message || "Registration successful");

            window.location.href =
                "/task11/task11-login.html";

        } catch (error) {

            console.error(error);

            alert("Could not connect to the server.");
        }
    });