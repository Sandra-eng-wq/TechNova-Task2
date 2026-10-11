console.log("TASK 10 REGISTER JS LOADED");

document
    .getElementById("register-form")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        console.log("REGISTER BUTTON WORKED");

        const username = document
            .getElementById("username")
            .value
            .trim();

        const email = document
            .getElementById("email")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value;

        try {

            const response = await fetch(
                "/task10/api/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                alert(
                    result.error ||
                    result.message ||
                    "Registration failed."
                );
                return;
            }

            alert("Registration successful.");

            window.location.href =
                "/task10/task10-login.html";

        } catch (error) {

            console.error(error);

            alert("Could not connect to the server.");
        }
    });