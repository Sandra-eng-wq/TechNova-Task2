const form = document.getElementById("register-form");
const message = document.getElementById("message");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {

        const response = await fetch(
            "/task9/api/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    username,
                    email,
                    password,
                    role
                })
            }
        );

        const result = await response.json();

        if (response.ok) {

            message.textContent =
                "Registration successful.";

            form.reset();

        } else {

            message.textContent =
                result.error || "Registration failed.";

        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to the server.";

    }

});