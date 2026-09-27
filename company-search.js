const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("status-filter");
const serviceFilter = document.getElementById("service-filter");

const searchButton = document.getElementById("search-button");
const clearButton = document.getElementById("clear-button");

const resultsContainer = document.getElementById("results-container");
const message = document.getElementById("message");


async function loadServices() {

    try {

        const response = await fetch("/api/services", {
            credentials: "include"
        });

        const services = await response.json();

        if (!response.ok) {
            return;
        }

        services.forEach(function(service) {

            const option = document.createElement("option");

            option.value = service.title;
            option.textContent = service.title;

            serviceFilter.appendChild(option);

        });

    } catch (error) {

        console.log(error);

    }
}


async function searchRequests() {

    const search = searchInput.value;
    const status = statusFilter.value;
    const service = serviceFilter.value;

    try {

        const url =
           `/api/request-search?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&service=${encodeURIComponent(service)}`;

        const response = await fetch(url, {
            credentials: "include"
        });

        const result = await response.json();

        if (!response.ok) {

            message.textContent =
                result.error || "Unable to search requests.";

            return;
        }

        resultsContainer.innerHTML = "";

        if (result.length === 0) {

            message.textContent = "No requests found.";

            return;
        }

        message.textContent =
            `${result.length} request(s) found.`;

        result.forEach(function(request) {

            const card = document.createElement("div");

            card.className = "request-card";

            card.innerHTML = `
                <h3>Request #${request.id}</h3>

                <p>
                    <strong>User ID:</strong>
                    ${request.user_id}
                </p>

                <p>
                    <strong>Service:</strong>
                    ${request.service}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${request.description}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${request.status}
                </p>

                <p>
                    <strong>Created:</strong>
                    ${request.created_at}
                </p>
            `;

            resultsContainer.appendChild(card);

        });

    } catch (error) {

        console.log(error);

        message.textContent =
            "Something went wrong.";

    }
}


searchButton.addEventListener("click", function() {

    searchRequests();

});


clearButton.addEventListener("click", function() {

    searchInput.value = "";

    statusFilter.value = "";

    serviceFilter.value = "";

    resultsContainer.innerHTML = "";

    message.textContent = "";

    searchRequests();

});


loadServices();

searchRequests();