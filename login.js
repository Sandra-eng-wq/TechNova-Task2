console.log("LOGIN JS IS WORKING");
const form = document.getElementById("login-form");

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const formMessage = document.getElementById("login-message");

    if (!username || !password) {
        formMessage.textContent = "Please fill in all fields.";
        return;
    }

    const data = {
        username: username,
        password: password
    };

    console.log(data);

    try {
        console.log("FETCH STARTED");
        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
console.log(response.ok);
console.log(result);
        if (response.ok) {
            formMessage.textContent = "Login successful!";
            form.reset();
           window.location.href="http://localhost:3000/dashboard.html";
        } else {
            formMessage.textContent = result.error || "Something went wrong";
        }

    } catch (error) {
        formMessage.textContent = "Unable to login";
    }
});