console.log("DACHBOARD JS IS WORKING");
const usernameElement = document.getElementById("username");
const emailElement = document.getElementById("email");

const editButton = document.getElementById("edit-button");
const editSection = document.getElementById("edit-section");

const editForm = document.getElementById("edit-form");

const editUsername = document.getElementById("edit-username");
const editEmail = document.getElementById("edit-email");

const message = document.getElementById("message");


// Get current user information
async function loadUser() {

    try {

        const response = await fetch(
            "http://localhost:3000/api/me",
            {
                credentials: "include"
            }
        );

        const result = await response.json();

        console.log("User data:", result);

        if (!response.ok) {

            window.location.href =
                "http://localhost:3000/login.html";

            return;
        }

        usernameElement.textContent = result.username;
        emailElement.textContent = result.email;

        editUsername.value = result.username;
        editEmail.value = result.email;

    } catch (error) {

        console.error("Error loading user:", error);

        message.textContent =
            "Unable to load your account information.";
    }
}


// Show edit section
editButton.addEventListener("click", function() {

    editSection.style.display = "block";

});


// Update user information
editForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const username = editUsername.value.trim();
    const email = editEmail.value.trim();

    if (!username || !email) {

        message.textContent =
            "Please fill in all fields.";

        return;
    }

    try {

        const response = await fetch(
            "http://localhost:3000/api/me",
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    username: username,
                    email: email
                })
            }
        );

        const result = await response.json();

        if (response.ok) {

            usernameElement.textContent =
                result.username;

            emailElement.textContent =
                result.email;

            message.textContent =
                "Your information has been updated.";

        } else {

            message.textContent =
                result.error ||
                "Unable to update your information.";
        }

    } catch (error) {

        console.error("Error updating user:", error);

        message.textContent =
            "Unable to update your information.";
    }

});


// Load user when page opens
loadUser();
console.log("LOAD USER CALLED");