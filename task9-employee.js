const usernameElement =
    document.getElementById("username");

const emailElement =
    document.getElementById("email");

const roleElement =
    document.getElementById("role");

const employeeData =
    document.getElementById("employee-data");

const message =
    document.getElementById("message");

const logoutButton =
    document.getElementById("logout-button");


async function loadEmployeeData() {

    try {

        const response = await fetch(
            "http://localhost:3001/task9/api/employee-data",
            {
                credentials: "include"
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            message.textContent =
                result.error ||
                "Unable to load employee data.";

            return;

        }


        usernameElement.textContent =
            result.username;

        emailElement.textContent =
            result.email;

        roleElement.textContent =
            result.role;


        employeeData.innerHTML = `
            <div class="user-card">

                <h3>My Account</h3>

                <p>
                    <strong>User ID:</strong>
                    ${result.id}
                </p>

                <p>
                    <strong>Username:</strong>
                    ${result.username}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${result.email}
                </p>

                <p>
                    <strong>Role:</strong>
                    ${result.role}
                </p>

            </div>
        `;


    } catch (error) {

        console.log(error);

        message.textContent =
            "Something went wrong.";

    }

}


async function logout() {

    try {

        const response = await fetch(
            "http://localhost:3001/task9/api/logout",
            {
                method: "POST",
                credentials: "include"
            }
        );


        if (response.ok) {

            window.location.href =
                "http://localhost:3001/task9/task9-login.html";

        }

    } catch (error) {

        console.log(error);

    }

}


logoutButton.addEventListener(
    "click",
    logout
);
async function loadEmployeeProfile() {
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

loadEmployeeData();
loadEmployeeProfile();