const form = document.getElementById("service-form");

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const formMessage = document.getElementById("form_response");

    const data = {
        title: title,
        description: description
    };

    try {

        const response = await fetch("/api/services", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {

            formMessage.textContent = "Service added successfully.";

            form.reset();

            loadServices();

        } else {

            formMessage.textContent =
                result.error || "Something went wrong.";
        }

    } catch (error) {

        formMessage.textContent =
            "Unable to add the service. Please try again.";
    }
});


async function loadServices() {

    try {

        const response = await fetch("/api/services");

        const services = await response.json();

        const servicesList =
            document.getElementById("services-list");

        servicesList.innerHTML = "";

        services.forEach(function(service) {

            const serviceCard =
                document.createElement("div");

            serviceCard.className = "service-card";

            serviceCard.innerHTML = `
                <h3>${service.title}</h3>

                <p>${service.description}</p>

                <button onclick="editService(${service.id})">
                    Edit
                </button>

                <button onclick="deleteService(${service.id})">
                    Delete
                </button>
            `;

            servicesList.appendChild(serviceCard);
        });

    } catch (error) {

        console.error(error);
    }
}


async function editService(id) {

    const newTitle =
        prompt("Enter the new service title:");

    const newDescription =
        prompt("Enter the new service description:");

    if (!newTitle || !newDescription) {
        return;
    }

    const data = {
        title: newTitle,
        description: newDescription
    };

    try {

        const response =
            await fetch(`/api/services/${id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            });

        const result = await response.json();

        if (response.ok) {

            alert("Service updated successfully.");

            loadServices();

        } else {

            alert(
                result.error || "Something went wrong."
            );
        }

    } catch (error) {

        alert("Unable to update the service.");
    }
}


async function deleteService(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this service?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const response =
            await fetch(`/api/services/${id}`, {

                method: "DELETE"
            });

        const result = await response.json();

        if (response.ok) {

            alert("Service deleted successfully.");

            loadServices();

        } else {

            alert(
                result.error || "Something went wrong."
            );
        }

    } catch (error) {

        alert("Unable to delete the service.");
    }
}


loadServices();